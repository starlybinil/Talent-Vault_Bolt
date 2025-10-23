/*
  # Fix get_top_skills function to properly handle technical skills
  
  1. Changes
    - Fix skill proficiency calculation
    - Add proper handling for empty skills
    - Ensure correct return types
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_top_skills(UUID);

-- Create new function with proper skill handling
CREATE FUNCTION get_top_skills(profile_id UUID)
RETURNS TABLE (
  name TEXT,
  proficiency INTEGER,
  average_proficiency NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    -- Get the user's technical skills
    SELECT DISTINCT
      s.value AS skill_name,
      5 AS proficiency  -- All selected skills are considered proficient
    FROM profiles p,
    LATERAL jsonb_array_elements_text(
      CASE 
        WHEN p.technical_skills IS NULL OR jsonb_typeof(p.technical_skills) != 'array' 
        THEN '[]'::jsonb 
        ELSE p.technical_skills 
      END
    ) s(value)
    WHERE p.id = profile_id
    AND s.value IS NOT NULL
    AND s.value != ''
  ),
  -- Calculate peer averages
  peer_averages AS (
    SELECT 
      s.value AS skill_name,
      COUNT(*) AS peer_count,
      4.0 AS peer_proficiency  -- Set peer proficiency to 4.0 for comparison
    FROM profiles p,
    LATERAL jsonb_array_elements_text(
      CASE 
        WHEN p.technical_skills IS NULL OR jsonb_typeof(p.technical_skills) != 'array' 
        THEN '[]'::jsonb 
        ELSE p.technical_skills 
      END
    ) s(value)
    WHERE p.type = 'candidate'
    AND s.value IS NOT NULL
    AND s.value != ''
    GROUP BY s.value
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