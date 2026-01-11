export const sendSystemNotification = (title: string, body: string, icon = '/logo.png') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon,
            badge: icon,
            vibrate: [100, 50, 100],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 1
            }
          });
        });
      } else {
        new Notification(title, {
          body,
          icon
        });
      }
    } catch (e) {
      console.error('Error sending notification:', e);
    }
  }
};

export const sendWittyEventNotification = (type: 'listing' | 'booking' | 'message') => {
  const messages = {
    listing: [
      { title: "Ka-ching! 💰", body: "Your item is live. Prepare for fame (and fortune)." },
      { title: "It's alive! 🧟", body: "Your listing is up. Now we wait for the neighbors." }
    ],
    booking: [
      { title: "It's a date! 📅", body: "Booking confirmed. Don't ghost them." },
      { title: "Secured the bag 💼", body: "Booking successful. High five! ✋" }
    ],
    message: [
      { title: "You've got mail 📬", body: "Someone slides into your DMs. Be nice." },
      { title: "Ding dong! 🔔", body: "New message. Probably asking for a discount." }
    ]
  };

  const options = messages[type];
  const random = options[Math.floor(Math.random() * options.length)];
  sendSystemNotification(random.title, random.body);
};
