'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the prompt
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }

        setDeferredPrompt(null);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-4 md:w-96"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 p-5 relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-100 rounded-full opacity-50 blur-xl"></div>

                        <button
                            onClick={() => setShowPrompt(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-3 rounded-xl shadow-lg shrink-0 text-white">
                                <Smartphone className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 mb-1">Install App</h3>
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                    Install NFR for a better experience with quick access and offline features.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowPrompt(false)}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        Later
                                    </button>
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-black rounded-xl hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Install
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
