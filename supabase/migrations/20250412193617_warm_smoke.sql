/*
  # Fix profile RLS policies
  
  1. Changes
    - Drop existing recursive policies
    - Create new simplified policies for:
      - Public access to candidate profiles
      - Authenticated user access to own profile
      - Employer access to candidate profiles
    
  2. Security
    - Maintain proper access control
    - Remove recursive policy definitions
    - Simplify policy conditions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;

-- Create new non-recursive policies
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

CREATE POLICY "Employers can view candidate profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  type = 'candidate' AND
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND p.type = 'employer'
  )
);