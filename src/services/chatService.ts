import { supabase } from '../lib/supabase';

// Type definitions for chat tables
type Conversation = {
  id: string;
  listing_id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
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

      // Get the full conversation object
      const { data: conversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      return conversation;
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
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
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

    console.log('[chatService] Raw conversations data:', data);

    // Fetch profiles for each conversation
    const conversationsWithProfiles = await Promise.all(
      (data || []).map(async (convo) => {
        const otherUserId = convo.user1_id === userId ? convo.user2_id : convo.user1_id;
        
        console.log('[chatService] Fetching profile for user:', otherUserId);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherUserId)
          .single();

        if (profileError) {
          console.error('[chatService] Error fetching profile:', profileError);
        }

        console.log('[chatService] Profile data:', profile);

        return {
          ...convo,
          profiles: profile,
        };
      })
    );

    console.log('[chatService] Conversations with profiles:', conversationsWithProfiles);
    return conversationsWithProfiles;
  },

  /**
   * Get all messages for a conversation
   * @param conversationId - ID of the conversation
   * @returns Array of messages
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
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
   * @param message - Message text
   * @returns The new message object
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    message: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: message, // Changed from 'message' to 'content'
      })
      .select()
      .single();

    if (error) {
      throw error;
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
