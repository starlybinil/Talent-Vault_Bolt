/*
  # Fix Profile Settings Table

  1. Changes
    - Drop and recreate profile_settings table with correct structure
    - Add proper foreign key constraint
    - Add RLS policies
    - Ensure correct column types and defaults

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS profile_settings CASCADE;

-- Create profile_settings table
CREATE TABLE profile_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  "profileVisibility" TEXT DEFAULT 'public',
  "emailNotifications" BOOLEAN DEFAULT true,
  "allowMessages" BOOLEAN DEFAULT true,
  "showContactInfo" BOOLEAN DEFAULT false,
  "jobStatus" TEXT,
  "companyName" TEXT,
  "jobTitle" TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own settings"
ON profile_settings
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own settings"
ON profile_settings
FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own settings"
ON profile_settings
FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);