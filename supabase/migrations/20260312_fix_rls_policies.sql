-- Migration: Fix remaining Security Advisor RLS issues
-- 1. Tighten notifications INSERT
-- 2. Revoke UPDATE on role/is_admin from authenticated users

DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  -- Drop existing INSERT policies on notifications
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'notifications' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', pol.policyname);
  END LOOP;
END $$;

-- 1. Create secure INSERT policy for notifications
-- NOTE: By restricting to auth.uid() = user_id, clients can no longer insert notifications 
-- for OTHER users (e.g. new message notifications). 
-- This is secure, but requires moving cross-user notification logic to the server 
-- (e.g. via Database Triggers or Server Actions using Service Role Key).
CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Secure Profile Updates
-- Prevent users from elevating their privileges by modifying 'role' and 'is_admin'
-- The most robust way to do this in PostgreSQL is to REVOKE update privileges on those specific columns.
REVOKE UPDATE (role, is_admin) ON public.profiles FROM authenticated;
REVOKE UPDATE (role, is_admin) ON public.profiles FROM anon;

-- Alternatively, ensure the UPDATE policy handles it.
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
