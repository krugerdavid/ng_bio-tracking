-- Migration script to update bioimpedances table structure
-- This script removes old columns and adds new ones according to the new requirements

-- Step 1: Add new columns
ALTER TABLE bioimpedances
  ADD COLUMN IF NOT EXISTS height NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS imc NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS kcal INTEGER,
  ADD COLUMN IF NOT EXISTS metabolic_age INTEGER,
  ADD COLUMN IF NOT EXISTS visceral_fat_percentage NUMERIC(5, 2);

-- Step 2: Migrate existing data (if any)
-- Map existing columns to new structure
UPDATE bioimpedances
SET
  height = NULL, -- No historical data available, set to NULL
  imc = bmi, -- Map existing bmi to imc
  kcal = basal_metabolic_rate, -- Map existing basal_metabolic_rate to kcal
  metabolic_age = NULL, -- No historical data available, set to NULL
  visceral_fat_percentage = visceral_fat -- Map existing visceral_fat to visceral_fat_percentage
WHERE height IS NULL;

-- Step 3: Make new columns NOT NULL (after data migration)
-- Note: Only make NOT NULL if you're sure all records have been migrated
-- For now, we'll keep them nullable to allow gradual migration

-- Step 4: Remove old columns that are no longer needed
ALTER TABLE bioimpedances
  DROP COLUMN IF EXISTS water_percentage,
  DROP COLUMN IF EXISTS bone_mass,
  DROP COLUMN IF EXISTS bmi, -- Now using 'imc'
  DROP COLUMN IF EXISTS visceral_fat, -- Now using 'visceral_fat_percentage'
  DROP COLUMN IF EXISTS basal_metabolic_rate; -- Now using 'kcal'

-- Step 5: Rename columns if needed (optional, for consistency)
-- body_fat_percentage and muscle_mass_percentage remain the same

-- Step 6: Add constraints (optional)
-- You may want to add CHECK constraints for valid ranges
ALTER TABLE bioimpedances
  ADD CONSTRAINT check_height_positive CHECK (height > 0),
  ADD CONSTRAINT check_weight_positive CHECK (weight > 0),
  ADD CONSTRAINT check_imc_positive CHECK (imc > 0),
  ADD CONSTRAINT check_body_fat_percentage_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  ADD CONSTRAINT check_muscle_mass_percentage_range CHECK (muscle_mass_percentage >= 0 AND muscle_mass_percentage <= 100),
  ADD CONSTRAINT check_visceral_fat_percentage_range CHECK (visceral_fat_percentage >= 0 AND visceral_fat_percentage <= 100),
  ADD CONSTRAINT check_kcal_positive CHECK (kcal > 0),
  ADD CONSTRAINT check_metabolic_age_positive CHECK (metabolic_age > 0);

-- Step 7: Create indexes for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_bioimpedances_member_id ON bioimpedances(member_id);
CREATE INDEX IF NOT EXISTS idx_bioimpedances_date ON bioimpedances(date);

-- Verification query to check the new structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'bioimpedances'
-- ORDER BY ordinal_position;

