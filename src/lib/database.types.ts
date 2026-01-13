export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blocked_users: {
        Row: {
          id: string
          user_id: string
          blocked_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blocked_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blocked_user_id?: string
          created_at?: string
        }
        Relationships: []
      },
      activity_feed: {
        Row: {
          action: string
          created_at: string | null
          id: string
          target_id: string | null
          target_title: string | null
          type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_title?: string | null
          type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          listing_id: string | null
          service_id: string | null
          property_id: string | null
          user_id: string
          user_name: string
          rating: number
          comment: string | null
          created_at: string | null
          updated_at: string | null
          owner_response: string | null
          owner_response_date: string | null
          reported: boolean | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          service_id?: string | null
          property_id?: string | null
          user_id: string
          user_name: string
          rating: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
          owner_response?: string | null
          owner_response_date?: string | null
          reported?: boolean | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          service_id?: string | null
          property_id?: string | null
          user_id?: string
          user_name?: string
          rating?: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
          owner_response?: string | null
          owner_response_date?: string | null
          reported?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      review_helpful_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          listing_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          status: string | null
          payment_status: string | null
          payment_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          renter_name: string
          renter_email: string
          platform_commission: number | null
          item_price: number | null
          created_at: string | null
          updated_at: string | null
          renter_address: string | null
          rejection_reason: string | null
          payment_method: string | null
          renter_phone: string | null
          confirmed_at: string | null
          delivery_charge: number | null
          security_deposit: number | null
        }
        Insert: {
          id?: string
          listing_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          status?: string | null
          payment_status?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          renter_name: string
          renter_email: string
          platform_commission?: number | null
          item_price?: number | null
          created_at?: string | null
          updated_at?: string | null
          confirmed_at?: string | null
          delivery_charge?: number | null
          security_deposit?: number | null
        }
        Update: {
          id?: string
          listing_id?: string
          renter_id?: string
          owner_id?: string
          start_date?: string
          end_date?: string
          total_days?: number
          total_price?: number
          status?: string | null
          payment_status?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          renter_name?: string
          renter_email?: string
          platform_commission?: number | null
          item_price?: number | null
          created_at?: string | null
          updated_at?: string | null
          confirmed_at?: string | null
          delivery_charge?: number | null
          security_deposit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          listing_id: string | null
          user1_id: string
          user2_id: string
          last_message: string | null
          last_message_at: string | null
          created_at: string | null
          updated_at: string | null
          user1_typing: boolean | null
          user2_typing: boolean | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          user1_id: string
          user2_id: string
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          user1_typing?: boolean | null
          user2_typing?: boolean | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          user1_id?: string
          user2_id?: string
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          user1_typing?: boolean | null
          user2_typing?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          }
        ]
      },
      favorites: {
        Row: {
          id: string
          user_id: string
          type: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          item_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      payments: {
        Row: {
          id: string
          user_id: string
          razorpay_payment_id: string | null
          razorpay_order_id: string | null
          amount: number
          currency: string
          status: string
          created_at: string
          updated_at: string
          description: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount: number
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
          description?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          razorpay_payment_id?: string | null
          razorpay_order_id?: string | null
          amount?: number
          currency?: string
          status?: string
          created_at?: string
          updated_at?: string
          description?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          price: number
          location: string
          condition: string
          contact_info: string
          availability: string | null
          owner_id: string
          owner_name: string
          owner_email: string
          images: string[] | null
          status: string
          rejection_reason: string | null
          created_at: string | null
          updated_at: string | null
          featured: boolean | null
          pricing_model: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          price: number
          location: string
          condition: string
          contact_info: string
          availability?: string | null
          owner_id: string
          owner_name: string
          owner_email: string
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
          featured?: boolean | null
          pricing_model?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          price?: number
          location?: string
          condition?: string
          contact_info?: string
          availability?: string | null
          owner_id?: string
          owner_name?: string
          owner_email?: string
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
          featured?: boolean | null
          pricing_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean | null
          link: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean | null
          link?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean | null
          link?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_bookings: {
        Row: {
          id: string
          property_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string | null
          payment_status: string | null
          payment_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          renter_name: string
          renter_email: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          property_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string | null
          payment_status?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          renter_name: string
          renter_email: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          renter_id?: string
          owner_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string | null
          payment_status?: string | null
          payment_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          renter_name?: string
          renter_email?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      service_bookings: {
        Row: {
          id: string
          service_provider_id: string
          customer_id: string
          customer_name: string
          customer_phone: string
          customer_email: string
          event_type: string
          event_date: string
          event_time: string | null
          event_duration_hours: number | null
          event_location: string
          venue_name: string | null
          guest_count: number | null
          requirements: string
          special_requests: string | null
          services_requested: string[]
          quoted_price: number | null
          final_price: number | null
          advance_paid: number
          payment_status: "pending" | "advance-paid" | "completed" | "refunded"
          status: "inquiry" | "quote-sent" | "negotiating" | "confirmed" | "in-progress" | "completed" | "cancelled" | "disputed"
          agreement_url: string | null
          terms_accepted: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          service_provider_id: string
          customer_id: string
          customer_name: string
          customer_phone: string
          customer_email: string
          event_type: string
          event_date: string
          event_time?: string | null
          event_duration_hours?: number | null
          event_location: string
          venue_name?: string | null
          guest_count?: number | null
          requirements: string
          special_requests?: string | null
          services_requested: string[]
          quoted_price?: number | null
          final_price?: number | null
          advance_paid?: number
          payment_status?: "pending" | "advance-paid" | "completed" | "refunded"
          status?: "inquiry" | "quote-sent" | "negotiating" | "confirmed" | "in-progress" | "completed" | "cancelled" | "disputed"
          agreement_url?: string | null
          terms_accepted: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          service_provider_id?: string
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          event_type?: string
          event_date?: string
          event_time?: string | null
          event_duration_hours?: number | null
          event_location?: string
          venue_name?: string | null
          guest_count?: number | null
          requirements?: string
          special_requests?: string | null
          services_requested?: string[]
          quoted_price?: number | null
          final_price?: number | null
          advance_paid?: number
          payment_status?: "pending" | "advance-paid" | "completed" | "refunded"
          status?: "inquiry" | "quote-sent" | "negotiating" | "confirmed" | "in-progress" | "completed" | "cancelled" | "disputed"
          agreement_url?: string | null
          terms_accepted?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      },
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          location: string | null
          address: string | null
          role: string
          is_admin: boolean | null
          is_premium: boolean | null
          premium_expires_at: string | null
          premium_plan: string | null
          premium_payment_id: string | null
          id_verified: boolean | null
          id_verification_status: string | null
          id_document_type: string | null
          id_document_number: string | null
          id_document_url: string | null
          id_verified_at: string | null
          id_rejection_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          address?: string | null
          role?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          premium_payment_id?: string | null
          id_verified?: boolean | null
          id_verification_status?: string | null
          id_document_type?: string | null
          id_document_number?: string | null
          id_document_url?: string | null
          id_verified_at?: string | null
          id_rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          location?: string | null
          address?: string | null
          role?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          premium_expires_at?: string | null
          premium_plan?: string | null
          premium_payment_id?: string | null
          id_verified?: boolean | null
          id_verification_status?: string | null
          id_document_type?: string | null
          id_document_number?: string | null
          id_document_url?: string | null
          id_verified_at?: string | null
          id_rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          type: string
          rent_amount: number | null
          deposit_amount: number | null
          maintenance_charges: number | null
          negotiable: boolean | null
          bedrooms: number | null
          bathrooms: number | null
          balconies: number | null
          area_sqft: number | null
          furnishing_status: string | null
          images: string[] | null
          status: string
          rejection_reason: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          pricing_model: string | null
          views_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          type: string
          rent_amount?: number | null
          deposit_amount?: number | null
          maintenance_charges?: number | null
          negotiable?: boolean | null
          bedrooms?: number | null
          bathrooms?: number | null
          balconies?: number | null
          area_sqft?: number | null
          furnishing_status?: string | null
          views_count?: number | null
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          type?: string
          rent_amount?: number | null
          deposit_amount?: number | null
          maintenance_charges?: number | null
          negotiable?: boolean | null
          bedrooms?: number | null
          bathrooms?: number | null
          balconies?: number | null
          area_sqft?: number | null
          furnishing_status?: string | null
          views_count?: number | null
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      rental_agreements: {
        Row: {
          id: string;
          booking_id: string;
          listing_id: string;
          renter_id: string;
          owner_id: string;
          renter_name: string;
          renter_email: string;
          renter_phone: string;
          owner_name: string;
          owner_email: string;
          owner_phone: string;
          item_title: string;
          item_description: string | null;
          start_date: string;
          end_date: string;
          total_days: number;
          total_price: number;
          security_deposit: number | null;
          agreement_data: any;
          pdf_url: string | null;
          status: "active" | "completed" | "cancelled" | "disputed";
          agreed_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        }
        Insert: {
          id?: string;
          booking_id: string;
          listing_id: string;
          renter_id: string;
          owner_id: string;
          renter_name: string;
          renter_email: string;
          renter_phone: string;
          owner_name: string;
          owner_email: string;
          owner_phone: string;
          item_title: string;
          item_description?: string | null;
          start_date: string;
          end_date: string;
          total_days: number;
          total_price: number;
          security_deposit?: number | null;
          agreement_data: any;
          pdf_url?: string | null;
          status?: "active" | "completed" | "cancelled" | "disputed";
          agreed_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
        Update: {
          id?: string;
          booking_id?: string;
          listing_id?: string;
          renter_id?: string;
          owner_id?: string;
          renter_name?: string;
          renter_email?: string;
          renter_phone?: string;
          owner_name?: string;
          owner_email?: string;
          owner_phone?: string;
          item_title?: string;
          item_description?: string | null;
          start_date?: string;
          end_date?: string;
          total_days?: number;
          total_price?: number;
          security_deposit?: number | null;
          agreement_data?: any;
          pdf_url?: string | null;
          status?: "active" | "completed" | "cancelled" | "disputed";
          agreed_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        }
        Relationships: []
      },
      revenue_tracking: {
        Row: {
          id: string
          revenue_type: string
          amount: number
          user_id: string | null
          booking_id: string | null
          description: string | null
          payment_id: string | null
          payment_status: string | null
          listing_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          revenue_type: string
          amount: number
          user_id?: string | null
          booking_id?: string | null
          description?: string | null
          payment_id?: string | null
          payment_status?: string | null
          listing_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          revenue_type?: string
          amount?: number
          user_id?: string | null
          booking_id?: string | null
          description?: string | null
          payment_id?: string | null
          payment_status?: string | null
          listing_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_tracking_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          id: string
          business_name: string
          category: string
          subcategories: string[] | null
          description: string
          tagline: string | null
          services: string[] | null
          pricing_model: "per-event" | "per-hour" | "per-day" | "package" | "custom"
          base_price: number | null
          price_range_min: number | null
          price_range_max: number | null
          city: string
          state: string
          service_areas: string[] | null
          latitude: number | null
          longitude: number | null
          owner_id: string
          contact_person: string
          phone: string
          email: string
          whatsapp: string | null
          website: string | null
          logo_url: string | null
          images: string[] | null
          portfolio_images: string[] | null
          instagram_url: string | null
          facebook_url: string | null
          youtube_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          website_url: string | null
          video_url: string | null
          years_experience: number | null
          team_size: number | null
          equipment_owned: string[] | null
          certifications: string[] | null
          rating: number | null
          total_bookings: number | null
          completed_bookings: number | null
          views_count: number | null
          verified: boolean | null
          business_license: string | null
          gst_number: string | null
          featured: boolean | null
          status: "pending" | "approved" | "rejected" | "inactive" | "hidden"
          rejection_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_name: string
          category: string
          subcategories?: string[] | null
          description: string
          tagline?: string | null
          services?: string[] | null
          pricing_model: "per-event" | "per-hour" | "per-day" | "package" | "custom"
          base_price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          city: string
          state: string
          service_areas?: string[] | null
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          contact_person: string
          phone: string
          email: string
          whatsapp?: string | null
          website?: string | null
          logo_url?: string | null
          images?: string[] | null
          portfolio_images?: string[] | null
          instagram_url?: string | null
          facebook_url?: string | null
          youtube_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          video_url?: string | null
          years_experience?: number | null
          team_size?: number | null
          equipment_owned?: string[] | null
          certifications?: string[] | null
          rating?: number | null
          total_bookings?: number | null
          completed_bookings?: number | null
          views_count?: number | null
          verified?: boolean | null
          business_license?: string | null
          gst_number?: string | null
          featured?: boolean | null
          status?: "pending" | "approved" | "rejected" | "inactive" | "hidden"
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_name?: string
          category?: string
          subcategories?: string[] | null
          description?: string
          tagline?: string | null
          services?: string[] | null
          pricing_model?: "per-event" | "per-hour" | "per-day" | "package" | "custom"
          base_price?: number | null
          price_range_min?: number | null
          price_range_max?: number | null
          city?: string
          state?: string
          service_areas?: string[] | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          contact_person?: string
          phone?: string
          email?: string
          whatsapp?: string | null
          website?: string | null
          logo_url?: string | null
          images?: string[] | null
          portfolio_images?: string[] | null
          instagram_url?: string | null
          facebook_url?: string | null
          youtube_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          video_url?: string | null
          years_experience?: number | null
          team_size?: number | null
          equipment_owned?: string[] | null
          certifications?: string[] | null
          rating?: number | null
          total_bookings?: number | null
          completed_bookings?: number | null
          views_count?: number | null
          verified?: boolean | null
          business_license?: string | null
          gst_number?: string | null
          featured?: boolean | null
          status?: "pending" | "approved" | "rejected" | "inactive" | "hidden"
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      scheduled_emails: {
        Row: {
          id: string
          user_id: string
          email: string
          template: string
          subject: string
          scheduled_for: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          template: string
          subject: string
          scheduled_for: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          template?: string
          subject?: string
          scheduled_for?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      user_reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id: string
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string
          reason?: string
          created_at?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never