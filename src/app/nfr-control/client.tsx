'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Lazy import the actual admin client to avoid code splitting issues
import OriginalAdminClient from '@/app/admin/client';

/**
 * Secure Admin Client Wrapper
 * 
 * This component adds SERVER-SIDE admin verification on top of the client-side check.
 * Even if someone bypasses the client-side `isAdmin` flag, the server will reject them.
 */
const SecureAdminClient = () => {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [serverVerified, setServerVerified] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.replace('/');
            return;
        }

        // Even if client says isAdmin, verify with server
        verifyAdminOnServer();
    }, [user, authLoading]);

    const verifyAdminOnServer = async () => {
        try {
            setVerifying(true);
            setError(null);

            // Get the current session token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                setError('No active session');
                router.replace('/');
                return;
            }

            // Call our server-side verification API
            const response = await fetch('/api/admin-auth', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok || !data.isAdmin) {
                console.warn('[Security] Admin verification failed:', data.error);
                setError('Access denied. This incident has been logged.');

                // Wait 2 seconds so they see the message, then redirect
                setTimeout(() => {
                    router.replace('/');
                }, 2000);
                return;
            }

            // Server confirmed admin status!
            setServerVerified(true);
        } catch (err) {
            console.error('[Security] Admin verification error:', err);
            setError('Verification failed');
            router.replace('/');
        } finally {
            setVerifying(false);
        }
    };

    // Show loading while verifying
    if (authLoading || verifying) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0a',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#888', fontSize: 14 }}>Verifying credentials...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
            </div>
        );
    }

    // Show error
    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#0a0a0a',
                color: '#ef4444',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                    <h2 style={{ color: '#ef4444', marginBottom: 8 }}>Access Denied</h2>
                    <p style={{ color: '#888', fontSize: 14 }}>{error}</p>
                </div>
            </div>
        );
    }

    // Only render admin if server verified
    if (!serverVerified) {
        return null;
    }

    return <OriginalAdminClient />;
};

export default SecureAdminClient;
