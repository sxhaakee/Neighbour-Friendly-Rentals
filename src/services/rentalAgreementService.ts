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
  item_description?: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_price: number;
  security_deposit?: number;
  agreement_data: any; // Full agreement details as JSON
  pdf_url?: string;
}

export interface RentalAgreement extends RentalAgreementData {
  id: string;
  status: 'active' | 'completed' | 'cancelled' | 'disputed';
  agreed_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

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

    return agreement;
  },

  /**
   * Get agreement by booking ID
   */
  async getAgreementByBooking(bookingId: string): Promise<RentalAgreement | null> {
    const { data, error } = await supabase
      .from('rental_agreements')
      .select('*')
      .eq('booking_id', bookingId)
      .is('deleted_at', null)
      .single();

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
    const { data, error } = await supabase
      .from('rental_agreements')
      .select('*')
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

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
    let query = supabase
      .from('admin_rental_agreements')
      .select('*')
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
