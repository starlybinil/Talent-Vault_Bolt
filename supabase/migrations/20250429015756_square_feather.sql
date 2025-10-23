/*
  # Fix profiles RLS policy for signup
  
  1. Changes
    - Drop existing INSERT policies
    - Create new policy that allows profile creation during signup
    - Ensure proper type validation
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Create own profile" ON profiles;

-- Create new INSERT policy for profile creation
CREATE POLICY "Create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  type = 'candidate'
);

-- Create policy for signup profile creation
CREATE POLICY "Enable profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id AND
  type = 'candidate'
);