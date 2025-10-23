/*
  # Fix profiles table RLS policies
  
  1. Changes
    - Drop existing RLS policies
    - Add policy for users to create their own profile
    - Fix update policy to properly handle user_id check
    - Maintain public read access for candidate profiles
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
  DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
END $$;

-- Create new RLS policies
CREATE POLICY "Users can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view candidate profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (type = 'candidate');

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);