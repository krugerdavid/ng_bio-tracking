-- Migration: Enable member deletion with proper RLS policies
-- Date: 2025-11-24
-- Description: Add DELETE policy for members table and ensure CASCADE relationships are properly configured

-- =====================================================
-- 1. Ensure RLS is enabled on members table
-- =====================================================
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Drop existing DELETE policy if it exists (to avoid conflicts)
-- =====================================================
DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON members;
DROP POLICY IF EXISTS "Users can delete own members" ON members;
DROP POLICY IF EXISTS "Users and admins can delete members" ON members;

-- =====================================================
-- 3. Create DELETE policy for members
-- Allow authenticated users to delete members
-- This works with the existing CASCADE relationships:
--   - bioimpedances (ON DELETE CASCADE)
--   - membership_plans (ON DELETE CASCADE)
--   - payments (ON DELETE CASCADE)
-- =====================================================
CREATE POLICY "Enable delete access for all authenticated users" ON members
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 4. Add DELETE policies for related tables (optional but recommended)
-- These allow direct deletion of related records if needed
-- Note: CASCADE will automatically delete these when a member is deleted
-- =====================================================

-- Add DELETE policy for payments (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Enable delete access for all authenticated users'
  ) THEN
    CREATE POLICY "Enable delete access for all authenticated users" ON payments
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Add DELETE policy for membership_plans (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'membership_plans' 
    AND policyname = 'Enable delete access for all authenticated users'
  ) THEN
    CREATE POLICY "Enable delete access for all authenticated users" ON membership_plans
    AS PERMISSIVE FOR DELETE
    TO authenticated
    USING (true);
  END IF;
END $$;

-- =====================================================
-- 5. Verify CASCADE relationships exist (informational comments)
-- =====================================================
-- The following tables should have ON DELETE CASCADE:
--   - bioimpedances.member_id -> members.id (ON DELETE CASCADE)
--   - membership_plans.member_id -> members.id (ON DELETE CASCADE)
--   - payments.member_id -> members.id (ON DELETE CASCADE)
--
-- To verify CASCADE relationships, run:
-- SELECT
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name,
--   rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- JOIN information_schema.referential_constraints AS rc
--   ON rc.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND ccu.table_name = 'members'
--   AND rc.delete_rule = 'CASCADE';

