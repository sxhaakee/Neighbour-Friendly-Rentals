import { supabase } from '../lib/supabase';

export interface ServiceProvider {
  id: string;
  business_name: string;
  category: string;
  subcategories: string[];
  description: string;
  tagline?: string;
  services: string[];
  pricing_model: 'per-event' | 'per-hour' | 'per-day' | 'package' | 'custom';
  base_price?: number;
  price_range_min?: number;
  price_range_max?: number;
  city: string;
  state: string;
  service_areas: string[];
  latitude?: number;
  longitude?: number;
  owner_id: string;
  contact_person: string;
  phone: string;
  email: string;
  whatsapp?: string;
  website?: string;
  logo_url?: string;
  images: string[];
  portfolio_images: string[];
  // Social Media Links
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  video_url?: string;
  years_experience?: number;
  team_size?: number;
  equipment_owned: string[];
  certifications: string[];
  rating: number;
  total_bookings: number;
  completed_bookings: number;
  views_count: number;
  verified: boolean;
  business_license?: string;
  gst_number?: string;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceBooking {
  id: string;
  service_provider_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  event_duration_hours?: number;
  event_location: string;
  venue_name?: string;
  guest_count?: number;
  requirements: string;
  special_requests?: string;
  services_requested: string[];
  quoted_price?: number;
  final_price?: number;
  advance_paid: number;
  payment_status: 'pending' | 'advance-paid' | 'completed' | 'refunded';
  status: 'inquiry' | 'quote-sent' | 'negotiating' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  agreement_url?: string;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceProviderFilters {
  status?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  serviceAreas?: string[];
  verified?: boolean;
  searchQuery?: string;
}

class ServiceProviderService {
  // Get ALL service providers (for admin)
  async getAllProviders(filters?: ServiceProviderFilters): Promise<ServiceProvider[]> {
    try {
      let query = supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all service providers:', error);
      return [];
    }
  }

  // Get all approved service providers
  async getApprovedProviders(filters?: ServiceProviderFilters): Promise<ServiceProvider[]> {
    try {
      let query = supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.minPrice) {
          query = query.gte('price_range_min', filters.minPrice);
        }
        if (filters.maxPrice) {
          query = query.lte('price_range_max', filters.maxPrice);
        }
        if (filters.verified !== undefined) {
          query = query.eq('verified', filters.verified);
        }
        if (filters.searchQuery) {
          query = query.or(`business_name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  }

  // Get service provider by ID
  async getProviderById(id: string): Promise<ServiceProvider | null> {
    try {
      // Add timestamp to bust cache
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', id)
        .single()
        .then(result => {
          // Force fresh data by adding cache-busting
          if (result.data) {
            console.log('Fresh service data fetched:', result.data);
          }
          return result;
        });

      if (error) throw error;

      // Increment view count
      if (data) {
        await this.incrementViews(id);
      }

      return data;
    } catch (error) {
      console.error('Error fetching service provider:', error);
      throw error;
    }
  }

  // Get providers by owner
  async getOwnerProviders(ownerId: string): Promise<ServiceProvider[]> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false});

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching owner providers:', error);
      throw error;
    }
  }

  // Create new service provider
  async createProvider(provider: Omit<ServiceProvider, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_bookings' | 'completed_bookings' | 'views_count'>): Promise<ServiceProvider> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .insert([provider])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating service provider:', error);
      throw error;
    }
  }

  // Update service provider
  async updateProvider(id: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider> {
    try {
      const { data, error} = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating service provider:', error);
      throw error;
    }
  }

  // Toggle featured status (admin only)
  async toggleFeatured(id: string, featured: boolean): Promise<ServiceProvider> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .update({ featured })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  // Delete service provider
  async deleteProvider(id: string): Promise<void> {
    try {
      // First, get the service provider to access its images
      const { data: provider } = await supabase
        .from('service_providers')
        .select('images, portfolio_images, logo_url')
        .eq('id', id)
        .single();

      // Delete all images from storage
      if (provider) {
        const allImages = [
          ...(provider.images || []),
          ...(provider.portfolio_images || []),
          ...(provider.logo_url ? [provider.logo_url] : [])
        ];

        for (const imageUrl of allImages) {
          try {
            // Extract path from URL
            const path = imageUrl.split('/services/')[1];
            if (path) {
              await supabase.storage.from('services').remove([path]);
            }
          } catch (imgError) {
            console.error('Error deleting image:', imgError);
            // Continue even if image deletion fails
          }
        }
      }

      // Delete the service provider from database
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting service provider:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    try {
      const { data: provider } = await supabase
        .from('service_providers')
        .select('views_count')
        .eq('id', id)
        .single();

      if (provider) {
        await supabase
          .from('service_providers')
          .update({ views_count: (provider.views_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Get featured providers
  async getFeaturedProviders(limit: number = 6, city?: string): Promise<ServiceProvider[]> {
    try {
      let query = supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true);

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured providers:', error);
      throw error;
    }
  }

  // Get providers by category
  async getProvidersByCategory(category: string): Promise<ServiceProvider[]> {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('status', 'approved')
        .eq('category', category)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching providers by category:', error);
      throw error;
    }
  }

  // Create service booking
  async createBooking(booking: Omit<ServiceBooking, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceBooking> {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .insert([booking])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get bookings for customer
  async getCustomerBookings(customerId: string): Promise<ServiceBooking[]> {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*, service_providers(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }

  // Get bookings for provider
  async getProviderBookings(providerId: string): Promise<ServiceBooking[]> {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .eq('service_provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      throw error;
    }
  }

  // Update booking
  async updateBooking(id: string, updates: Partial<ServiceBooking>): Promise<ServiceBooking> {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }
}

export const serviceProviderService = new ServiceProviderService();
