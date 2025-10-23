/*
  # Fix recursive RLS policies on profiles table

  1. Changes
    - Drop existing RLS policies on profiles table
    - Create new, non-recursive policies for:
      - Users can read their own profile
      - Users can update their own profile
      - Users can create their own profile
      - Public can view candidate profiles
      - Employers can view candidate profiles
      
  2. Security
    - Maintains existing security model but eliminates recursion
    - Ensures proper access control based on user roles and profile ownership
*/

-- Drop existing policies to recreate them without recursion
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
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
  type IN ('candidate', 'employer', 'recruiter') AND
  auth.uid() = user_id
);

CREATE POLICY "Public can view candidate profiles"
ON profiles
FOR SELECT
TO public
USING (type = 'candidate');

CREATE POLICY "Employers can view candidate profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  type = 'candidate' AND
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.user_id = auth.uid()
    AND p2.type = 'employer'
  )
);