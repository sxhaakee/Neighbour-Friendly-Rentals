import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompression';

export const verificationService = {
  /**
   * Upload ID document
   */
  async uploadIDDocument(
    userId: string,
    file: File,
    documentType: 'aadhar' | 'pan' | 'passport' | 'driving_license',
    documentNumber: string
  ) {
    try {
      // Compress the document image AGGRESSIVELY to save storage
      // ID documents don't need high quality, just readable text
      const compressedFile = await compressImage(file, {
        maxWidth: 800,  // Smaller dimensions
        maxHeight: 800,
        quality: 0.6,   // Lower quality (still readable)
        maxSizeMB: 0.05, // 50KB max - VERY aggressive for storage savings
      });

      // Upload to storage
      const fileName = `${userId}/${documentType}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('id-documents')
        .getPublicUrl(fileName);

      // Update profile with document info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id_document_type: documentType,
          id_document_number: documentNumber,
          id_document_url: urlData.publicUrl,
          id_verification_status: 'pending',
        } as any)
        .eq('id', userId);

      if (updateError) throw updateError;

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading ID document:', error);
      throw error;
    }
  },

  /**
   * Get verification status
   */
  async getVerificationStatus(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id_verified, id_verification_status, id_document_type, id_document_url, id_rejection_reason')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get pending verifications (admin only)
   */
  async getPendingVerifications() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, id_document_type, id_document_number, id_document_url, created_at')
      .eq('id_verification_status', 'pending')
      .not('id_document_url', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending verifications:', error);
      throw error;
    }
    
    console.log('Pending verifications:', data);
    return data;
  },

  /**
   * Verify user (admin only)
   */
  async verifyUser(userId: string, adminId: string) {
    console.log('Approving user:', userId, 'by admin:', adminId);
    
    try {
      // Use RPC function to bypass RLS
      const { data, error } = await supabase.rpc('verify_user', {
        p_user_id: userId,
        p_admin_id: adminId
      });

      if (error) {
        console.error('RPC Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Verification failed: ${error.message}`);
      }
      
      console.log('User approved successfully:', data);
      return data;
    } catch (err: any) {
      console.error('Verification error:', err);
      throw err;
    }

    // Create notification
    try {
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'ID Verified',
        p_message: 'Your ID has been verified! You can now book items.',
        p_type: 'system',
      } as any);
    } catch (notifError) {
      console.log('Notification error (non-critical):', notifError);
    }
  },

  /**
   * Reject verification (admin only)
   */
  async rejectVerification(userId: string, reason: string, adminId?: string) {
    console.log('Rejecting user:', userId, 'Reason:', reason);
    
    // Get current admin ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    const currentAdminId = adminId || user?.id;
    
    if (!currentAdminId) {
      throw new Error('Admin ID not found');
    }
    
    // Use RPC function to bypass RLS
    const { data, error } = await supabase.rpc('reject_user_verification', {
      p_user_id: userId,
      p_admin_id: currentAdminId,
      p_reason: reason
    });

    if (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
    
    console.log('User rejected successfully:', data);

    // Create notification
    try {
      await supabase.rpc('create_notification', {
        p_user_id: userId,
        p_title: 'ID Verification Rejected',
        p_message: `Your ID verification was rejected: ${reason}`,
        p_type: 'system',
      } as any);
    } catch (notifError) {
      console.log('Notification error (non-critical):', notifError);
    }
  },

  /**
   * Get verified users (admin only)
   */
  async getVerifiedUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, id_document_type, id_document_number, id_document_url, created_at, id_verified_at')
      .eq('id_verified', true)
      .eq('id_verification_status', 'verified')
      .not('id_document_url', 'is', null)
      .order('id_verified_at', { ascending: false });

    if (error) {
      console.error('Error fetching verified users:', error);
      throw error;
    }
    
    console.log('Verified users:', data);
    return data;
  },

  /**
   * Get rejected verifications (admin only)
   */
  async getRejectedVerifications() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, id_document_type, id_document_number, id_document_url, created_at, id_rejection_reason')
      .eq('id_verification_status', 'rejected')
      .not('id_document_url', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rejected verifications:', error);
      throw error;
    }
    
    console.log('Rejected verifications:', data);
    return data;
  },

  /**
   * Check if user is verified
   */
  async isUserVerified(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id_verified')
      .eq('id', userId)
      .single();

    if (error) return false;
    return data?.id_verified || false;
  },
};
