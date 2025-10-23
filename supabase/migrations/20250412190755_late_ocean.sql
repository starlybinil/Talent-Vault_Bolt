/*
  # Fix employer policies for viewing candidate profiles

  1. Changes
    - Drop existing policies before recreating
    - Add policy for employers to view candidate profiles
    - Add policy for employers to view saved candidates
    - Add policy for employers to manage saved candidates

  2. Security
    - Enable RLS on profiles table
    - Add policies for employer access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Employers can view candidate profiles" ON profiles;
  DROP POLICY IF EXISTS "Employers can view saved candidates" ON saved_candidates;
  DROP POLICY IF EXISTS "Employers can manage saved candidates" ON saved_candidates;
END $$;

-- Allow employers to view candidate profiles
CREATE POLICY "Employers can view candidate profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles employer_profile
    WHERE employer_profile.user_id = auth.uid()
    AND employer_profile.type = 'employer'
  )
  AND type = 'candidate'
);

-- Allow employers to view their saved candidates
CREATE POLICY "Employers can view saved candidates"
ON public.saved_candidates
FOR SELECT
TO authenticated
USING (
  employer_id IN (
    SELECT id FROM profiles
    WHERE user_id = auth.uid()
    AND type = 'employer'
  )
);