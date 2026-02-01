'use client';

import { useEffect, useState } from 'react';
import { sendSystemNotification, sendWittyEventNotification } from '@/utils/notificationUtils';
import { registerServiceWorker, requestNotificationPermission } from '@/utils/serviceWorkerUtils';

// Force dynamic rendering to avoid SSR issues with browser APIs
export const dynamic = 'force-dynamic';

export default function NotificationTestPage() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [swRegistered, setSwRegistered] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (message: string) => {
        setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPermission(Notification.permission);
        }
    }, []);

    const handleRequestPermission = async () => {
        addLog('Requesting notification permission...');
        const result = await requestNotificationPermission();
        setPermission(result);
        addLog(`Permission result: ${result}`);
    };

    const handleRegisterSW = async () => {
        addLog('Registering service worker...');
        const registration = await registerServiceWorker();
        if (registration) {
            setSwRegistered(true);
            addLog('Service worker registered successfully!');
        } else {
            addLog('Failed to register service worker');
        }
    };

    const handleSendBasic = () => {
        addLog('Sending basic notification...');
        sendSystemNotification(
            'Test Notification 🧪',
            'This is a test notification from NFR!',
            '/logo.png'
        );
    };

    const handleSendWitty = () => {
        addLog('Sending witty notification...');
        const types: ('listing' | 'booking' | 'message')[] = ['listing', 'booking', 'message'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        sendWittyEventNotification(randomType);
        addLog(`Sent ${randomType} notification`);
    };

    const handleSendCustom = () => {
        addLog('Sending custom notification...');
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('NFR Custom Notification 🎨', {
                    body: 'This notification was sent at ' + new Date().toLocaleTimeString(),
                    icon: '/logo.png',
                    badge: '/logo.png',
                    tag: 'custom-test',
                    actions: [
                        { action: 'open', title: 'View App', icon: '/logo.png' },
                        { action: 'close', title: 'Dismiss', icon: '/logo.png' }
                    ]
                } as any);
            });
        } else {
            new Notification('NFR Custom Notification 🎨', {
                body: 'This notification was sent at ' + new Date().toLocaleTimeString(),
                icon: '/logo.png'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🔔 Notification Test Center
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Test the push notification system for NFR
                    </p>

                    {/* Status Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">System Status</h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Browser Support:</span>
                                <span className={`font-semibold ${typeof window !== 'undefined' && 'Notification' in window ? 'text-green-600' : 'text-red-600'}`}>
                                    {typeof window !== 'undefined' && 'Notification' in window ? '✅ Supported' : '❌ Not Supported'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Permission Status:</span>
                                <span className={`font-semibold ${permission === 'granted' ? 'text-green-600' :
                                    permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                    {permission === 'granted' ? '✅ Granted' :
                                        permission === 'denied' ? '❌ Denied' : '⚠️ Not Requested'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700">Service Worker:</span>
                                <span className={`font-semibold ${swRegistered ? 'text-green-600' : 'text-gray-400'}`}>
                                    {swRegistered ? '✅ Registered' : '⏳ Not Registered'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Setup Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">1. Setup</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleRequestPermission}
                                disabled={permission === 'granted'}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Request Permission
                            </button>
                            <button
                                onClick={handleRegisterSW}
                                disabled={swRegistered}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Register Service Worker
                            </button>
                        </div>
                    </div>

                    {/* Test Notifications Section */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">2. Send Test Notifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleSendBasic}
                                disabled={permission !== 'granted'}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                📢 Basic Notification
                            </button>
                            <button
                                onClick={handleSendWitty}
                                disabled={permission !== 'granted'}
                                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                😄 Witty Notification
                            </button>
                            <button
                                onClick={handleSendCustom}
                                disabled={permission !== 'granted'}
                                className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                🎨 Custom Notification
                            </button>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
                        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
                            {log.length === 0 ? (
                                <p className="text-gray-500">No activity yet. Start by requesting permission...</p>
                            ) : (
                                log.map((entry, index) => (
                                    <div key={index} className="mb-1">
                                        {entry}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                        <h3 className="font-semibold text-blue-900 mb-2">📋 Testing Steps:</h3>
                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                            <li>Click "Request Permission" and allow notifications</li>
                            <li>Click "Register Service Worker"</li>
                            <li>Try each notification button to test different types</li>
                            <li>Check your browser's notification area to see them!</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
