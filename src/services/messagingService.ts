import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean | null;
  created_at: string | null;
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  };
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string | null;
  last_message_at?: string | null;
  user1_typing: boolean | null;
  user2_typing: boolean | null;
  created_at: string | null;
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  };
}

export const messagingService = {
  // Get or create conversation
  async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
    // Check if conversation exists
    const { data: existing, error: fetchError } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id, last_message, last_message_at, user1_typing, user2_typing, created_at')
      .or(`and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`)
      .single();

    if (existing) return existing as unknown as Conversation;

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user1_id: userId1,
        user2_id: userId2,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id, last_message, last_message_at, user1_typing, user2_typing, created_at')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    if (!conversations) return [];

    // Fetch profiles for all unique users involved
    const userIds = Array.from(new Set(
      conversations.flatMap(c => [c.user1_id, c.user2_id])
    )).filter(id => id !== userId);

    if (userIds.length === 0) return conversations as unknown as Conversation[];

    const { data: profiles, error: profileError } = await (supabase
      .from('public_profiles' as any)
      .select('id, full_name, avatar_url')
      .in('id', userIds) as any);

    if (profileError) console.error('Error fetching profiles:', profileError);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // Map to include other_user
    return conversations.map((conv: any) => {
      const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
      return {
        ...conv,
        other_user: profileMap.get(otherUserId) || { id: otherUserId, full_name: 'User' },
      };
    });
  },

  // Get conversation messages
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, receiver_id, content, read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!messages) return [];

    // Fetch unique sender profiles
    const senderIds = Array.from(new Set(messages.map(m => m.sender_id)));
    
    const { data: profiles, error: profileError } = await supabase
      .from('public_profiles' as any)
      .select('id, full_name, avatar_url')
      .in('id', senderIds);

    if (profileError) console.error('Error fetching sender profiles:', profileError);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return messages.map((msg: any) => ({
      ...msg,
      sender: profileMap.get(msg.sender_id),
    })) as Message[];
  },

  // Send message
  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string, imageUrl?: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return data as unknown as Message;
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  // Set typing indicator
  async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const { data: conv } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (!conv) return;

    const field = conv.user1_id === userId ? 'user1_typing' : 'user2_typing';
    
    const { error } = await supabase
      .from('conversations')
      .update({ [field]: isTyping })
      .eq('id', conversationId);

    if (error) throw error;
  },

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Subscribe to conversation messages
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Subscribe to typing indicators
  subscribeToTyping(conversationId: string, callback: (isTyping: boolean) => void) {
    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          const conv = payload.new as any;
          callback(conv.user1_typing || conv.user2_typing);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Block user
  async blockUser(userId: string, blockedUserId: string): Promise<void> {
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        user_id: userId,
        blocked_user_id: blockedUserId,
      });

    if (error) throw error;
  },

  // Report user
  async reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('user_reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
      });

    if (error) throw error;
  },
};
