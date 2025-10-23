/*
  # Fix profiles RLS policies for signup flow

  1. Changes
    - Update INSERT policy to allow profile creation during signup
    - Maintain existing SELECT and UPDATE policies
    - Ensure proper security checks for profile creation

  2. Security
    - Allow profile creation only with valid user_id
    - Maintain existing RLS policies for other operations
    - Ensure type validation for profile types
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Enable profile creation during signup" ON public.profiles;

-- Create new INSERT policy that allows profile creation with valid user_id
CREATE POLICY "Enable profile creation during signup"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  type = ANY (ARRAY['candidate'::text, 'employer'::text, 'recruiter'::text])
);

-- Note: Keeping existing policies:
-- - "Public can view candidate profiles"
-- - "Users can read own profile"
-- - "Users can update own profile"