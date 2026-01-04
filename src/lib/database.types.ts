export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          location: string
          latitude: number | null
          longitude: number | null
          images: string[]
          owner_id: string
          owner_name: string
          contact_info: string
          availability: string
          featured: boolean
          status: string
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          category: string
          condition: string
          location: string
          latitude?: number | null
          longitude?: number | null
          images: string[]
          owner_id: string
          owner_name: string
          contact_info: string
          availability?: string
          featured?: boolean
          status?: string
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          category?: string
          condition?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          images?: string[]
          owner_id?: string
          owner_name?: string
          contact_info?: string
          availability?: string
          featured?: boolean
          status?: string
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          listing_id: string
          renter_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          payment_status: string
          platform_commission: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          renter_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
          payment_status?: string
          platform_commission?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          renter_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
          payment_status?: string
          platform_commission?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          user_name: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          user_name?: string
          rating?: number
          comment?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          address: string
          is_admin: boolean
          role: string
          is_premium: boolean
          premium_expires_at: string | null
          id_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          email?: string
          phone?: string
          address?: string
          is_admin?: boolean
          role?: string
          is_premium?: boolean
          premium_expires_at?: string | null
          id_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          address?: string
          is_admin?: boolean
          role?: string
          is_premium?: boolean
          premium_expires_at?: string | null
          id_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          type: string
          title: string
          description: string
          address: string
          city: string
          state: string
          pincode: string
          latitude: number | null
          longitude: number | null
          rent_amount: number
          deposit_amount: number
          area_sqft: number
          owner_id: string
          status: string
          featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          description: string
          address: string
          city: string
          state: string
          pincode: string
          latitude?: number | null
          longitude?: number | null
          rent_amount: number
          deposit_amount: number
          area_sqft: number
          owner_id: string
          status?: string
          featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          description?: string
          address?: string
          city?: string
          state?: string
          pincode?: string
          latitude?: number | null
          longitude?: number | null
          rent_amount?: number
          deposit_amount?: number
          area_sqft?: number
          owner_id?: string
          status?: string
          featured?: boolean
          created_at?: string
        }
      }
      rental_agreements: {
        Row: {
          id: string
          booking_id: string
          listing_id: string
          renter_id: string
          owner_id: string
          renter_name: string
          renter_email: string
          renter_phone: string
          owner_name: string
          owner_email: string
          owner_phone: string
          item_title: string
          item_description: string | null
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          security_deposit: number | null
          agreement_data: Json
          pdf_url: string | null
          status: string
          agreed_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          listing_id: string
          renter_id: string
          owner_id: string
          renter_name: string
          renter_email: string
          renter_phone: string
          owner_name: string
          owner_email: string
          owner_phone: string
          item_title: string
          item_description?: string | null
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          security_deposit?: number | null
          agreement_data: Json
          pdf_url?: string | null
          status?: string
          agreed_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          listing_id?: string
          renter_id?: string
          owner_id?: string
          renter_name?: string
          renter_email?: string
          renter_phone?: string
          owner_name?: string
          owner_email?: string
          owner_phone?: string
          item_title?: string
          item_description?: string | null
          start_date?: string
          end_date?: string
          total_days?: number
          total_price?: number
          security_deposit?: number | null
          agreement_data?: Json
          pdf_url?: string | null
          status?: string
          agreed_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      service_providers: {
        Row: {
          id: string
          business_name: string
          category: string
          description: string
          city: string
          state: string
          latitude: number | null
          longitude: number | null
          owner_id: string
          status: string
          featured: boolean
          created_at: string
          email: string
          phone: string
          contact_person: string
          whatsapp: string | null
          website: string | null
          logo_url: string | null
          images: string[]
          portfolio_images: string[]
          rating: number
          total_bookings: number
          completed_bookings: number
          views_count: number
          verified: boolean
          base_price: number | null
          price_range_min: number | null
          price_range_max: number | null
          pricing_model: string
          subcategories: string[]
          services: string[]
          service_areas: string[]
          equipment_owned: string[]
          certifications: string[]
        }
        Insert: {
          id?: string
          business_name: string
          category: string
          description: string
          city: string
          state: string
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          status?: string
          featured?: boolean
          created_at?: string
          email: string
          phone: string
          contact_person: string
          whatsapp?: string | null
          website?: string | null
          logo_url?: string | null
          images?: string[]
          portfolio_images?: string[]
          rating?: number
          total_bookings?: number
          completed_bookings?: number
          views_count?: number
          verified?: boolean
          base_price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          pricing_model?: string
          subcategories?: string[]
          services?: string[]
          service_areas?: string[]
          equipment_owned?: string[]
          certifications?: string[]
        }
        Update: {
          id?: string
          business_name?: string
          category?: string
          description?: string
          city?: string
          state?: string
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          status?: string
          featured?: boolean
          created_at?: string
          email?: string
          phone?: string
          contact_person?: string
          whatsapp?: string | null
          website?: string | null
          logo_url?: string | null
          images?: string[]
          portfolio_images?: string[]
          rating?: number
          total_bookings?: number
          completed_bookings?: number
          views_count?: number
          verified?: boolean
          base_price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          pricing_model?: string
          subcategories?: string[]
          services?: string[]
          service_areas?: string[]
          equipment_owned?: string[]
          certifications?: string[]
        }
      }
      conversations: {
        Row: {
          id: string
          listing_id: string
          user1_id: string
          user2_id: string
          last_message: string | null
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user1_id: string
          user2_id: string
          last_message?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user1_id?: string
          user2_id?: string
          last_message?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          read: boolean
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string | null
          read?: boolean
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link?: string | null
          read?: boolean
          data?: Json | null
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_id: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          type?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_conversation: {
        Args: {
          p_listing_id: string
          p_user1_id: string
          p_user2_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}