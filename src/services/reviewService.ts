import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  listing_id: string | null;
  service_id?: string | null;
  property_id?: string | null;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
  owner_response?: string | null;
  owner_response_date?: string | null;
  reported?: boolean | null;
  verified_rental?: boolean;
  helpful_count?: number;
  user?: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
  };
}

export interface ReviewInsert {
  listing_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string | null;
}

export const reviewService = {
  // Get reviews for a listing
  async getListingReviews(listingId: string): Promise<Review[]> {
    try {
      // Fetch reviews without profiles relationship to avoid foreign key errors
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
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
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq(column, id);

      if (error) {
        // If column doesn't exist yet, return empty result
        if (error.message.includes('does not exist')) {
          console.warn(`Column ${column} does not exist in reviews table yet. Run FIX_REVIEWS_SCHEMA.sql`);
          return { average: 0, count: 0 };
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / data.length;

      return {
        average: Math.round(average * 10) / 10,
        count: data.length,
      };
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return { average: 0, count: 0 };
    }
  },
};
