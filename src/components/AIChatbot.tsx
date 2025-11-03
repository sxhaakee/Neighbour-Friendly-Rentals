import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface QuickAction {
  label: string;
  action: string;
}

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: '🏠 Browse Listings', action: 'browse' },
    { label: '🔍 How to Search', action: 'search' },
    { label: '📝 List an Item', action: 'list' },
    { label: '💰 Pricing Info', action: 'pricing' },
    { label: '🏢 Find Properties', action: 'properties' },
    { label: '🛠️ Find Services', action: 'services' },
  ];

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      // Welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Hi! I'm your NeighbourFriendly assistant. I can help you:\n\n• Browse and search listings\n• List your items for rent\n• Find properties and services\n• Answer questions about the platform\n\nHow can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Navigation help
    if (lowerMessage.includes('browse') || lowerMessage.includes('see items') || lowerMessage.includes('listings')) {
      return "🔍 To browse items:\n\n1. Click 'Browse' in the navigation menu\n2. Use filters to narrow down by category, price, or location\n3. Click on any item to see full details\n\nYou can also search directly using the search bar at the top!";
    }

    if (lowerMessage.includes('search') || lowerMessage.includes('find')) {
      return "🔎 Here's how to search:\n\n1. Use the search bar at the top of the page\n2. Enter keywords (e.g., 'camera', 'drill', 'furniture')\n3. Apply filters for category, price range, and location\n4. Sort results by newest, price, or popularity\n\nTry it now by clicking 'Browse' in the menu!";
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('rent out') || lowerMessage.includes('add item')) {
      return "📝 To list your item:\n\n1. Click 'Dashboard' in the menu\n2. Click the '+' button or 'Add Listing'\n3. Fill in details: title, description, price, category\n4. Upload clear photos (up to 10)\n5. Submit for admin approval\n\nYour listing will be live once approved (usually within 24 hours)!";
    }

    if (lowerMessage.includes('property') || lowerMessage.includes('properties') || lowerMessage.includes('house') || lowerMessage.includes('apartment')) {
      return "🏢 Looking for properties?\n\n1. Click 'Properties' in the navigation menu\n2. Browse available rentals\n3. Filter by bedrooms, price, location\n4. Contact owners directly via WhatsApp\n\nWe have apartments, houses, PG accommodations, and commercial spaces!";
    }

    if (lowerMessage.includes('service') || lowerMessage.includes('services') || lowerMessage.includes('provider')) {
      return "🛠️ Need services?\n\n1. Click 'Services' in the menu\n2. Browse categories: DJ, Catering, Photography, etc.\n3. View provider profiles and portfolios\n4. Contact directly via WhatsApp\n\nAll service providers are verified!";
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
      return "💰 Pricing Information:\n\n• Listing items: FREE for basic users\n• Premium membership: ₹499/month\n  - Unlimited listings\n  - Priority support\n  - Featured listings\n  - Advanced analytics\n\n• Rental prices set by owners\n• No platform fees for renters\n• Secure payment options available";
    }

    if (lowerMessage.includes('premium') || lowerMessage.includes('upgrade')) {
      return "⭐ Premium Benefits:\n\n✅ Unlimited listings\n✅ Featured placement\n✅ Priority support\n✅ Advanced analytics\n✅ Custom branding\n✅ Early access to new features\n\nOnly ₹499/month! Click 'Upgrade to Premium' in the menu to get started.";
    }

    if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "📞 Need help?\n\n• Email: support@neighbourfriendly.com\n• WhatsApp: +91 9876543210\n• Response time: Within 24 hours\n\nYou can also check our FAQ section or use this chat for instant help!";
    }

    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "🎯 How NeighbourFriendly works:\n\n1. **List**: Post items you want to rent out\n2. **Browse**: Find items you need nearby\n3. **Connect**: Contact owners directly\n4. **Rent**: Agree on terms and rent!\n\nIt's that simple. We connect neighbors to share resources and save money!";
    }

    if (lowerMessage.includes('safe') || lowerMessage.includes('secure') || lowerMessage.includes('trust')) {
      return "🔒 Your safety matters:\n\n✅ ID verification for all users\n✅ Admin approval for listings\n✅ User ratings and reviews\n✅ Secure messaging\n✅ Report & block features\n✅ 24/7 support\n\nWe verify all listings and users to ensure a safe community!";
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "💳 Payment Options:\n\n• Direct payment to owner (recommended)\n• UPI, Bank Transfer, Cash\n• Secure escrow coming soon!\n\nPayment terms are agreed between you and the owner. We recommend using secure payment methods.";
    }

    if (lowerMessage.includes('category') || lowerMessage.includes('categories')) {
      return "📂 Available Categories:\n\n• Electronics & Cameras\n• Tools & Equipment\n• Furniture & Appliances\n• Sports & Fitness\n• Musical Instruments\n• Books & Media\n• Party & Events\n• Gaming & Consoles\n• Outdoor & Camping\n• And many more!\n\nClick 'Browse' to see all categories.";
    }

    if (lowerMessage.includes('dashboard') || lowerMessage.includes('my account')) {
      return "👤 Your Dashboard:\n\nAccess your dashboard to:\n• View your listings\n• Manage bookings\n• Edit profile\n• Check notifications\n• View analytics (Premium)\n• Upgrade account\n\nClick 'Dashboard' in the menu to access!";
    }

    // Default response
    return "I'm here to help! I can assist you with:\n\n• 🔍 Browsing and searching items\n• 📝 Listing your items\n• 🏢 Finding properties\n• 🛠️ Finding services\n• 💰 Pricing information\n• 🔒 Safety and security\n• 📞 Contact and support\n\nWhat would you like to know more about?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'browse':
        message = 'How do I browse listings?';
        break;
      case 'search':
        message = 'How do I search for items?';
        break;
      case 'list':
        message = 'How do I list an item?';
        break;
      case 'pricing':
        message = 'What are the pricing details?';
        break;
      case 'properties':
        message = 'How do I find properties?';
        break;
      case 'services':
        message = 'How do I find services?';
        break;
    }
    setInputValue(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all z-50 group"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              AI
            </span>
            <div className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Need help? Chat with AI
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs text-white/80">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="bg-amber-500 text-white p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-amber-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                    <p className="text-[10px] sm:text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="bg-gray-300 text-gray-600 p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-amber-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-3 sm:px-4 py-2 bg-white border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="text-[10px] sm:text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
