import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, User, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { listingService } from '../services/listingService';
import { showToast } from '../utils/toast';

type Conversation = {
  id: string;
  listing_id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  listings?: {
    title: string;
    images: string[];
  } | null;
  profiles?: {
    full_name: string;
    avatar_url: string;
  } | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
    
    // Check if we need to create a new conversation from URL params
    const listingId = searchParams.get('listing');
    if (listingId) {
      initializeConversationFromListing(listingId);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      const subscription = chatService.subscribeToMessages(
        selectedConversation.id,
        (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
        }
      );
      return () => subscription.unsubscribe();
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await chatService.getUserConversations(user.id);
      // This is a simplified version. A real app would join profiles and listings.
      setConversations(data as any);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeConversationFromListing = async (listingId: string) => {
    if (!user) return;
    
    try {
      // Fetch the listing to get owner info
      const listing = await listingService.getListingById(listingId);
      
      if (!listing) {
        showToast.error("Listing not found");
        return;
      }
      
      // Type assertion for listing
      const typedListing = listing as any;
      
      if (typedListing.owner_id === user.id) {
        showToast.error("You can't message yourself!");
        return;
      }
      
      // Get or create conversation
      const conversation = await chatService.getOrCreateConversation(
        listingId,
        user.id,
        typedListing.owner_id
      );
      
      // Refresh conversations and select the new one
      await fetchConversations();
      setSelectedConversation(conversation as any);
      showToast.success('Conversation started!');
    } catch (error) {
      console.error('Error initializing conversation:', error);
      showToast.error('Failed to start conversation. Please try again.');
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    try {
      const data = await chatService.getMessages(selectedConversation.id);
      setMessages(data);
      if (user) {
        await chatService.markAsRead(selectedConversation.id, user.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await chatService.sendMessage(
        selectedConversation.id,
        user.id,
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-xl text-gray-600">Your conversations with other users</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg h-[70vh] flex">
          {/* Sidebar */}
          <div className={`w-full lg:w-1/3 border-r border-gray-200 ${selectedConversation ? 'hidden lg:block' : 'block'}`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(70vh-65px)]">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200 ${
                    selectedConversation?.id === convo.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <p className="font-semibold">{convo.profiles?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-600 truncate">{convo.last_message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`w-full lg:w-2/3 flex flex-col ${selectedConversation ? 'block' : 'hidden lg:flex'}`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                  <button onClick={() => setSelectedConversation(null)} className="lg:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <User className="w-8 h-8 rounded-full bg-gray-200 p-1" />
                  <div>
                    <p className="font-semibold">{selectedConversation.profiles?.full_name || 'User'}</p>
                    <Link to={`/item/${selectedConversation.listing_id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      View Listing
                    </Link>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-primary-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                <div>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
