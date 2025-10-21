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
          images: string[]
          owner_id: string
          owner_name: string
          contact_info: string
          availability: string
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
          images: string[]
          owner_id: string
          owner_name: string
          contact_info: string
          availability?: string
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
          images?: string[]
          owner_id?: string
          owner_name?: string
          contact_info?: string
          availability?: string
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
          created_at?: string
          updated_at?: string
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