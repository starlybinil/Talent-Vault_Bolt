/*
  # Fix profile creation policy
  
  1. Changes
    - Drop existing profile creation policy
    - Create new policy using auth.role() instead of role()
    - Allow both candidate and employer profiles
*/

-- Drop the existing profile creation policy
DROP POLICY IF EXISTS "Enable profile creation during signup" ON public.profiles;

-- Create updated policy that handles both candidate and employer profiles
CREATE POLICY "Enable profile creation during signup"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  -- Ensure user is authenticated
  auth.role() = 'authenticated'
  -- Ensure user_id matches the authenticated user's ID
  AND user_id = auth.uid()
  -- Allow both candidate and employer profile types
  AND type IN ('candidate', 'employer', 'recruiter')
);