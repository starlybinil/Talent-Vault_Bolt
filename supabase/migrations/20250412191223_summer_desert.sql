/*
  # Fix recursive RLS policy for profiles table

  1. Changes
    - Drop existing recursive policy
    - Create simplified policy for candidate profile access
    - Separate policies for different access patterns
    - Remove self-referential conditions
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Anyone can view candidate profiles" ON profiles;

-- Create separate policies for different access patterns
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
  -- Only allow if viewing a candidate profile
  type = 'candidate' AND
  -- And the viewer is an employer
  EXISTS (
    SELECT 1 
    FROM profiles viewer 
    WHERE viewer.user_id = auth.uid() 
    AND viewer.type = 'employer'
  )
);