export interface WittyNotification {
  title: string;
  body: string;
  icon?: string;
}

export const WITTY_NOTIFICATIONS: WittyNotification[] = [
  {
    title: "Drill gone missing? 🛠️",
    body: "Just kidding. But your neighbor has one for ₹50/day. Why buy?",
  },
  {
    title: "Commitment issues? 💔",
    body: "Don't buy a DSLR. Rent it for the weekend. We won't judge.",
  },
  {
    title: "Your attic called... 📦",
    body: "It wants its space back. List that old guitar and make some cash!",
  },
  {
    title: "Feeling boujee on a budget? 💅",
    body: "Rent a luxury handbag for your date tonight. They'll never know.",
  },
  {
    title: "Wanna see a magic trick? ✨",
    body: "Post an item -> Watch it turn into money. Poof! 💸",
  },
  {
    title: "Ghosting is rude 👻",
    body: "But renting a PS5 for a week and returning it? That's just smart.",
  },
  {
    title: "Why did the ladder break up? 🪜",
    body: "It found someone more uplifting. Rent a better one nearby!",
  },
  {
    title: "Knock knock 🚪",
    body: "Who's there? A verified neighbor with the steam cleaner you need.",
  },
  {
    title: "Adulting is hard 😩",
    body: "Buying a ladder is harder. Renting one? Easy peasy.",
  },
  {
    title: "Dust bunny colony? 🐰",
    body: "Rent a vacuum cleaner. Evict them today!",
  }
];

export const getRandomNotification = (): WittyNotification => {
  const randomIndex = Math.floor(Math.random() * WITTY_NOTIFICATIONS.length);
  return WITTY_NOTIFICATIONS[randomIndex];
};
