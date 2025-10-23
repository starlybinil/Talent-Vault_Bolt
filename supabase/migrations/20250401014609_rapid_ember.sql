/*
  # Add function to calculate top skills

  1. Changes
    - Add function to get top skills from technical_skills array
    - Calculate peer average for each skill
*/

CREATE OR REPLACE FUNCTION get_top_skills(profile_id UUID)
RETURNS TABLE (
  name TEXT,
  proficiency INTEGER,
  average_proficiency NUMERIC
) AS $$
BEGIN
  -- Get the user's technical skills
  WITH user_skills AS (
    SELECT 
      s.value AS skill_name,
      5 AS proficiency  -- All selected skills are considered proficient
    FROM profiles p,
    jsonb_array_elements_text(p.technical_skills) s(value)
    WHERE p.id = profile_id
  ),
  -- Calculate peer averages
  peer_averages AS (
    SELECT 
      s.value AS skill_name,
      COUNT(*) AS peer_count,
      5 AS peer_proficiency  -- All selected skills are considered proficient
    FROM profiles p,
    jsonb_array_elements_text(p.technical_skills) s(value)
    WHERE p.type = 'candidate'
    GROUP BY s.value
  )
  -- Return top 3 skills with peer averages
  SELECT 
    us.skill_name,
    us.proficiency,
    ROUND(CAST(COALESCE(pa.peer_proficiency, 0) AS NUMERIC), 1) AS average_proficiency
  FROM user_skills us
  LEFT JOIN peer_averages pa ON pa.skill_name = us.skill_name
  ORDER BY pa.peer_count DESC NULLS LAST
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;