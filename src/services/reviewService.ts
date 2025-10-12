import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

export const reviewService = {
  // Get reviews for a listing
  async getListingReviews(listingId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create review
  async createReview(review: ReviewInsert) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update review
  async updateReview(id: string, rating: number, comment: string) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete review
  async deleteReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get average rating for a listing
  async getAverageRating(listingId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('listing_id', listingId);

    if (error) throw error;

    if (data.length === 0) {
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
