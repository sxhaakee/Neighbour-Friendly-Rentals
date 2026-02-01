import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastContainer } from '@/components/Common/Toast';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { AIChatbot } from '@/components/AIChatbot';
import FAB from '@/components/Common/FAB';
import { NotificationManager } from '@/components/NotificationManager';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'NFR - India\'s #1 P2P Rental Marketplace | Borrow, Rent & Share',
    description: 'Neighbour Friendly Rentals (NFR) - India\'s most trusted P2P rental marketplace. Rent professional cameras near me, power tools for rent, luxury clothes rent near me, and household item rentals from verified neighbours.',
    keywords: 'rental near me, clothes rent near me, item rental, property rentals near me, rent camera bangalore, power tool rentals near me, p2p sharing, neighbour friendly rentals, NFR app',
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://neighbourfriendly.in/',
        siteName: 'NeighbourFriendly | Neighbour Friendly Rentals',
        images: [
            {
                url: 'https://neighbourfriendly.in/og-image.png',
                width: 1200,
                height: 630,
                alt: 'NeighbourFriendly Rentals',
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#f59e0b" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="NFR" />
                <link rel="apple-touch-icon" href="/logo.png" />
            </head>
            <body className={inter.className}>
                <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-yellow-50/30">
                    {/* 
                AuthProvider usually uses Context and hooks, so it must be a Client Component.
                However, wrapping children here means children can be Server Components unless AuthProvider enforces otherwise.
                We'll need to check if AuthProvider is marked 'use client'.
                If not, we might need a separate 'Providers' component.
             */}
                    <Providers>
                        <Header />
                        <main className="pt-16">
                            {children}
                        </main>
                        <Footer />
                        <FAB />
                        <AIChatbot />
                        <ToastContainer />
                        <NotificationManager />
                        <Analytics />
                    </Providers>
                </div>
            </body>
        </html>
    );
}

// Temporary Providers component to handle client-side context
// We will move this to a separate file `src/app/providers.tsx` ideally, 
// but for inline simplicity:
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for client components if they cause SSR issues, 
// but AuthProvider is context so it should be fine if it has "use client"
import ClientProviders from './providers';
function Providers({ children }: { children: ReactNode }) {
    return <ClientProviders>{children}</ClientProviders>;
}
