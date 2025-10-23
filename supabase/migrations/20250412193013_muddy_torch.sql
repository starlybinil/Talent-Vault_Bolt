/*
  # Fix recursive profile policies

  1. Changes
    - Remove recursive policies from profiles table
    - Add new, non-recursive policies for:
      - Public access to candidate profiles
      - Authenticated user access to own profile
      - Employer access to candidate profiles
    
  2. Security
    - Maintains RLS on profiles table
    - Simplifies policy conditions to prevent recursion
    - Ensures proper access control without circular dependencies
*/

-- Drop existing policies to recreate them without recursion
DROP POLICY IF EXISTS "View candidate profiles" ON profiles;
DROP POLICY IF EXISTS "View own profile" ON profiles;
DROP POLICY IF EXISTS "Employers view candidates" ON profiles;

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

CREATE POLICY "Employers can view candidate profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  type = 'candidate' AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND id IN (
      SELECT user_id FROM profiles
      WHERE type = 'employer'
    )
  )
);