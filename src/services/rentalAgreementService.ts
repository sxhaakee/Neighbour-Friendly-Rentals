import { supabase } from '../lib/supabase';

export interface RentalAgreementData {
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
  agreement_data: any; // Full agreement details as JSON
  pdf_url?: string | null;
}

export interface RentalAgreement extends RentalAgreementData {
  id: string;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  agreed_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

import { emailService } from './emailService';

export const rentalAgreementService = {
  /**
   * Create a new rental agreement
   */
  async createAgreement(data: RentalAgreementData): Promise<RentalAgreement> {
    const { data: agreement, error } = await supabase
      .from('rental_agreements')
      .insert({
        ...data,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rental agreement:', error);
      throw error;
    }

    // Send agreement email asynchronously
    emailService.sendRentalAgreement({
      agreementId: agreement.id,
      renterName: data.renter_name,
      renterEmail: data.renter_email,
      ownerName: data.owner_name,
      ownerEmail: data.owner_email,
      itemTitle: data.item_title,
      startDate: data.start_date,
      endDate: data.end_date,
      totalPrice: data.total_price,
      dashboardUrl: `${window.location.origin}/dashboard`
    });

    return agreement;
  },

  /**
   * Get agreement by booking ID
   */
  async getAgreementByBooking(bookingId: string): Promise<RentalAgreement | null> {
    const { data, error } = await (supabase
      .from('rental_agreements')
      .select('id, booking_id, listing_id, renter_id, owner_id, renter_name, renter_email, renter_phone, owner_name, owner_email, owner_phone, item_title, start_date, end_date, total_days, total_price, status, agreed_at, pdf_url, created_at, updated_at, agreement_data')
      .eq('booking_id', bookingId)
      .is('deleted_at', null)
      .single() as any);

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching agreement:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get all agreements for a user (renter or owner)
   */
  async getUserAgreements(userId: string): Promise<RentalAgreement[]> {
    const { data, error } = await (supabase
      .from('rental_agreements')
      .select('id, booking_id, listing_id, renter_id, owner_id, renter_name, renter_email, renter_phone, owner_name, owner_email, item_title, start_date, end_date, total_days, total_price, status, created_at, updated_at, agreed_at, agreement_data')
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }) as any);

    if (error) {
      console.error('Error fetching user agreements:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get all agreements (Admin only)
   */
  async getAllAgreements(includeDeleted: boolean = false): Promise<any[]> {
    try {
      // First verify user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin && profile?.role !== 'admin') {
        throw new Error('Not authorized - Admin access required');
      }

      // Fetch from rental_agreements table directly
      let query = supabase
        .from('rental_agreements')
        .select('id, booking_id, listing_id, renter_id, owner_id, renter_name, owner_email, owner_phone, owner_name, item_title, status, created_at, pdf_url')
        .order('created_at', { ascending: false });

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all agreements:', error);
        throw error;
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getAllAgreements:', error);
      throw error;
    }
  },

  /**
   * Update agreement status
   */
  async updateAgreementStatus(
    agreementId: string,
    status: 'active' | 'completed' | 'cancelled' | 'disputed'
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('rental_agreements')
      .update(updateData)
      .eq('id', agreementId);

    if (error) {
      console.error('Error updating agreement status:', error);
      throw error;
    }
  },

  /**
   * Soft delete agreement (Admin only)
   */
  async softDeleteAgreement(agreementId: string): Promise<void> {
    const { error } = await supabase
      .from('rental_agreements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', agreementId);

    if (error) {
      console.error('Error deleting agreement:', error);
      throw error;
    }
  },

  /**
   * Restore soft-deleted agreement (Admin only)
   */
  async restoreAgreement(agreementId: string): Promise<void> {
    const { error } = await supabase
      .from('rental_agreements')
      .update({ deleted_at: null })
      .eq('id', agreementId);

    if (error) {
      console.error('Error restoring agreement:', error);
      throw error;
    }
  },

  /**
   * Permanently delete agreement (Admin only - use with caution)
   */
  async permanentlyDeleteAgreement(agreementId: string): Promise<void> {
    const { error } = await supabase
      .from('rental_agreements')
      .delete()
      .eq('id', agreementId);

    if (error) {
      console.error('Error permanently deleting agreement:', error);
      throw error;
    }
  },

  /**
   * Get agreement statistics (Admin only)
   */
  async getAgreementStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    disputed: number;
  }> {
    const { data, error } = await supabase
      .from('rental_agreements')
      .select('status')
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching agreement stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      active: data?.filter(a => a.status === 'active').length || 0,
      completed: data?.filter(a => a.status === 'completed').length || 0,
      cancelled: data?.filter(a => a.status === 'cancelled').length || 0,
      disputed: data?.filter(a => a.status === 'disputed').length || 0,
    };

    return stats;
  },
};
