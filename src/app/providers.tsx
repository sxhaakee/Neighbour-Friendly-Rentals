'use client';

import { AuthProvider } from '@/contexts/AuthContext';

import { ScrollToTop } from '@/components/ScrollToTop';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ScrollToTop />
            {children}
        </AuthProvider>
    );
}
