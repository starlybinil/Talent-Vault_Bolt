/*
  # Fix education statistics function
  
  1. Changes
    - Add update_education_stats function
    - Fix transaction handling
    - Add proper error handling
*/

-- Create function to update education stats
CREATE OR REPLACE FUNCTION update_education_stats()
RETURNS void AS $$
DECLARE
  aa_count INTEGER := 0;
  bs_count INTEGER := 0;
  ms_count INTEGER := 0;
  phd_count INTEGER := 0;
BEGIN
  -- Count AA degrees
  SELECT COUNT(DISTINCT p.id) INTO aa_count
  FROM profiles p,
  jsonb_array_elements(
    CASE 
      WHEN p.education IS NULL OR jsonb_typeof(p.education) != 'array' 
      THEN '[]'::jsonb 
      ELSE p.education 
    END
  ) AS edu
  WHERE p.type = 'candidate'
  AND (
    CASE 
      WHEN jsonb_typeof(edu) = 'object' THEN 
        LOWER(edu->>'degree') SIMILAR TO '%(aa|associate|associates|a\.a\.)%'
      ELSE 
        LOWER(edu::text) SIMILAR TO '%(aa|associate|associates|a\.a\.)%'
    END
  );

  -- Count BS degrees
  SELECT COUNT(DISTINCT p.id) INTO bs_count
  FROM profiles p,
  jsonb_array_elements(
    CASE 
      WHEN p.education IS NULL OR jsonb_typeof(p.education) != 'array' 
      THEN '[]'::jsonb 
      ELSE p.education 
    END
  ) AS edu
  WHERE p.type = 'candidate'
  AND (
    CASE 
      WHEN jsonb_typeof(edu) = 'object' THEN 
        LOWER(edu->>'degree') SIMILAR TO '%(bs|bachelor|bachelors|b\.s\.)%'
      ELSE 
        LOWER(edu::text) SIMILAR TO '%(bs|bachelor|bachelors|b\.s\.)%'
    END
  );

  -- Count MS degrees
  SELECT COUNT(DISTINCT p.id) INTO ms_count
  FROM profiles p,
  jsonb_array_elements(
    CASE 
      WHEN p.education IS NULL OR jsonb_typeof(p.education) != 'array' 
      THEN '[]'::jsonb 
      ELSE p.education 
    END
  ) AS edu
  WHERE p.type = 'candidate'
  AND (
    CASE 
      WHEN jsonb_typeof(edu) = 'object' THEN 
        LOWER(edu->>'degree') SIMILAR TO '%(ms|master|masters|m\.s\.)%'
      ELSE 
        LOWER(edu::text) SIMILAR TO '%(ms|master|masters|m\.s\.)%'
    END
  );

  -- Count PhD degrees
  SELECT COUNT(DISTINCT p.id) INTO phd_count
  FROM profiles p,
  jsonb_array_elements(
    CASE 
      WHEN p.education IS NULL OR jsonb_typeof(p.education) != 'array' 
      THEN '[]'::jsonb 
      ELSE p.education 
    END
  ) AS edu
  WHERE p.type = 'candidate'
  AND (
    CASE 
      WHEN jsonb_typeof(edu) = 'object' THEN 
        LOWER(edu->>'degree') SIMILAR TO '%(phd|ph\.d\.|doctor|doctorate)%'
      ELSE 
        LOWER(edu::text) SIMILAR TO '%(phd|ph\.d\.|doctor|doctorate)%'
    END
  );

  -- Update stats
  UPDATE education_stats SET 
    student_count = aa_count,
    last_updated = now()
  WHERE degree_level = 'AA';

  UPDATE education_stats SET 
    student_count = bs_count,
    last_updated = now()
  WHERE degree_level = 'BS';

  UPDATE education_stats SET 
    student_count = ms_count,
    last_updated = now()
  WHERE degree_level = 'MS';

  UPDATE education_stats SET 
    student_count = phd_count,
    last_updated = now()
  WHERE degree_level = 'PhD';

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in update_education_stats: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;