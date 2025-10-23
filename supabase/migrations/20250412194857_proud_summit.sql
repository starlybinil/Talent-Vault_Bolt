/*
  # Fix RLS policies for employer candidate access
  
  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies that properly handle employer access
    - Fix recursive policy issues
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;

-- Create new simplified policies
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  type IN ('candidate', 'employer', 'recruiter')
);

-- Policy for employers to view candidate profiles
CREATE POLICY "Employers can view candidate profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- Allow if viewing a candidate profile
  type = 'candidate' OR
  -- Or if it's your own profile
  auth.uid() = user_id
);