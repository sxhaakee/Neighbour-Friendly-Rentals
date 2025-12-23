import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Listing = Database['public']['Tables']['listings']['Row'];
type ListingInsert = Database['public']['Tables']['listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['listings']['Update'];

export const listingService = {
  // Get all approved listings
  async getApprovedListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all listings (admin only)
  async getAllListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get listings by status
  async getListingsByStatus(status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's listings
  async getUserListings(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single listing
  async getListingById(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create listing
  async createListing(listing: ListingInsert): Promise<Listing> {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  // Update listing
  async updateListing(id: string, updates: ListingUpdate) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Toggle featured status (admin only)
  async toggleFeatured(id: string, featured: boolean) {
    const { data, error } = await supabase
      .from('listings')
      .update({ featured })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get featured listings for home page
  async getFeaturedListings(limit: number = 6) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('featured', true)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Delete listing
  async deleteListing(id: string) {
    // First, get the listing to access its images
    const { data: listing } = await supabase
      .from('listings')
      .select('images')
      .eq('id', id)
      .single();

    // Delete all images from storage
    if (listing?.images && listing.images.length > 0) {
      for (const imageUrl of listing.images) {
        try {
          await this.deleteImage(imageUrl);
        } catch (imgError) {
          console.error('Error deleting image:', imgError);
          // Continue even if image deletion fails
        }
      }
    }

    // Delete the listing from database
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Approve listing (admin only)
  async approveListing(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Reject listing (admin only)
  async rejectListing(id: string, reason: string) {
    const { data, error } = await supabase
      .from('listings')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload images to Supabase Storage
  async uploadImages(files: File[], userId: string) {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  },

  // Delete image from storage
  async deleteImage(imageUrl: string) {
    // Extract path from URL
    const path = imageUrl.split('/listing-images/')[1];
    if (!path) return;

    const { error } = await supabase.storage
      .from('listing-images')
      .remove([path]);

    if (error) throw error;
  },

  // Search listings
  async searchListings(query: string, category?: string) {
    let queryBuilder = supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved');

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (category && category !== 'All') {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
