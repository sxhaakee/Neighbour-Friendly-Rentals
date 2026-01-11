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
      }
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
          owner_id: string
          business_name: string
          category: string
          tagline: string | null
          description: string
          experience_years: number | null
          base_price: number | null
          pricing_unit: string | null
          location: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          images: string[] | null
          status: string
          rejection_reason: string | null
          created_at: string | null
          updated_at: string | null
          featured: boolean | null
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          category: string
          tagline?: string | null
          description: string
          experience_years?: number | null
          base_price?: number | null
          pricing_unit?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
          featured?: boolean | null
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          category?: string
          tagline?: string | null
          description?: string
          experience_years?: number | null
          base_price?: number | null
          pricing_unit?: string | null
          location?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          images?: string[] | null
          status?: string
          rejection_reason?: string | null
          created_at?: string | null
          updated_at?: string | null
          featured?: boolean | null
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