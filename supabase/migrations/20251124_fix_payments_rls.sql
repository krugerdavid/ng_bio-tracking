-- Enable RLS on payments table if not already enabled
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all payments
CREATE POLICY "Enable read access for all authenticated users" ON "payments"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert payments
CREATE POLICY "Enable insert access for all authenticated users" ON "payments"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update payments
CREATE POLICY "Enable update access for all authenticated users" ON "payments"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

-- Enable RLS on membership_plans table if not already enabled
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all membership plans
CREATE POLICY "Enable read access for all authenticated users" ON "membership_plans"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert membership plans
CREATE POLICY "Enable insert access for all authenticated users" ON "membership_plans"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update membership plans
CREATE POLICY "Enable update access for all authenticated users" ON "membership_plans"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);
