/*
  # Fix profile creation policies

  1. Changes
    - Drop existing INSERT policies
    - Create new policy for profile creation during signup
    - Create policy for authenticated users to create their own profile
    - Use auth.uid() instead of uid()
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;

-- Create new INSERT policy for profile creation
CREATE POLICY "Enable profile creation during signup"
ON profiles
FOR INSERT
TO public
WITH CHECK (
  type = ANY (ARRAY['candidate'::text, 'employer'::text, 'recruiter'::text])
);

-- Create policy for users to create their own profile
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);