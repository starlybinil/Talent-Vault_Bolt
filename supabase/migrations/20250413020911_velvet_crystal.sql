/*
  # Add contact email field to profiles
  
  1. Changes
    - Add email_address column to profiles table
    - Add validation check for email format
    - Add index for email lookups
    - Add unique constraint to prevent duplicates
*/

-- Add email_address column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_address TEXT;

-- Add check constraint for email format
ALTER TABLE profiles
ADD CONSTRAINT valid_email_format 
CHECK (
  email_address IS NULL OR 
  email_address ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
);

-- Add unique constraint
ALTER TABLE profiles
ADD CONSTRAINT unique_email_address UNIQUE (email_address);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email_address 
ON profiles(email_address);

-- Add comment explaining the column
COMMENT ON COLUMN profiles.email_address IS 'Contact email address for the profile owner';