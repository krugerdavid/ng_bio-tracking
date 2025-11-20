-- Migration: Add payments and membership_plans tables
-- Created: 2025-11-20

-- =====================================================
-- Table: membership_plans
-- Stores membership plan configuration for each member
-- =====================================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  monthly_fee DECIMAL(10,2) NOT NULL CHECK (monthly_fee >= 0),
  weekly_frequency INTEGER NOT NULL CHECK (weekly_frequency BETWEEN 1 AND 5),
  start_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_membership_plans_member_id ON membership_plans(member_id);

-- =====================================================
-- Table: payments
-- Stores monthly payment records for members
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- formato: YYYY-MM
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, month) -- One payment per member per month
);

-- Indexes for faster queries
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_month ON payments(month);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_plans
-- Users can only see plans for members they own
CREATE POLICY "Users can view their own member plans"
  ON membership_plans
  FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create plans for their members"
  ON membership_plans
  FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own member plans"
  ON membership_plans
  FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own member plans"
  ON membership_plans
  FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for payments
-- Users can only see payments for members they own
CREATE POLICY "Users can view their own member payments"
  ON payments
  FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their members"
  ON payments
  FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own member payments"
  ON payments
  FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own member payments"
  ON payments
  FOR DELETE
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Update trigger for updated_at column
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
