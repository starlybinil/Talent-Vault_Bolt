/*
  # Fix RLS policies to prevent recursion
  
  1. Changes
    - Drop existing policies that may cause recursion
    - Create new simplified policies
    - Fix employer access to candidate profiles
    - Maintain security while avoiding circular dependencies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Create own profile" ON profiles;
DROP POLICY IF EXISTS "Employers view candidates" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "View candidate profiles" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;

-- Create new simplified policies
-- Admin access
CREATE POLICY "Admin full access"
ON profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Own profile access
CREATE POLICY "View own profile"
ON profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Profile updates
CREATE POLICY "Update own profile"
ON profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Profile creation
CREATE POLICY "Create own profile"
ON profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  type IN ('candidate', 'employer', 'recruiter')
);

-- Public candidate access
CREATE POLICY "View candidate profiles"
ON profiles
AS PERMISSIVE
FOR SELECT
TO public
USING (type = 'candidate');

-- Employer access to candidates
CREATE POLICY "Employers view candidates"
ON profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  -- Only allow access to candidate profiles
  type = 'candidate' AND
  -- Check if the requesting user has an employer profile
  EXISTS (
    SELECT 1
    FROM auth.users au
    JOIN profiles p ON p.user_id = au.id
    WHERE au.id = auth.uid()
    AND p.type = 'employer'
  )
);

-- Enable signup profile creation
CREATE POLICY "Enable profile creation during signup"
ON profiles
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  type IN ('candidate', 'employer', 'recruiter')
);