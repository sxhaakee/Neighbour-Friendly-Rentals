'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Crown,
    Check,
    Zap,
    TrendingUp,
    Shield,
    Star,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { showToast } from '@/utils/toast';

const PremiumClient = () => {
    const router = useRouter();
    const { user, profile, isPremium, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const plans = {
        monthly: {
            price: 49,
            period: 'month',
            savings: 0,
            total: 49
        },
        yearly: {
            price: 499,
            period: 'year',
            savings: 89,
            total: 499,
            monthlyEquivalent: 42
        }
    };

    const benefits = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Unlimited Listings',
            description: 'List as many items, properties, and services as you want'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Featured Placement',
            description: '2x more visibility with featured spots on homepage and categories'
        },
        {
            icon: <Star className="w-6 h-6" />,
            title: 'Reduced Service Fee',
            description: 'Pay only 15% instead of 20% on all bookings'
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Verified Badge',
            description: 'Stand out with a premium verified badge on all your listings'
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: 'Priority Support',
            description: 'Get help faster with dedicated priority customer support'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Advanced Analytics',
            description: 'Track views, bookings, and revenue with detailed insights'
        }
    ];

    const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
        if (!user || !profile) {
            showToast.error('Please login to upgrade');
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            // Import Razorpay service dynamically
            const { default: razorpayService } = await import('@/services/razorpayService');

            // Process payment through Razorpay
            const result = await razorpayService.processPremiumPayment(
                user.id,
                user.email || profile.email || '',
                profile.full_name || 'User',
                profile.phone || '',
                plan
            );

            if (result.success) {
                // Refresh profile multiple times to ensure update
                await refreshProfile();

                // Wait a bit and refresh again to ensure database has updated
                setTimeout(async () => {
                    await refreshProfile();
                }, 1000);

                showToast.success('🎉 Welcome to Premium! Enjoy unlimited listings!');

                // Navigate to dashboard and force a page reload to ensure fresh data
                setTimeout(() => {
                    router.push('/dashboard');
                    window.location.reload();
                }, 1500);
            } else {
                showToast.error(result.error || 'Payment failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Error upgrading to premium:', error);
            showToast.error('Failed to process payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl p-12"
                    >
                        <Crown className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            You're Already Premium! 👑
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Enjoy all the premium benefits and unlimited listings!
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
                        <Crown className="w-5 h-5" />
                        <span className="font-semibold">Upgrade to Premium</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Unlock Your Full Potential
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get unlimited listings, featured placement, and exclusive benefits to grow your rental business faster
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    {/* Monthly Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`relative bg-white rounded-2xl shadow-lg p-8 cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'ring-4 ring-purple-500 scale-105' : 'hover:shadow-xl'
                            }`}
                        onClick={() => setSelectedPlan('monthly')}
                    >
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-bold text-gray-900">₹{plans.monthly.price}</span>
                                <span className="text-gray-600">/month</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUpgrade('monthly')}
                            disabled={loading}
                            className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Yearly Plan (Recommended) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`relative bg-gradient-to-br from-purple-600 to-yellow-500 rounded-2xl shadow-xl p-8 cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'ring-4 ring-yellow-400 scale-105' : 'hover:shadow-2xl'
                            }`}
                        onClick={() => setSelectedPlan('yearly')}
                    >
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                                SAVE ₹{plans.yearly.savings}
                            </span>
                        </div>
                        <div className="text-center mb-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">Yearly</h3>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-5xl font-bold">₹{plans.yearly.price}</span>
                                <span className="text-white/80">/year</span>
                            </div>
                            <p className="text-white/90 mt-2">Only ₹{plans.yearly.monthlyEquivalent}/month</p>
                        </div>
                        <button
                            onClick={() => handleUpgrade('yearly')}
                            disabled={loading}
                            className="w-full bg-white text-purple-600 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            ) : (
                                <>
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </motion.div>
                </div>

                {/* Benefits Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-5xl mx-auto"
                >
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Everything You Need to Succeed
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="text-purple-600 mb-4">{benefit.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-4xl mx-auto mt-16"
                >
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                        Free vs Premium
                    </h2>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-purple-600">Premium</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Item Listings</td>
                                    <td className="px-6 py-4 text-center text-gray-600">3</td>
                                    <td className="px-6 py-4 text-center text-purple-600 font-bold">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Property Listings</td>
                                    <td className="px-6 py-4 text-center text-gray-600">2</td>
                                    <td className="px-6 py-4 text-center text-purple-600 font-bold">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Service Listings</td>
                                    <td className="px-6 py-4 text-center text-gray-600">2</td>
                                    <td className="px-6 py-4 text-center text-purple-600 font-bold">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Service Fee</td>
                                    <td className="px-6 py-4 text-center text-gray-600">20%</td>
                                    <td className="px-6 py-4 text-center text-purple-600 font-bold">15%</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Featured Placement</td>
                                    <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                    <td className="px-6 py-4 text-center text-amber-600">✓</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Verified Badge</td>
                                    <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                    <td className="px-6 py-4 text-center text-amber-600">✓</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Priority Support</td>
                                    <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                    <td className="px-6 py-4 text-center text-amber-600">✓</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-gray-900">Advanced Analytics</td>
                                    <td className="px-6 py-4 text-center text-gray-400">✗</td>
                                    <td className="px-6 py-4 text-center text-amber-600">✓</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <div className="bg-gradient-to-r from-purple-600 to-yellow-500 rounded-2xl p-12 text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Grow Your Business?
                        </h2>
                        <p className="text-xl mb-8 text-white/90">
                            Join hundreds of successful renters earning more with Premium
                        </p>
                        <button
                            onClick={() => handleUpgrade(selectedPlan)}
                            disabled={loading}
                            className="bg-white text-purple-600 px-12 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            ) : (
                                <>
                                    Upgrade Now
                                    <Crown className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PremiumClient;
