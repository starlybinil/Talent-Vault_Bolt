/*
  # Fix get_top_skills function
  
  1. Changes
    - Drop existing function first
    - Create new function with proper return type
    - Handle technical skills from profiles table
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_top_skills(UUID);

-- Create new function with proper return type
CREATE OR REPLACE FUNCTION get_top_skills(profile_id UUID)
RETURNS TABLE (
  name TEXT,
  proficiency INTEGER,
  average_proficiency NUMERIC
) AS $$
DECLARE
  user_technical_skills JSONB;
BEGIN
  -- Get the user's technical skills array first
  SELECT technical_skills INTO user_technical_skills
  FROM profiles
  WHERE id = profile_id;

  -- Return early with empty result if no skills
  IF user_technical_skills IS NULL OR user_technical_skills = '[]'::jsonb THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH user_skills AS (
    -- Get the user's technical skills
    SELECT DISTINCT
      skill::text AS skill_name,
      5 AS proficiency  -- All selected skills are considered proficient
    FROM jsonb_array_elements_text(user_technical_skills) AS skill
    WHERE skill IS NOT NULL AND skill != ''
  ),
  -- Calculate peer averages
  peer_averages AS (
    SELECT 
      skill::text AS skill_name,
      COUNT(*) AS peer_count,
      4.0 AS peer_proficiency  -- Set peer proficiency to 4.0 for comparison
    FROM profiles p,
    jsonb_array_elements_text(p.technical_skills) AS skill
    WHERE p.type = 'candidate'
    AND skill IS NOT NULL AND skill != ''
    GROUP BY skill
  )
  -- Return top skills with peer averages
  SELECT 
    us.skill_name::TEXT,
    us.proficiency::INTEGER,
    ROUND(COALESCE(pa.peer_proficiency, 0)::NUMERIC, 1) AS average_proficiency
  FROM user_skills us
  LEFT JOIN peer_averages pa ON pa.skill_name = us.skill_name
  ORDER BY pa.peer_count DESC NULLS LAST, us.skill_name
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;