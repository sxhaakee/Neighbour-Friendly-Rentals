'use client';

import { useEffect } from 'react';
import { getRandomNotification } from '../data/wittyNotifications';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { sendSystemNotification, sendWittyEventNotification } from '../utils/notificationUtils';

export const NotificationManager = () => {
    const { user } = useAuth();

    useEffect(() => {
        const requestPermission = async () => {
            if (!('Notification' in window)) {
                console.log('This browser does not support desktop notifications');
                return;
            }

            // Check if permission is already granted
            if (Notification.permission === 'granted') {
                // Check if we already welcomed them this session
                const welcomed = sessionStorage.getItem('nfr_welcomed');
                if (!welcomed) {
                    new Notification('Welcome back to NFR! 🏠', {
                        body: 'We missed you! (And so did your neighbors)',
                        icon: '/logo.png'
                    });
                    sessionStorage.setItem('nfr_welcomed', 'true');
                }
            } else if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    // Send a welcome notification
                    new Notification('Welcome to NFR! 🏠', {
                        body: 'Get ready for some neighborly love (and witty updates).',
                        icon: '/logo.png'
                    });
                    sessionStorage.setItem('nfr_welcomed', 'true');
                }
            }
        };

        requestPermission();

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
                        // Only notify if page is hidden or user is not in chat (optional)
                        // For now, always notify to be "witty"
                        sendWittyEventNotification('message');
                    }
                )
                .subscribe();
        }

        // Set up a random interval to show notifications (for demo purposes)
        const interval = setInterval(() => {
            if (Notification.permission === 'granted' && document.hidden) {
                if (Math.random() > 0.7) {
                    const note = getRandomNotification();
                    sendSystemNotification(note.title, note.body, note.icon);
                }
            }
        }, 60 * 60 * 1000); // Check every hour

        // Also trigger one after 10 seconds of first load
        const initialTimer = setTimeout(() => {
            if (Notification.permission === 'granted') {
                const note = getRandomNotification();
                sendSystemNotification(note.title, note.body, note.icon);
            }
        }, 15000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimer);
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [user]);

    return null; // Renderless component
};
