/*
  # Fix get_top_skills function to properly handle technical_skills array
  
  1. Changes
    - Fix JSONB array handling
    - Add proper type casting
    - Handle empty arrays correctly
    - Return skills in order of uniqueness
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_top_skills(UUID);

-- Create new function with fixed JSONB handling
CREATE OR REPLACE FUNCTION get_top_skills(profile_id UUID)
RETURNS TABLE (
  name TEXT,
  proficiency INTEGER,
  average_proficiency NUMERIC,
  uniqueness_score NUMERIC
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
  -- Calculate how many other candidates have each skill
  skill_counts AS (
    SELECT 
      skill::text AS skill_name,
      COUNT(*)::NUMERIC AS total_users
    FROM profiles p,
    jsonb_array_elements_text(p.technical_skills) AS skill
    WHERE p.type = 'candidate'
    AND p.id != profile_id
    AND skill IS NOT NULL AND skill != ''
    GROUP BY skill
  ),
  -- Calculate total number of candidates for percentage calculation
  total_candidates AS (
    SELECT COUNT(*)::NUMERIC as total
    FROM profiles
    WHERE type = 'candidate'
    AND id != profile_id
  )
  -- Return top skills with uniqueness score
  SELECT 
    us.skill_name::TEXT,
    us.proficiency::INTEGER,
    5.0::NUMERIC AS average_proficiency,
    CASE 
      WHEN sc.total_users IS NULL THEN 100.0::NUMERIC  -- Unique skill
      ELSE ROUND((100.0 - (sc.total_users / NULLIF(tc.total, 0) * 100.0))::NUMERIC, 1)
    END AS uniqueness_score
  FROM user_skills us
  LEFT JOIN skill_counts sc ON sc.skill_name = us.skill_name
  CROSS JOIN total_candidates tc
  ORDER BY uniqueness_score DESC, us.skill_name
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;