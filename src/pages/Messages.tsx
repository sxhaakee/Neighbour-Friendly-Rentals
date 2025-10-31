import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Package, MessageCircle, Check, CheckCheck, Search, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { supabase } from '../lib/supabase';

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

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadConversations();

    // Subscribe to conversation updates
    const conversationSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
    };
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (conversationId) {
      const convo = conversations.find(c => c.id === conversationId);
      if (convo) {
        setSelectedConversation(convo);
      }
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      const subscription = chatService.subscribeToMessages(
        selectedConversation.id,
        (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      if (!user) return;
      console.log('Loading conversations for user:', user.id);
      const data = await chatService.getUserConversations(user.id);
      console.log('Loaded conversations:', data);
      // Sort by last_message_at descending (latest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
      setConversations(sortedData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      if (user) {
        await chatService.markAsRead(conversationId, user.id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
      // Determine the receiver (the other user in the conversation)
      const receiverId = selectedConversation.user1_id === user.id 
        ? selectedConversation.user2_id 
        : selectedConversation.user1_id;
      
      // Optimistic update - add message to UI immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: messageText,
        read: false,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Send to server
      const sentMessage = await chatService.sendMessage(
        selectedConversation.id,
        user.id,
        receiverId,
        messageText
      );
      
      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? sentMessage : msg
      ));
      
      // Refresh conversations to update order
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      setNewMessage(messageText); // Restore message text
    }
  };

  const formatTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getUnreadCount = (conversationId: string) => {
    return messages.filter(msg => 
      msg.conversation_id === conversationId && 
      !msg.read && 
      msg.sender_id !== user?.id
    ).length;
  };

  const filteredConversations = conversations.filter(convo =>
    convo.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    convo.listings?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Messages
          </h1>
          <p className="text-gray-600">Chat with renters and owners</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
        >
          <div className="flex h-full">
            {/* Sidebar - Conversations List */}
            <div className={`w-full lg:w-96 border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
              {/* Search Header */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Start chatting by booking an item</p>
                    <Link
                      to="/listings"
                      className="px-6 py-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-colors"
                    >
                      Browse Items
                    </Link>
                  </div>
                ) : (
                  filteredConversations.map((convo) => {
                    const otherUser = convo.profiles;
                    const isSelected = selectedConversation?.id === convo.id;
                    
                    return (
                      <motion.div
                        key={convo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => {
                          setSelectedConversation(convo);
                          navigate(`/messages/${convo.id}`);
                        }}
                        className={`p-4 cursor-pointer transition-all border-b border-gray-50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent ${
                          isSelected ? 'bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                              {otherUser?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {otherUser?.full_name || 'User'}
                              </h3>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(convo.last_message_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {convo.last_message || 'No messages yet'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Package className="w-3 h-3" />
                              <span className="truncate">{convo.listings?.title || 'Item'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-accent/5">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          setSelectedConversation(null);
                          navigate('/messages');
                        }}
                        className="lg:hidden p-2 hover:bg-white/50 rounded-xl transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {selectedConversation.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-semibold text-gray-900">
                          {selectedConversation.profiles?.full_name || 'User'}
                        </h2>
                        <Link
                          to={`/item/${selectedConversation.listing_id}`}
                          className="text-sm text-amber-600 hover:text-amber-600/80 flex items-center gap-1 transition-colors"
                        >
                          <Package className="w-3 h-3" />
                          {selectedConversation.listings?.title || 'View Item'}
                        </Link>
                      </div>
                      <button className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50/50 to-white">
                    <AnimatePresence>
                      {messages.map((msg, index) => {
                        const isOwn = msg.sender_id === user?.id;
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                        
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isOwn && showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0">
                                {selectedConversation.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            {!isOwn && !showAvatar && <div className="w-8 mr-2" />}
                            
                            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                              <div
                                className={`px-4 py-3 rounded-2xl shadow-sm ${
                                  isOwn
                                    ? 'bg-gradient-to-br from-primary to-accent text-white rounded-br-sm'
                                    : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                                }`}
                              >
                                <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  msg.read ? (
                                    <CheckCheck className="w-3 h-3 text-amber-600" />
                                  ) : (
                                    <Check className="w-3 h-3 text-gray-400" />
                                  )
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Type your message..."
                          rows={1}
                          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                          style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-12 h-12 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500 mb-6">Choose a conversation from the list to start chatting</p>
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      <Package className="w-5 h-5" />
                      Browse Items
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Messages;
