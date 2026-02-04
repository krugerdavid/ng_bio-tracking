-- Migration: Enable UPDATE and DELETE for bioimpedances and payments
-- Date: 2025-11-24
-- Description: Add UPDATE and DELETE policies for bioimpedances and payments tables

-- =====================================================
-- 1. Ensure RLS is enabled on bioimpedances table
-- =====================================================
ALTER TABLE bioimpedances ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Drop existing UPDATE and DELETE policies if they exist (to avoid conflicts)
-- =====================================================
DROP POLICY IF EXISTS "Enable update access for all authenticated users" ON bioimpedances;
DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON bioimpedances;
DROP POLICY IF EXISTS "Users can update own bioimpedances" ON bioimpedances;
DROP POLICY IF EXISTS "Users can delete own bioimpedances" ON bioimpedances;
DROP POLICY IF EXISTS "Users and admins can update bioimpedances" ON bioimpedances;
DROP POLICY IF EXISTS "Users and admins can delete bioimpedances" ON bioimpedances;

-- =====================================================
-- 3. Create UPDATE and DELETE policies for bioimpedances
-- Allow authenticated users to update and delete bioimpedances
-- =====================================================
CREATE POLICY "Enable update access for all authenticated users" ON bioimpedances
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for all authenticated users" ON bioimpedances
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- 4. Ensure RLS is enabled on payments table
-- =====================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Drop existing UPDATE and DELETE policies if they exist (to avoid conflicts)
-- =====================================================
DROP POLICY IF EXISTS "Enable update access for all authenticated users" ON payments;
DROP POLICY IF EXISTS "Enable delete access for all authenticated users" ON payments;
DROP POLICY IF EXISTS "Users can update their own member payments" ON payments;
DROP POLICY IF EXISTS "Users can delete their own member payments" ON payments;

-- =====================================================
-- 6. Create UPDATE and DELETE policies for payments
-- Allow authenticated users to update and delete payments
-- Note: The DELETE policy was already added in the previous migration,
-- but we ensure it exists here for consistency
-- =====================================================
-- UPDATE policy (if not exists from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Enable update access for all authenticated users'
  ) THEN
    CREATE POLICY "Enable update access for all authenticated users" ON payments
    AS PERMISSIVE FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- DELETE policy (if not exists from previous migration)
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

