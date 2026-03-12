
import { supabase } from '../lib/supabase';

// Type definitions for chat tables
type Conversation = {
  id: string;
  listing_id: string | null;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean | null;
  created_at: string | null;
};

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export const chatService = {
  /**
   * Get or create a conversation for a listing
   * @param listingId - ID of the listing
   * @param buyerId - ID of the buyer
   * @param sellerId - ID of the seller
   * @returns Conversation object
   */
  async getOrCreateConversation(
    listingId: string,
    user1Id: string,
    user2Id: string
  ): Promise<Conversation> {
    try {
      // Use RPC function to get or create conversation
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_listing_id: listingId,
        p_user1_id: user1Id,
        p_user2_id: user2Id,
      });

      if (error) throw error;

      // Get the full conversation object with explicit fields
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('id, listing_id, user1_id, user2_id, last_message, last_message_at, created_at, updated_at')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      return conversation as Conversation;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for a user
   * @param userId - ID of the user
   * @returns Array of conversations
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    console.log('[chatService] Fetching conversations for user:', userId);
    
    // Fetch conversations with listing info and profiles joined from public_profiles
    // Note: We use user1_id.eq.${userId} OR user2_id.eq.${userId}
    // We can't easily join the "other" user profile in a single query with OR in Supabase
    // So we fetch conversations first, then fetch all unique "other" profiles in one batch
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        listing_id,
        user1_id,
        user2_id,
        last_message,
        last_message_at,
        created_at,
        updated_at,
        listings:listing_id (
          title,
          images
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[chatService] Error fetching conversations:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    // Get all unique other user IDs
    const otherUserIds = Array.from(new Set(
      data.map(convo => convo.user1_id === userId ? convo.user2_id : convo.user1_id)
    ));

    // Fetch all profiles in one batch
    const { data: profiles, error: profileError } = await supabase
      .from('public_profiles' as any)
      .select('id, full_name, avatar_url')
      .in('id', otherUserIds);

    if (profileError) {
      console.error('[chatService] Error fetching batch profiles:', profileError);
    }

    // Map profiles back to conversations
    const profileMap = new Map((profiles as unknown as PublicProfile[] || []).map(p => [p.id, p]));

    const conversationsWithProfiles = data.map(convo => {
      const otherUserId = convo.user1_id === userId ? convo.user2_id : convo.user1_id;
      return {
        ...convo,
        profiles: profileMap.get(otherUserId) || null
      };
    });

    return conversationsWithProfiles as unknown as Conversation[];
  },

  /**
   * Get all messages for a conversation
   * @param conversationId - ID of the conversation
   * @returns Array of messages
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, receiver_id, content, read, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  },

  /**
   * Send a new message
   * @param conversationId - ID of the conversation
   * @param senderId - ID of the sender
   * @param receiverId - ID of the receiver
   * @param message - Message text
   * @returns The new message object
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<Message> {
    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: message,
      })
      .select('id, conversation_id, sender_id, receiver_id, content, read, created_at')
      .single();

    if (error) {
      throw error;
    }

    // Update conversation's last_message and last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // Create notification for the receiver
    try {
      const { notificationService } = await import('./notificationService');
      const { data: sender } = await supabase
        .from('public_profiles' as any)
        .select('full_name')
        .eq('id', senderId)
        .single();

      const senderName = (sender as any)?.full_name || 'User';

      await notificationService.createNotification({
        user_id: receiverId,
        type: 'message',
        title: `New message from ${senderName}`,
        message: message.length > 50 ? message.substring(0, 47) + '...' : message,
        link: `/chat?conversation=${conversationId}`,
        data: { conversation_id: conversationId, sender_id: senderId }
      });
    } catch (notifErr) {
      console.error('Error creating message notification:', notifErr);
    }

    return data;
  },

  /**
   * Subscribe to new messages in a conversation
   * @param conversationId - ID of the conversation
   * @param callback - Function to call with new message
   * @returns Subscription object
   */
  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Mark messages as read
   * @param conversationId - ID of the conversation
   * @param userId - ID of the user reading the messages
   */
  async markAsRead(conversationId: string, userId: string) {
    await supabase
      .from('messages')
      .update({ read: true }) // Changed from 'is_read' to 'read'
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  },
};
