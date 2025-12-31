import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Smartphone, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

type AuthMode = 'login' | 'signup' | 'phone' | 'otp' | 'forgot';

const Login = () => {
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signInWithOtp,
    verifyOtp,
    resetPassword
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    otp: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { error } = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
      if (error) {
        showToast.error(error.message);
      }
    } catch (err) {
      showToast.error('An error occurred during social sign in');
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
        if (error) setError(error.message);
        else navigate('/dashboard');
      }
      else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
        } else if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
        } else {
          const { error } = await signUp(formData.email, formData.password, formData.name);
          if (error) setError(error.message);
          else {
            showToast.success('✅ Account created! Check your email to verify.');
            setMode('login');
          }
        }
      }
      else if (mode === 'phone') {
        const { error } = await signInWithOtp(formData.phone);
        if (error) setError(error.message);
        else {
          showToast.success('OTP sent to your phone!');
          setMode('otp');
        }
      }
      else if (mode === 'otp') {
        const { error } = await verifyOtp(formData.phone, formData.otp);
        if (error) setError(error.message);
        else navigate('/dashboard');
      }
      else if (mode === 'forgot') {
        const { error } = await resetPassword(formData.email);
        if (error) setError(error.message);
        else {
          showToast.success('Password reset link sent to your email!');
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
      case 'phone':
        return (
          <div className="space-y-5">
            <div className="relative group">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                placeholder="Phone Number (with +91)"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        );
      case 'otp':
        return (
          <div className="space-y-5">
            <div className="relative group">
              <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => setMode('phone')} className="w-full text-center text-sm font-bold text-amber-600">
              Resend OTP
            </button>
          </div>
        );
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
            <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm font-bold text-amber-600">
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
                <button type="button" onClick={() => setMode('forgot')} className="text-sm font-bold text-amber-600 hover:underline">
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
      <div className="w-full lg:w-[40%] relative flex items-center justify-center p-6 lg:p-12 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'New here?' : mode === 'phone' ? 'Phone Login' : mode === 'otp' ? 'Validate OTP' : 'Reset Password'}
              </h2>
              <p className="text-gray-500">
                {mode === 'login' ? 'Sign in to continue your journey.' : mode === 'signup' ? 'Join the community today.' : 'Fast and secure access.'}
              </p>
            </div>

            {/* Social & Alternative Auth */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleSocialSignIn('google')} className="flex items-center justify-center h-14 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </button>
                <button onClick={() => handleSocialSignIn('apple')} className="flex items-center justify-center h-14 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.95-2.04 1.72-3.11 1.72-1.28 0-1.66-.78-3.23-.78s-2.01.75-3.23.75c-1.12 0-2.33-.87-3.32-2.11C2.12 17.58 1.02 14.7 1.02 12.16c0-4.07 2.66-6.22 5.22-6.22 1.34 0 2.61.93 3.43.93.81 0 2.15-.98 3.61-.83 1.29.07 2.47.62 3.2 1.63-2.69 1.58-2.25 5.25.43 6.45-.63 1.58-1.44 3.12-2.45 4.14zM12.03 5.43c-.02-2.12 1.75-3.9 3.84-4.04.13 2.11-1.85 4.09-3.84 4.04z" />
                  </svg>
                </button>
                <button onClick={() => setMode('phone')} className="flex items-center justify-center h-14 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                  <Phone className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-gray-300 uppercase tracking-widest leading-none">Or continue with</span>
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
                onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
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

export default Login;