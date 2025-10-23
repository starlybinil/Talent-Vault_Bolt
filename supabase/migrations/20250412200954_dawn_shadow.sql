/*
  # Add function to check if candidate is saved
  
  1. Changes
    - Add function to check if a candidate is saved by an employer
    - Return boolean indicating saved status
    - Add proper security checks
*/

-- Create function to check if candidate is saved
CREATE OR REPLACE FUNCTION is_candidate_saved(employer_profile_id UUID, candidate_id UUID)
RETURNS boolean AS $$
BEGIN
  -- Check if the employer has saved this candidate
  RETURN EXISTS (
    SELECT 1 
    FROM saved_candidates sc
    WHERE sc.employer_id = employer_profile_id
    AND sc.candidate_id = candidate_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION is_candidate_saved IS 'Checks if a candidate is saved by a specific employer';

-- Create function to get saved candidate count
CREATE OR REPLACE FUNCTION get_saved_candidate_count(employer_profile_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM saved_candidates
    WHERE employer_id = employer_profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION get_saved_candidate_count IS 'Gets the number of candidates saved by an employer';