export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
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
      admin_analytics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          affiliate_id: string | null
          click_time: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          user_id: string | null
          user_agent: string | null
        }
        Insert: {
          affiliate_id?: string | null
          click_time?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string | null
          click_time?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string | null
          amount: number
          commission: number
          conversion_time: string | null
          id: string
          order_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          commission: number
          conversion_time?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          commission?: number
          conversion_time?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          code: string
          created_at: string | null
          id: string
          status: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          status?: string | null
          total_clicks?: number | null
          total_conversions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number
          booking_end: string
          booking_start: string
          created_at: string | null
          id: string
          item_id: string
          payment_id: string | null
          payment_status: string | null
          renter_id: string
          status: string | null
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_end: string
          booking_start: string
          created_at?: string | null
          id?: string
          item_id: string
          payment_id?: string | null
          payment_status?: string | null
          renter_id: string
          status?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_end?: string
          booking_start?: string
          created_at?: string | null
          id?: string
          item_id?: string
          payment_id?: string | null
          payment_status?: string | null
          renter_id?: string
          status?: string | null
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          last_message: string | null
          last_message_at: string | null
          receiver_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          receiver_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          last_message?: string | null
          last_message_at?: string | null
          receiver_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: string
          city: string | null
          condition: string
          created_at: string | null
          description: string
          featured_placement: string | null
          featured_until: string | null
          id: string
          images: string[]
          is_featured: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          lister_id: string
          price: number
          pricing_model: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          city?: string | null
          condition: string
          created_at?: string | null
          description: string
          featured_placement?: string | null
          featured_until?: string | null
          id?: string
          images: string[]
          is_featured?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          lister_id: string
          price: number
          pricing_model: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          condition?: string
          created_at?: string | null
          description?: string
          featured_placement?: string | null
          featured_until?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          lister_id?: string
          price?: number
          pricing_model?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_lister_id_fkey"
            columns: ["lister_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          id_document_number: string | null
          id_document_type: string | null
          id_document_url: string | null
          id_rejection_reason: string | null
          id_verification_status: string | null
          id_verified: boolean | null
          id_verified_at: string | null
          is_admin: boolean | null
          is_premium: boolean | null
          location: string | null
          phone: string | null
          premium_expires_at: string | null
          premium_payment_id: string | null
          premium_plan: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          id_document_number?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          id_rejection_reason?: string | null
          id_verification_status?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          is_admin?: boolean | null
          is_premium?: boolean | null
          location?: string | null
          phone?: string | null
          premium_expires_at?: string | null
          premium_payment_id?: string | null
          premium_plan?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          id_document_number?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          id_rejection_reason?: string | null
          id_verification_status?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          is_admin?: boolean | null
          is_premium?: boolean | null
          location?: string | null
          phone?: string | null
          premium_expires_at?: string | null
          premium_payment_id?: string | null
          premium_plan?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[]
          bathrooms: number
          bedrooms: number
          city: string
          created_at: string | null
          description: string
          features: string[] | null
          furnished_status: string | null
          id: string
          images: string[]
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          owner_id: string
          property_type: string
          rent_amount: number
          security_deposit: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address: string
          amenities: string[]
          bathrooms: number
          bedrooms: number
          city: string
          created_at?: string | null
          description: string
          features?: string[] | null
          furnished_status?: string | null
          id?: string
          images: string[]
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id: string
          property_type: string
          rent_amount: number
          security_deposit?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          amenities?: string[]
          bathrooms?: number
          bedrooms?: number
          city?: string
          created_at?: string | null
          description?: string
          features?: string[] | null
          furnished_status?: string | null
          id?: string
          images?: string[]
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_id?: string
          property_type?: string
          rent_amount?: number
          security_deposit?: number | null
          status?: string | null
          title?: string
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
      }
      property_bookings: {
        Row: {
          amount: number
          booking_end: string
          booking_start: string
          created_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          property_id: string
          renter_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_end: string
          booking_start: string
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          property_id: string
          renter_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_end?: string
          booking_start?: string
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          property_id?: string
          renter_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_tracking: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          listing_id: string | null
          payment_id: string | null
          payment_status: string | null
          revenue_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          revenue_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          listing_id?: string | null
          payment_id?: string | null
          payment_status?: string | null
          revenue_type?: string
          user_id?: string | null
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
      service_bookings: {
        Row: {
          amount: number
          booking_end: string
          booking_start: string
          created_at: string | null
          id: string
          payment_id: string | null
          payment_status: string | null
          renter_id: string
          service_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_end: string
          booking_start: string
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          renter_id: string
          service_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_end?: string
          booking_start?: string
          created_at?: string | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          renter_id?: string
          service_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_renter_id_fkey"
            columns: ["renter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          business_name: string
          category: string
          city: string | null
          created_at: string | null
          description: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          images: string[]
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          location: string
          phone_number: string | null
          provider_id: string
          skills: string[]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_name: string
          category: string
          city?: string | null
          created_at?: string | null
          description: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          images: string[]
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          location: string
          phone_number?: string | null
          provider_id: string
          skills: string[]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_name?: string
          category?: string
          city?: string | null
          created_at?: string | null
          description?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          images?: string[]
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          location?: string
          phone_number?: string | null
          provider_id?: string
          skills?: string[]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

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