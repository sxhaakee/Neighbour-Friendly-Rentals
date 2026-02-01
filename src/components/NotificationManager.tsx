'use client';

import { useEffect, useState } from 'react';
import { getRandomNotification } from '../data/wittyNotifications';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { sendSystemNotification, sendWittyEventNotification } from '../utils/notificationUtils';
import { registerServiceWorker, requestNotificationPermission } from '../utils/serviceWorkerUtils';

export const NotificationManager = () => {
    const { user } = useAuth();
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        const initializeNotifications = async () => {
            // Register service worker first
            const registration = await registerServiceWorker();
            setSwRegistration(registration);

            if (!('Notification' in window)) {
                console.log('This browser does not support desktop notifications');
                return;
            }

            // Request permission
            const permission = await requestNotificationPermission();

            if (permission === 'granted') {
                // Check if we already welcomed them this session
                const welcomed = sessionStorage.getItem('nfr_welcomed');
                if (!welcomed) {
                    // Send welcome notification
                    sendSystemNotification(
                        'Welcome to NFR! 🏠',
                        'Get ready for some neighborly love (and witty updates).',
                        '/logo.png'
                    );
                    sessionStorage.setItem('nfr_welcomed', 'true');
                }
            } else {
                console.log('Notification permission denied');
            }
        };

        initializeNotifications();

        // Realtime Subscription for Messages
        let subscription: any = null;
        if (user) {
            subscription = supabase
                .channel('public:messages')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `receiver_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('New message received:', payload);
                        sendWittyEventNotification('message');
                    }
                )
                .subscribe((status) => {
                    console.log('Subscription status:', status);
                });
        }

        // Set up a random interval to show witty notifications
        const interval = setInterval(() => {
            if (Notification.permission === 'granted' && document.hidden) {
                if (Math.random() > 0.7) {
                    const note = getRandomNotification();
                    sendSystemNotification(note.title, note.body, note.icon);
                }
            }
        }, 60 * 60 * 1000); // Check every hour

        // Also trigger one after 15 seconds of first load
        const initialTimer = setTimeout(() => {
            if (Notification.permission === 'granted') {
                const note = getRandomNotification();
                sendSystemNotification(note.title, note.body, note.icon);
            }
        }, 15000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimer);
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [user]);

    return null; // Renderless component
};
