-- Drop existing function first
DROP FUNCTION IF EXISTS get_top_skills(UUID);

-- Create new function with proper NUMERIC types
CREATE FUNCTION get_top_skills(profile_id UUID)
RETURNS TABLE (
  name TEXT,
  proficiency INTEGER,
  average_proficiency NUMERIC,
  uniqueness_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    -- Get the user's technical skills
    SELECT 
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
  ),
  -- Calculate how many other candidates have each skill
  skill_counts AS (
    SELECT 
      s.value AS skill_name,
      COUNT(*)::NUMERIC AS total_users
    FROM profiles p,
    LATERAL jsonb_array_elements_text(
      CASE 
        WHEN p.technical_skills IS NULL OR jsonb_typeof(p.technical_skills) != 'array' 
        THEN '[]'::jsonb 
        ELSE p.technical_skills 
      END
    ) s(value)
    WHERE p.type = 'candidate'
    AND p.id != profile_id
    GROUP BY s.value
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
    us.skill_name,
    us.proficiency,
    5.0::NUMERIC AS average_proficiency,
    CASE 
      WHEN sc.total_users IS NULL THEN 100.0::NUMERIC  -- Unique skill
      ELSE (100.0 - (sc.total_users / NULLIF(tc.total, 0) * 100.0))::NUMERIC
    END AS uniqueness_score
  FROM user_skills us
  LEFT JOIN skill_counts sc ON sc.skill_name = us.skill_name
  CROSS JOIN total_candidates tc
  ORDER BY uniqueness_score DESC, skill_name
  LIMIT 3;
END;
$$ LANGUAGE plpgsql;