import { supabase } from '../lib/supabase';
import { emailService } from './emailService';

export interface Property {
  id: string;
  type: 'flat' | 'house' | 'pg' | 'hostel' | 'villa' | 'commercial' | 'office' | 'shop' | 'warehouse';
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  locality?: string;
  rent_amount: number;
  deposit_amount: number;
  maintenance_charges: number;
  negotiable: boolean;
  pricing_model?: 'per_day' | 'per_week' | 'per_month' | 'per_year' | 'sale';
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  area_sqft: number;
  floor_number?: number;
  total_floors?: number;
  age_years?: number;
  furnishing?: 'furnished' | 'semi-furnished' | 'unfurnished';
  amenities: string[];
  preferred_tenants: string[];
  pets_allowed: boolean;
  non_veg_allowed: boolean;
  images: string[];
  video_url?: string;
  virtual_tour_url?: string;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  builder_id?: string;
  builder_name?: string;
  available_from: string;
  lease_duration: '11-months' | '1-year' | '2-years' | '3-years' | 'flexible';
  minimum_stay_months: number;
  status: 'pending' | 'approved' | 'rejected' | 'rented' | 'inactive';
  verified: boolean;
  featured: boolean;
  rejection_reason?: string;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyFilters {
  status?: string;
  property_type?: string;
  type?: string[];
  city?: string;
  min_price?: number;
  max_price?: number;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  furnishing?: string;
  amenities?: string[];
  availableFrom?: string;
  searchQuery?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in km
}

class PropertyService {
  // Get ALL properties (for admin)
  async getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.min_price) {
        query = query.gte('monthly_rent', filters.min_price);
      }
      if (filters?.max_price) {
        query = query.lte('monthly_rent', filters.max_price);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  }

  // Get all approved properties
  async getApprovedProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.type && filters.type.length > 0) {
          query = query.in('type', filters.type);
        }
        if (filters.city) {
          query = query.ilike('city', `%${filters.city}%`);
        }
        if (filters.minRent) {
          query = query.gte('rent_amount', filters.minRent);
        }
        if (filters.maxRent) {
          query = query.lte('rent_amount', filters.maxRent);
        }
        if (filters.bedrooms) {
          query = query.eq('bedrooms', filters.bedrooms);
        }
        if (filters.furnishing) {
          query = query.eq('furnishing', filters.furnishing);
        }
        if (filters.searchQuery) {
          query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,locality.ilike.%${filters.searchQuery}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  // Get property by ID
  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count
      if (data) {
        await this.incrementViews(id);
      }

      return data as unknown as Property;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  // Get properties by owner
  async getOwnerProperties(ownerId: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching owner properties:', error);
      throw error;
    }
  }

  // Create new property
  async createProperty(property: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'inquiries_count'>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single();

      if (error) throw error;

      // Send confirmation email
      emailService.sendListingConfirmation({
        email: property.owner_email,
        userName: property.owner_name,
        itemType: 'Property',
        itemTitle: property.title,
        price: property.rent_amount,
        listingUrl: `${window.location.origin}/properties/${data.id}`
      });

      // Send witty notification
      import('../utils/notificationUtils').then(({ sendWittyEventNotification }) => {
        sendWittyEventNotification('listing');
      });

      return data as unknown as Property;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  // Update property
  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Property;
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  }

  // Toggle featured status (admin only)
  async toggleFeatured(id: string, featured: boolean): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ featured } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Property;
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  }

  // Delete property
  async deleteProperty(id: string): Promise<void> {
    try {
      // First, get the property to access its images
      const { data: property } = await supabase
        .from('properties')
        .select('images')
        .eq('id', id)
        .single();

      // Delete all images from storage
      if (property?.images && property.images.length > 0) {
        for (const imageUrl of property.images) {
          try {
            // Extract path from URL
            const path = imageUrl.split('/property-images/')[1];
            if (path) {
              await supabase.storage.from('property-images').remove([path]);
            }
          } catch (imgError) {
            console.error('Error deleting image:', imgError);
            // Continue even if image deletion fails
          }
        }
      }

      // Delete the property from database
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  }

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    try {
      // Direct update without RPC (simpler and more reliable)
      const { data: property } = await supabase
        .from('properties')
        .select('views_count')
        .eq('id', id)
        .single();

      if (property) {
        await supabase
          .from('properties')
          .update({ views_count: (property.views_count || 0) + 1 } as any)
          .eq('id', id);
      }
    } catch (error) {
      // Silently fail - view count is not critical
      console.debug('View count update skipped:', error);
    }
  }

  // Get featured properties
  async getFeaturedProperties(limit: number = 6, city?: string): Promise<Property[]> {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true);

      if (city) {
          query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw error;
    }
  }

  // Search properties by location (within radius)
  async searchByLocation(latitude: number, longitude: number, radiusKm: number = 10): Promise<Property[]> {
    try {
      // Using Haversine formula for distance calculation
      const { data, error } = await supabase.rpc('search_properties_by_location' as any, {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm
      });

      if (error) {
        // Fallback: get all properties and filter client-side
        const allProperties = await this.getApprovedProperties();
        return allProperties.filter(property => {
          if (!property.latitude || !property.longitude) return false;
          const distance = this.calculateDistance(
            latitude,
            longitude,
            property.latitude,
            property.longitude
          );
          return distance <= radiusKm;
        });
      }

      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error searching by location:', error);
      throw error;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get properties by city
  async getPropertiesByCity(city: string): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .ilike('city', `%${city}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching properties by city:', error);
      throw error;
    }
  }

  // Get trending properties in a city
  async getTrendingProperties(city: string, limit: number = 10): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .ilike('city', `%${city}%`)
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as Property[];
    } catch (error) {
      console.error('Error fetching trending properties:', error);
      throw error;
    }
  }
}

export const propertyService = new PropertyService();
