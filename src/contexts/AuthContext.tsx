import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { emailService } from '../services/emailService';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ListingCounts {
  items: number;
  properties: number;
  services: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isPremium: boolean;
  isVerified: boolean;
  listingCounts: ListingCounts;
  canAddListing: (type: 'item' | 'property' | 'service') => boolean;
  refreshListingCounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [listingCounts, setListingCounts] = useState<ListingCounts>({
    items: 0,
    properties: 0,
    services: 0,
  });

  // Track users who already received welcome emails (prevent duplicates)
  const welcomeEmailSentRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Send welcome email ONLY when user confirms their email (not on regular login)
      // Check if this is a new user by looking at created_at OR confirmed_at timestamp
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const userCreatedAt = new Date(session.user.created_at).getTime();
        const userConfirmedAt = session.user.confirmed_at
          ? new Date(session.user.confirmed_at).getTime()
          : 0;
        const now = new Date().getTime();

        // Considered "new" if account created recently (social login)
        // OR confirmed recently (email/password signup)
        // Window: 2 minutes to allow for redirects etc.
        const isNewUser = (now - userCreatedAt < 120000) || (userConfirmedAt > 0 && now - userConfirmedAt < 120000);

        // Check if we already sent welcome email to this user
        const alreadySent = welcomeEmailSentRef.current.has(userId);

        if (isNewUser && !alreadySent) {
          const metadata = session.user.user_metadata;

          // Mark as sent BEFORE sending to prevent race conditions
          welcomeEmailSentRef.current.add(userId);

          // Send welcome email via Edge Function
          try {
            const result = await emailService.sendWelcomeEmail({
              email: session.user.email!,
              userName: metadata?.full_name || 'User',
              dashboardUrl: `${window.location.origin}/dashboard`,
            });

            if (result.success) {
              console.log('✅ Welcome email sent to new user');
            } else {
              // If failed, remove from set so we can retry
              welcomeEmailSentRef.current.delete(userId);
            }
          } catch (error) {
            console.error('Failed to send welcome email:', error);
            // If failed, remove from set so we can retry
            welcomeEmailSentRef.current.delete(userId);
          }
        } else if (alreadySent) {
          console.log('⏭️ Welcome email already sent to this user, skipping');
        }
      }

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch listing counts when profile is loaded
      await refreshListingCounts();
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshListingCounts = async () => {
    if (!user) return;

    try {
      // Fetch counts for all listing types
      const [itemsData, propertiesData, servicesData] = await Promise.all([
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        supabase.from('service_providers').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
      ]);

      setListingCounts({
        items: itemsData.count || 0,
        properties: propertiesData.count || 0,
        services: servicesData.count || 0,
      });
    } catch (error) {
      console.error('Error fetching listing counts:', error);
    }
  };

  // Check if user is premium
  const isPremium = profile?.is_premium === true &&
    (profile?.premium_expires_at === null || new Date(profile.premium_expires_at) > new Date());

  // Check if user is verified (using id_verified field from database)
  const isVerified = (profile as any)?.id_verified === true;

  // Check if user can add a listing of specific type
  const canAddListing = (type: 'item' | 'property' | 'service'): boolean => {
    if (isPremium) return true; // Premium users have unlimited listings

    const limits = {
      item: 3,
      property: 2,
      service: 2,
    };

    const currentCounts = {
      item: listingCounts.items,
      property: listingCounts.properties,
      service: listingCounts.services,
    };

    return currentCounts[type] < limits[type];
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔄 Requesting signup via Edge Function...');

      const { data, error } = await supabase.functions.invoke('handle-signup', {
        body: {
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: fullName,
            },
          }
        }
      });

      if (error) {
        console.error('Signup Edge Function error:', error);

        // Handle specific http errors slightly better
        if (error instanceof Error && error.message.includes('Edge Function returned a non-2xx status code')) {
          // We can't easily parse the JSON body from the error object thrown by supabase-js here, 
          // but often the message is generic. The function logs better info.
          // However, if we know it's a 400, it's likely user exists.
          // Let's assume generic error for now, but UI should handle it.
          return { error: { message: 'Signup failed. User may already exist or system error.' } as AuthError }
        }

        return { error: error as AuthError };
      }

      // Supabase Edge Functions invoke returns { data: response_json, error: null } if 200 OK
      // If we returned { error: 'msg' } inside the 200 response (bad practice but possible), check it.
      // But we are returning http status codes effectively now.

      if (data?.error) {
        console.error('Signup Logic error:', data.error);
        return { error: { message: data.error } as AuthError };
      }

      console.log('✅ Signup initiated via Edge Function');

      // Note: Welcome email will be sent automatically when user confirms their email
      // via the onAuthStateChange listener (SIGNED_IN event)

      // Wait a moment for database trigger to create profile
      // If trigger fails, profile will be created on first login
      return { error: null };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Requesting password reset via Edge Function...');
      const { data, error } = await supabase.functions.invoke('send-reset-password', {
        body: {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        }
      });

      if (error) throw error;

      console.log('✅ Password reset email sent via Edge Function');
      return { error: null };
    } catch (error: any) {
      console.error('Error sending reset password email:', error);
      // Fallback to default if needed, or just return error
      return { error: { message: error.message || 'Failed to send reset email' } as AuthError };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log('🔄 Requesting resend via Edge Function...');

      const { data, error } = await supabase.functions.invoke('handle-signup', {
        body: {
          email,
          resend: true // Special flag to skip creation and just send email
        }
      });

      if (error) {
        console.error('Resend Edge Function error:', error);
        return { error: error as AuthError };
      }

      if (data?.error) {
        console.error('Resend Logic error:', data.error);
        return { error: { message: data.error } as AuthError };
      }

      console.log('✅ Resend successful via Edge Function');
      return { error: null };
    } catch (error) {
      console.error('Resend exception:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    resendVerificationEmail,
    signOut,
    refreshProfile,
    isAdmin,
    isPremium,
    isVerified,
    listingCounts,
    canAddListing,
    refreshListingCounts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
