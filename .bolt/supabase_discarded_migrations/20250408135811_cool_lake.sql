/*
  # Create new profiles table and copy data
  
  1. Changes
    - Create new profiles_auth table
    - Copy data from profiles to profiles_auth
    - Add proper constraints and indexes
    - Update RLS policies
*/

-- Create new profiles_auth table
CREATE TABLE profiles_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('candidate', 'employer')),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles_auth ENABLE ROW LEVEL SECURITY;

-- Add unique constraint
ALTER TABLE profiles_auth
ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (user_id);

-- Create index for better query performance
CREATE INDEX idx_profiles_auth_user_id ON profiles_auth(user_id);

-- Copy data from profiles to profiles_auth
INSERT INTO profiles_auth (id, user_id, type, first_name, last_name, created_at, updated_at)
SELECT 
  id,
  user_id,
  type,
  first_name,
  last_name,
  created_at,
  updated_at
FROM profiles
WHERE user_id IS NOT NULL;

-- Add RLS policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles_auth FOR SELECT
  TO public
  USING (type = 'candidate');

CREATE POLICY "Users can update own profile"
  ON profiles_auth FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON profiles_auth FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);