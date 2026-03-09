'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChatService } from '../services/aiChatService';

import { useAuth } from '@/contexts/AuthContext';

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

// Ensure SpeechRecognition is typed
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);

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
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
          // Auto-send after voice input
          setTimeout(() => handleSendMessage(transcript), 500);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "👋 Hi! I'm your NeighbourFriendly assistant.\n\nI can speak! Tap the microphone to talk to me, or type below. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      speakText(welcomeMessage.text);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);

      // Try to find if user selected a language via Google Translate cookie
      let lang = 'en-US';
      const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
      if (match && match[1]) {
        const langMap: Record<string, string> = {
          'hi': 'hi-IN', 'kn': 'kn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN', 'bn': 'bn-IN', 'gu': 'gu-IN'
        };
        lang = langMap[match[1]] || 'en-US';
      }

      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
      }
    }
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Strip emojis for cleaner reading
    // Strip markdown, URLs, brackets, emojis, and special formatting for natural speech
    const cleanText = text
      .replace(/\\*\\*(.*?)\\*\\*/g, '$1') // Remove bold asterisks but keep text
      .replace(/\\*(.*?)\\*/g, '$1')       // Remove italic asterisks but keep text
      .replace(/#(.*?)\\n/g, '$1\\n')      // Remove header hashes
      .replace(/\\[(.*?)\\]\\(.*?\\)/g, '$1') // Remove markdown links but keep the anchor text
      .replace(/<[^>]*>?/gm, '')         // Remove HTML tags
      .replace(/([\\u2700-\\u27BF]|[\\uE000-\\uF8FF]|\\uD83C[\\uDC00-\\uDFFF]|\\uD83D[\\uDC00-\\uDFFF]|[\\u2011-\\u26FF]|\\uD83E[\\uDD10-\\uDDFF])/g, '') // Strip emojis
      .replace(/[\\*_~`>\\[\\]()]/g, '')     // Strip miscellaneous markdown/syntax characters
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster for conversational feel

    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (overrideText?: string) => {
    const messageText = overrideText || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiChatService.sendMessage(messageText, user?.id);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      speakText(botResponse.text);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      speakText(errorResponse.text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'browse': message = 'How do I browse listings?'; break;
      case 'search': message = 'How do I search for items?'; break;
      case 'list': message = 'How do I list an item?'; break;
      case 'pricing': message = 'What are the pricing details?'; break;
      case 'properties': message = 'How do I find properties?'; break;
      case 'services': message = 'How do I find services?'; break;
    }
    handleSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
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
                  <p className="text-xs text-white/80">Voice & Text Enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled) window.speechSynthesis.cancel();
                  }}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                  title={voiceEnabled ? "Mute Voice" : "Enable Voice"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    aiChatService.clearHistory();
                    setMessages([{
                      id: Date.now().toString(),
                      text: "Chat history cleared. How else can I help you?",
                      sender: 'bot',
                      timestamp: new Date()
                    }]);
                  }}
                  className="hover:bg-white/20 px-2 py-1 rounded text-xs transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="bg-amber-500 text-white p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                  <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 ${message.sender === 'user'
                        ? 'bg-amber-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <div className="bg-gray-300 text-gray-600 p-1.5 sm:p-2 rounded-full h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-amber-500 text-white p-2 rounded-full h-8 w-8 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-3 sm:px-4 py-3 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-10">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Suggested</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 border border-amber-200/50 text-amber-700 px-3 py-1.5 rounded-full transition-all hover:scale-105"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListen}
                  className={`p-2.5 rounded-full transition-all flex-shrink-0 ${isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title={isListening ? "Stop listening" : "Tap and speak"}
                >
                  {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2.5 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
