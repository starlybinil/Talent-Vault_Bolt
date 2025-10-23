/*
  # Fix profiles table RLS policies
  
  1. Changes
    - Drop existing RLS policies
    - Create new policies with proper permissions
    - Allow profile creation during signup
    - Fix public access to candidate profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;

-- Create new RLS policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow profile creation during signup
CREATE POLICY "Enable profile creation during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read candidate profiles
CREATE POLICY "Public can view candidate profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (type = 'candidate');