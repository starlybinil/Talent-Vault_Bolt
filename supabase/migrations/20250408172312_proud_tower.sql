/*
  # Fix profiles RLS policies for signup flow
  
  1. Changes
    - Drop existing RLS policies
    - Add new policies that properly handle signup flow
    - Allow profile creation during signup
    - Maintain security for other operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
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
  WITH CHECK (
    -- Allow insert if user_id matches the newly created auth user
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = user_id
      AND auth.users.email = current_setting('request.jwt.claims', true)::jsonb->>'email'
    )
  );

-- Allow public to read candidate profiles
CREATE POLICY "Public can view candidate profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (type = 'candidate');