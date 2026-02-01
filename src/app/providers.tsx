'use client';

import { useEffect } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';

import { ScrollToTop } from '@/components/ScrollToTop';
import dynamic from 'next/dynamic';

const PWAInstallPrompt = dynamic(() => import('@/components/Common/PWAInstallPrompt'), { ssr: false });

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }, []);

    return (
        <AuthProvider>
            <ScrollToTop />
            <PWAInstallPrompt />
            {children}
        </AuthProvider>
    );
}
