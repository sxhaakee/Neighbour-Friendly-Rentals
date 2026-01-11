import { useEffect } from 'react';
import { getRandomNotification } from '../data/wittyNotifications';

export const NotificationManager = () => {
    useEffect(() => {
        const requestPermission = async () => {
            if (!('Notification' in window)) {
                console.log('This browser does not support desktop notifications');
                return;
            }

            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    // Send a welcome notification
                    new Notification('Welcome to NFR! 🏠', {
                        body: 'Get ready for some neighborly love (and witty updates).',
                        icon: '/logo.png'
                    });
                }
            }
        };

        requestPermission();

        // Set up a random interval to show notifications (for demo purposes)
        // In a real app, this might be triggered by events or a more complex logic
        // For now, we'll check every hour if we should show a funny message
        const interval = setInterval(() => {
            if (Notification.permission === 'granted' && document.hidden) {
                // Only show if page is hidden (background) to simulate push
                // and add some randomness so it's not exactly every hour
                if (Math.random() > 0.7) {
                    const note = getRandomNotification();
                    try {
                        // Check if service worker is ready for more robust notifications
                        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                            navigator.serviceWorker.ready.then(registration => {
                                registration.showNotification(note.title, {
                                    body: note.body,
                                    icon: '/logo.png',
                                    badge: '/logo.png',
                                    vibrate: [100, 50, 100],
                                    data: {
                                        dateOfArrival: Date.now(),
                                        primaryKey: 1
                                    }
                                });
                            });
                        } else {
                            new Notification(note.title, {
                                body: note.body,
                                icon: '/logo.png'
                            });
                        }
                    } catch (e) {
                        console.error("Error showing notification", e);
                    }
                }
            }
        }, 60 * 60 * 1000); // Check every hour

        // Also trigger one after 10 seconds of first load just to delight the user immediately (if they accepted)
        const initialTimer = setTimeout(() => {
            if (Notification.permission === 'granted') {
                const note = getRandomNotification();
                new Notification(note.title, {
                    body: note.body,
                    icon: '/logo.png'
                });
            }
        }, 15000);

        return () => {
            clearInterval(interval);
            clearTimeout(initialTimer);
        };
    }, []);

    return null; // Renderless component
};
