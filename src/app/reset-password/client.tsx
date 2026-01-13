'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/utils/toast';

const ResetPasswordClient = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check if we have a valid session (Supabase handles the recovery link automatically)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                showToast.error('Invalid or expired reset link');
                router.push('/login');
            }
        });

        // Listen for auth state changes (in case the link sets the session after mount)
        const { data: subscription } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // User is here from a recovery link
            }
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showToast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            showToast.success('Password updated successfully! Please login.');
            await supabase.auth.signOut(); // Force re-login
            router.push('/login');
        } catch (error: any) {
            showToast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">🔐</div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Set New Password</h2>
                    <p className="text-gray-500">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                placeholder="New Password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                placeholder="Confirm New Password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 border border-transparent"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordClient;
