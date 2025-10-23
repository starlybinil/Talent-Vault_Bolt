/*
  # Add function to count profile saves
  
  1. Changes
    - Add function to count how many times a profile has been saved
    - Return count of unique employers who saved the profile
*/

-- Create function to count profile saves
CREATE OR REPLACE FUNCTION get_profile_save_count(profile_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT employer_id)
    FROM saved_candidates
    WHERE candidate_id = profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the function
COMMENT ON FUNCTION get_profile_save_count IS 'Returns the number of unique employers who have saved a candidate profile';