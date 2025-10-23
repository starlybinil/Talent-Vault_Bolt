/*
  # Fix employer routing and permissions
  
  1. Changes
    - Add employer-specific RLS policies
    - Ensure proper type validation for employer profiles
    - Fix profile viewing permissions
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Create own profile" ON profiles;
DROP POLICY IF EXISTS "Employers view candidates" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "View candidate profiles" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;

-- Create new optimized policies
-- Admin full access
CREATE POLICY "Admin full access"
ON profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create own profile
CREATE POLICY "Create own profile"
ON profiles
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND type IN ('candidate', 'employer', 'recruiter')
);

-- Public can view candidate profiles
CREATE POLICY "View candidate profiles"
ON profiles
AS PERMISSIVE
FOR SELECT
TO public
USING (type = 'candidate');

-- Users can view their own profile
CREATE POLICY "View own profile"
ON profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Update own profile"
ON profiles
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Employers can view candidate profiles
CREATE POLICY "Employers view candidates"
ON profiles
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  type = 'candidate' 
  AND EXISTS (
    SELECT 1 
    FROM profiles employer 
    WHERE employer.user_id = auth.uid() 
    AND employer.type = 'employer'
    AND employer.id != profiles.id
  )
);

-- Enable profile creation during signup
CREATE POLICY "Enable profile creation during signup"
ON profiles
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id 
  AND type IN ('candidate', 'employer', 'recruiter')
);

-- Add function to check if user is employer
CREATE OR REPLACE FUNCTION is_employer()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE user_id = auth.uid()
    AND type = 'employer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;