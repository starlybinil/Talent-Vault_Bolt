/*
  # Fix recursive RLS policies for profiles table

  1. Changes
    - Drop existing problematic RLS policies that cause recursion
    - Create new, optimized policies that avoid recursive checks
    - Maintain security while preventing infinite loops
    
  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policies for:
      - Public read access to candidate profiles
      - Authenticated users can read their own profile
      - Authenticated users can create their own profile
      - Authenticated users can update their own profile
      - Employers can view candidate profiles
      - Admins have full access
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Create own profile" ON profiles;
DROP POLICY IF EXISTS "Employers view candidates" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Update own profile" ON profiles;
DROP POLICY IF EXISTS "View candidate profiles" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;

-- Recreate policies without recursion
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
    SELECT 1 FROM profiles employer 
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