import { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the prompt
        const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
        if (hasDismissed) return;

        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Show iOS prompt after a delay if meaningful interaction typically happens
        if (isIosDevice && !(window as any).navigator.standalone) {
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setShowPrompt(false);
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember the dismissal
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 z-50 md:bottom-8 md:right-8 md:left-auto md:max-w-md"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold text-2xl">
                                <img src="/logo.png" alt="NFR" className="w-full h-full object-cover rounded-xl" />
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">Install App</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Install NeighbourFriendly Rentals for a better experience, offline access, and faster loading.
                                </p>

                                {isIOS ? (
                                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span>1. Tap</span>
                                            <Share className="w-4 h-4 text-blue-500" />
                                            <span>button</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>2. Select</span>
                                            <PlusSquare className="w-4 h-4 text-gray-600" />
                                            <span className="font-medium">Add to Home Screen</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleInstallClick}
                                        className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Install Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
