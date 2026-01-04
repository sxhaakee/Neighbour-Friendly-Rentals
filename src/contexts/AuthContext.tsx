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
      // Check if this is a new user by looking at created_at timestamp
      if (event === 'SIGNED_IN' && session?.user) {
        const userId = session.user.id;
        const userCreatedAt = new Date(session.user.created_at);
        const now = new Date();
        const timeSinceCreation = now.getTime() - userCreatedAt.getTime();
        const isNewUser = timeSinceCreation < 60000; // Less than 1 minute old = new user

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      // Note: Welcome email will be sent automatically when user confirms their email
      // via the onAuthStateChange listener (SIGNED_IN event)

      // Wait a moment for database trigger to create profile
      // If trigger fails, profile will be created on first login
      return { error: null };
    } catch (error) {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      return { error };
    } catch (error) {
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
