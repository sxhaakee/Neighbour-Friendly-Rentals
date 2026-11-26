# NFR Push Notifications

This document explains the push notification system implemented in the NFR (Neighbour Friendly Rentals) web application.

## Features

✅ **Service Worker Integration** - Full PWA support with offline caching
✅ **Push Notifications** - Browser push notifications for real-time updates
✅ **Witty Messages** - Fun, engaging notification messages
✅ **Real-time Events** - Instant notifications for messages, bookings, and listings
✅ **Permission Handling** - Graceful permission request flow

## Files Overview

### Core Files

1. **`/public/sw.js`** - Service Worker
   - Handles push notifications
   - Manages offline caching
   - Processes notification clicks

2. **`/public/manifest.json`** - PWA Manifest
   - Defines app metadata
   - Icons and theme colors
   - Installability configuration

3. **`/src/utils/serviceWorkerUtils.ts`** - SW Registration
   - Registers the service worker
   - Handles permission requests
   - Provides unregister utility

4. **`/src/utils/notificationUtils.ts`** - Notification Helpers
   - `sendSystemNotification()` - Sends notifications
   - `sendWittyEventNotification()` - Sends event-based witty notifications

5. **`/src/components/NotificationManager.tsx`** - Main Component
   - Manages notification lifecycle
   - Handles Supabase real-time subscriptions
   - Triggers periodic witty notifications

6. **`/src/data/wittyNotifications.ts`** - Notification Content
   - Array of witty notification messages
   - Random notification selector

## How It Works

### 1. Service Worker Registration

When the app loads, the `NotificationManager` component:
1. Registers the service worker (`/sw.js`)
2. Requests notification permission
3. Sends a welcome notification

### 2. Real-time Subscriptions

The component subscribes to Supabase real-time events:
- **Messages** - Notifies when a new message is received
- Future: Bookings, listings, etc.

### 3. Periodic Notifications

- Sends a witty notification 15 seconds after load
- Randomly sends notifications every hour (if tab is hidden)

## Permission Flow

```
User visits app
    ↓
Permission request shown
    ↓
User grants/denies
    ↓
If granted → Welcome notification
    ↓
Service worker ready
    ↓
Real-time notifications enabled
```

## Notification Types

### 1. System Notifications
Standard notifications with custom title, body, and icon.

```typescript
sendSystemNotification(
  'Title',
  'Body',
  '/logo.png'
);
```

### 2. Event Notifications
Context-aware witty notifications for specific events.

```typescript
sendWittyEventNotification('listing'); // or 'booking', 'message'
```

## Testing

### Test on Localhost

1. Run the app: `npm run dev`
2. Open in browser (HTTPS required for notifications)
3. Allow notifications when prompted
4. Check console for logs
5. Wait 15 seconds for first witty notification

### Test Real-time

1. Open app in two browsers
2. Login with different accounts
3. Send a message from one account
4. Receive notification in the other

## Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome  | ✅ Yes  | ✅ Yes |
| Firefox | ✅ Yes  | ✅ Yes |
| Safari  | ✅ Yes  | ⚠️ Limited |
| Edge    | ✅ Yes  | ✅ Yes |

**Note:** Safari on iOS has limited push notification support for web apps.

## Production Deployment

### Vercel/Netlify

No special configuration needed. The service worker and manifest are automatically served from the `/public` folder.

### Custom Deployment

Ensure:
1. HTTPS is enabled (required for push notifications)
2. Service worker is served with correct MIME type (`application/javascript`)
3. Manifest is served with correct MIME type (`application/json`)

## Debugging

### Check Service Worker Status

```javascript
navigator.serviceWorker.ready.then(reg => {
  console.log('SW registered:', reg);
});
```

### Check Permission

```javascript
console.log('Permission:', Notification.permission);
```

### Test Notification

```javascript
if (Notification.permission === 'granted') {
  new Notification('Test', { body: 'Working!' });
}
```

## Future Enhancements

- [ ] Push notification server integration
- [ ] Notification preferences in user settings
- [ ] Rich notifications with images
- [ ] Action buttons in notifications
- [ ] Notification history
- [ ] Background sync for offline messages

## Troubleshooting

### Notifications not showing?

1. Check permission: `Notification.permission`
2. Verify service worker is registered
3. Check browser console for errors
4. Ensure HTTPS (localhost is OK)

### Service worker not registering?

1. Check `/sw.js` is accessible
2. Clear browser cache
3. Check console for MIME type errors
4. Ensure SW file is in `/public` folder

## Resources

- [Web Push Notifications Guide](https://web.dev/push-notifications/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Manifest](https://web.dev/add-manifest/)
