import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  listing_id?: string;
  property_id?: string;
  service_id?: string;
  user_id: string;
  rating: number;
  comment?: string;
  photos?: string[];
  verified_rental: boolean;
  helpful_count: number;
  reported: boolean;
  owner_response?: string;
  owner_response_date?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ReviewInsert {
  listing_id?: string;
  property_id?: string;
  service_id?: string;
  user_id: string;
  rating: number;
  comment?: string;
  photos?: string[];
}

export const reviewService = {
  // Get reviews for an item
  async getItemReviews(itemId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('listing_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get reviews for a property
  async getPropertyReviews(propertyId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  // Get reviews for a service
  async getServiceReviews(serviceId: string): Promise<Review[]> {
    const { data, error} = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create review
  async createReview(review: ReviewInsert): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update review
  async updateReview(id: string, updates: Partial<ReviewInsert>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete review
  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add owner response
  async addOwnerResponse(id: string, response: string): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        owner_response: response,
        owner_response_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark review as helpful
  async markHelpful(reviewId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('review_helpful_votes')
      .insert({ review_id: reviewId, user_id: userId });

    if (error) throw error;
  },

  // Remove helpful vote
  async removeHelpful(reviewId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('review_helpful_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Check if user voted review as helpful
  async hasVotedHelpful(reviewId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Report review
  async reportReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .update({ reported: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Get average rating
  async getAverageRating(type: 'item' | 'property' | 'service', id: string) {
    const column = type === 'item' ? 'listing_id' : type === 'property' ? 'property_id' : 'service_id';
    
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq(column, id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / data.length;

    return {
      average: Math.round(average * 10) / 10,
      count: data.length,
    };
  },
};
