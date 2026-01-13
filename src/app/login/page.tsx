'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/utils/toast';
import { supabase } from '@/lib/supabase';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

    const {
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        resendVerificationEmail,
    } = useAuth();

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    // Update mode if URL param changes
    useEffect(() => {
        const modeParam = searchParams.get('mode') as AuthMode;
        if (modeParam && ['login', 'signup', 'forgot'].includes(modeParam)) {
            setMode(modeParam);
        }
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const updateMode = (newMode: AuthMode) => {
        setMode(newMode);
        // Optional: Update URL without full reload
        const newUrl = newMode === 'login' ? '/login' : `/login?mode=${newMode}`;
        window.history.pushState({}, '', newUrl);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                showToast.error(error.message);
            }
        } catch (err) {
            showToast.error('An error occurred during Google sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'login') {
                const { error } = await signIn(formData.email, formData.password);
                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        setError("Email not verified. Please check your inbox.");
                        showToast.error(
                            <div>
                                Email not verified.
                                <button
                                    onClick={() => {
                                        resendVerificationEmail(formData.email);
                                        showToast.success("Verification email resent!");
                                    }}
                                    className="underline ml-2 font-bold"
                                >
                                    Resend Link
                                </button>
                            </div>
                            , { autoClose: 10000 });
                    } else {
                        setError(error.message);
                    }
                }
                else router.push('/dashboard');
            }
            else if (mode === 'signup') {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                } else if (formData.password.length < 6) {
                    setError('Password must be at least 6 characters');
                } else {
                    console.log('📝 Attempting signup for:', formData.email);
                    const { error } = await signUp(formData.email, formData.password, formData.name);

                    if (error) {
                        console.error('❌ Signup error:', error);
                        setError(error.message);
                    } else {
                        console.log('✅ Signup successful');

                        // Check if we have an active session (Email Confirmation Disabled)
                        const { data: { session } } = await supabase.auth.getSession();

                        if (session) {
                            showToast.success('✅ Account created! Welcome to the neighbourhood!');
                            router.push('/dashboard');
                        } else {
                            // Email Confirmation Enabled
                            showToast.success('✅ Account created! Please check your email to verify.');
                            setMode('login');
                        }
                    }
                }
            }
            else if (mode === 'forgot') {
                console.log('🔐 Attempting password reset for:', formData.email);
                const { error } = await resetPassword(formData.email);

                if (error) {
                    console.error('❌ Password reset error:', error);
                    setError(error.message);
                } else {
                    console.log('✅ Password reset email sent successfully');
                    showToast.success('Password reset link sent! Check your email (and spam folder).');
                    setMode('login');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (mode) {
            case 'forgot':
                return (
                    <div className="space-y-5">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <button type="button" onClick={() => updateMode('login')} className="w-full text-center text-sm font-bold text-amber-600">
                            Back to Login
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="space-y-5">
                        {mode === 'signup' && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                    placeholder="Full Name"
                                    required
                                />
                            </div>
                        )}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                placeholder="Password"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {mode === 'signup' && (
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                                    placeholder="Confirm Password"
                                    required
                                />
                            </div>
                        )}
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button type="button" onClick={() => updateMode('forgot')} className="text-sm font-bold text-amber-600 hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50">
                            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Left Side - Brand Showcase */}
            <div className="hidden lg:flex lg:w-[60%] relative bg-gray-900 overflow-hidden text-white flex-col justify-center p-16">
                <div className="absolute inset-0 z-0">
                    <img src="/images/neighbours-bg.png" alt="Neighbourhood" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/40 to-amber-900/30"></div>
                </div>
                <div className="relative z-10 max-w-lg">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl font-black mb-6 leading-tight">
                        Welcome to your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Neighbourhood</span>
                    </motion.h1>
                    <p className="text-gray-300 text-xl leading-relaxed font-medium">Join thousands of verified neighbors sharing resources and building stronger communities.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[40%] relative flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                {mode === 'login' ? 'Enter your neighbourhood' : mode === 'signup' ? 'Join your neighbourhood' : 'Reset Password'}
                            </h2>
                            <p className="text-gray-500">
                                {mode === 'login' ? 'Sign in to continue your journey.' : mode === 'signup' ? 'Create an account to get started.' : 'Enter your email to reset password.'}
                            </p>
                        </div>

                        {/* Social & Alternative Auth */}
                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full h-14 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md disabled:opacity-50 relative overflow-hidden group"
                            >
                                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="relative z-10">Continue with Google</span>
                            </button>

                            <div className="relative flex items-center">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink mx-4 text-xs font-bold text-gray-300 uppercase tracking-widest leading-none">Or continue with email</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                                    {error}
                                </div>
                            )}
                            {renderForm()}
                        </form>

                        <p className="text-center text-gray-500 text-sm">
                            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                            <button
                                onClick={() => updateMode(mode === 'signup' ? 'login' : 'signup')}
                                className="font-bold text-amber-600 hover:text-amber-700 transition-all"
                            >
                                {mode === 'signup' ? 'Sign in' : 'Create Account'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
}
