/*
  # Fix Profile Settings Table and Policies

  1. Changes
    - Drop and recreate profile_settings table
    - Add proper foreign key constraint
    - Add RLS policies with correct profile ID lookup
    - Add trigger to update updated_at timestamp
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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON profile_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_settings_updated_at();

-- Create RLS policies
CREATE POLICY "Users can view their own settings"
ON profile_settings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own settings"
ON profile_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own settings"
ON profile_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = profile_settings.user_id
    AND profiles.user_id = auth.uid()
  )
);