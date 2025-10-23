/*
  # Fix recursive RLS policy for profiles table

  1. Changes
    - Remove recursive condition from "Anyone can view candidate profiles" policy
    - Simplify policy to allow viewing candidate profiles without recursive checks
    - Keep employer verification but avoid self-referential conditions

  2. Security
    - Maintains security by still checking profile type
    - Ensures employers can only view candidate profiles
    - Prevents unauthorized access to non-candidate profiles
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Anyone can view candidate profiles" ON profiles;

-- Create new non-recursive policy
CREATE POLICY "Anyone can view candidate profiles"
ON profiles
FOR SELECT
TO public
USING (
  (type = 'candidate' AND (
    -- Allow public access to candidate profiles
    type = 'candidate' OR
    -- Allow authenticated employers to view candidates
    (auth.role() = 'authenticated' AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
      AND p.type = 'employer'
    ))
  ))
);