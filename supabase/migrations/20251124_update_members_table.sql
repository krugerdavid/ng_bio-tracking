-- Migration: Update members table structure
-- Date: 2025-11-24
-- Description: Add document_number column and make email, date_of_birth, and gender nullable.

-- Add document_number column
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS document_number TEXT;

-- Make document_number unique (optional but recommended for identification)
-- ALTER TABLE members ADD CONSTRAINT members_document_number_key UNIQUE (document_number);

-- Make fields nullable
ALTER TABLE members 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN date_of_birth DROP NOT NULL,
ALTER COLUMN gender DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN members.document_number IS 'Document number (DNI/CI) of the member';
