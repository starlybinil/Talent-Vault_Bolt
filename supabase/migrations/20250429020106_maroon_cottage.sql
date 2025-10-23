/*
  # Fix profiles table RLS policies

  1. Changes
    - Drop existing RLS policies that are causing issues
    - Create new policies that properly handle:
      - Profile creation during signup
      - Profile updates by owners
      - Profile viewing based on type
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for:
      - Public profile creation during signup
      - Authenticated users managing own profiles
      - Public viewing of candidate profiles
      - Admin full access
*/

-- First enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Create own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

-- Create new policies

-- Allow profile creation during signup (both authenticated and public)
CREATE POLICY "Enable profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow public to view candidate profiles
CREATE POLICY "Public can view candidate profiles"
ON profiles
FOR SELECT
TO public
USING (type = 'candidate');

-- Admin full access
CREATE POLICY "Admin full access"
ON profiles
FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');