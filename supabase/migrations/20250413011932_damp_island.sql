/*
  # Fix saved_candidates RLS policies
  
  1. Changes
    - Drop existing policies
    - Create new policies for saved_candidates table
    - Add proper checks for employer access
    
  2. Security
    - Ensure employers can only manage their own saved candidates
    - Verify employer profile ownership
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Employers can manage saved candidates" ON saved_candidates;
DROP POLICY IF EXISTS "Employers can view saved candidates" ON saved_candidates;

-- Create new RLS policies
CREATE POLICY "Employers can insert saved candidates"
ON saved_candidates
FOR INSERT
TO authenticated
WITH CHECK (
  -- Verify the employer_id belongs to the authenticated user's profile
  employer_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND type = 'employer'
  )
);

CREATE POLICY "Employers can delete saved candidates"
ON saved_candidates
FOR DELETE
TO authenticated
USING (
  -- Verify the employer_id belongs to the authenticated user's profile
  employer_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND type = 'employer'
  )
);

CREATE POLICY "Employers can view saved candidates"
ON saved_candidates
FOR SELECT
TO authenticated
USING (
  -- Verify the employer_id belongs to the authenticated user's profile
  employer_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid() 
    AND type = 'employer'
  )
);

-- Add comment explaining the policies
COMMENT ON TABLE saved_candidates IS 'Stores employer bookmarks of candidate profiles';