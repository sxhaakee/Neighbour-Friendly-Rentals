'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const ContactClient = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        type: 'general',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // WhatsApp Logic
        const text = `*New Feedback via Website* %0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Type:* ${formData.type}%0A*Message:* ${formData.message}`;
        const whatsappUrl = `https://wa.me/918746934346?text=${text}`;

        window.open(whatsappUrl, '_blank');

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        setFormData({ name: '', email: '', type: 'general', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-20 px-4 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        We're Listening
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-300"
                    >
                        Your feedback shapes the future of trust-based sharing.
                    </motion.p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                <p className="text-gray-600 mb-1">General inquiries & support:</p>
                                <a href="mailto:friendlyrentals.mlr@gmail.com" className="text-amber-600 font-medium hover:underline">
                                    friendlyrentals.mlr@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                <p className="text-gray-600 mb-1">Mon-Fri from 9am to 6pm:</p>
                                <a href="tel:+918197424986" className="text-amber-600 font-medium hover:underline">
                                    +91 81974 24986
                                </a>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Location</h3>
                                <p className="text-gray-600">
                                    Bangalore, Karnataka, India
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-amber-500" />
                            Why Feedback Matters
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            We are building this platform for YOU. Every suggestion you send is read by our founders. Whether it's a bug report, a feature request, or just saying hi — we want to hear it.
                        </p>
                    </div>
                </motion.div>

                {/* Feedback Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Feedback</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="general">General Inquiry</option>
                                <option value="suggestion">💡 Feature Suggestion</option>
                                <option value="bug">🐛 Bug Report</option>
                                <option value="praise">❤️ Praise</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="How can we improve your experience?"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white font-black py-4 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            {submitted ? (
                                <>
                                    <span>Opened in WhatsApp!</span>
                                    <span className="text-white">✓</span>
                                </>
                            ) : (
                                <>
                                    <span>Send via WhatsApp</span>
                                    <Send className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactClient;
