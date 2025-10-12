-- ============================================
-- VERIFICATION ADMIN FUNCTIONS
-- Run these in Supabase SQL Editor
-- ============================================

-- Function to verify a user (admin only)
CREATE OR REPLACE FUNCTION verify_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if the caller is an admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = p_admin_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can verify users';
  END IF;

  -- Update the user's verification status
  UPDATE profiles
  SET 
    id_verified = true,
    id_verification_status = 'verified',
    id_verified_at = NOW()
  WHERE id = p_user_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', p_user_id,
    'verified_at', NOW()
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to reject a user's verification (admin only)
CREATE OR REPLACE FUNCTION reject_user_verification(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_result JSON;
BEGIN
  -- Check if the caller is an admin
  SELECT is_admin INTO v_is_admin
  FROM profiles
  WHERE id = p_admin_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can reject verifications';
  END IF;

  -- Update the user's verification status
  UPDATE profiles
  SET 
    id_verified = false,
    id_verification_status = 'rejected',
    id_rejection_reason = p_reason
  WHERE id = p_user_id;

  -- Return success
  SELECT json_build_object(
    'success', true,
    'user_id', p_user_id,
    'reason', p_reason
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user_verification(UUID, UUID, TEXT) TO authenticated;
