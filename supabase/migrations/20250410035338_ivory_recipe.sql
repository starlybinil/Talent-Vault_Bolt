/*
  # Add search indexes for profile filtering
  
  1. New Indexes
    - Add GIN index for technical_skills and soft_skills JSONB arrays
    - Add B-tree indexes for commonly filtered columns
    - Add trigram index for text search fields
    
  2. Performance
    - Optimize query performance for filtering operations
    - Support efficient text search
*/

-- Enable trigram extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for commonly filtered fields
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);
CREATE INDEX IF NOT EXISTS idx_profiles_nationality_status ON profiles(nationality_status);
CREATE INDEX IF NOT EXISTS idx_profiles_job_opportunity_type ON profiles(job_opportunity_type);

-- Add GIN indexes for JSONB arrays
CREATE INDEX IF NOT EXISTS idx_profiles_technical_skills ON profiles USING GIN (technical_skills jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_soft_skills ON profiles USING GIN (soft_skills jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON profiles USING GIN (education jsonb_path_ops);

-- Add trigram indexes for text search
CREATE INDEX IF NOT EXISTS idx_profiles_name_search ON profiles 
USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

-- Add function to search profiles with pagination
CREATE OR REPLACE FUNCTION search_profiles(
  search_term TEXT DEFAULT NULL,
  nationality_filters TEXT[] DEFAULT NULL,
  education_filters TEXT[] DEFAULT NULL,
  employment_type_filters TEXT[] DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  profile_json JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_profiles AS (
    SELECT 
      jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'photo_url', p.photo_url,
        'education', p.education,
        'technical_skills', p.technical_skills,
        'soft_skills', p.soft_skills,
        'job_opportunity_type', p.job_opportunity_type,
        'nationality_status', p.nationality_status,
        'security_clearance', p.security_clearance,
        'veteran_status', p.veteran_status,
        'bio', p.bio,
        'linkedin', p.linkedin
      ) AS profile_data,
      COUNT(*) OVER() as full_count
    FROM profiles p
    WHERE 
      p.type = 'candidate'
      AND (
        search_term IS NULL 
        OR (p.first_name || ' ' || p.last_name) ILIKE '%' || search_term || '%'
      )
      AND (
        nationality_filters IS NULL 
        OR p.nationality_status = ANY(nationality_filters)
      )
      AND (
        employment_type_filters IS NULL 
        OR p.job_opportunity_type = ANY(employment_type_filters)
      )
      AND (
        education_filters IS NULL
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p.education) edu
          WHERE (edu->>'degree')::text LIKE ANY(
            ARRAY(SELECT filter || '%' FROM unnest(education_filters) filter)
          )
        )
      )
    ORDER BY p.updated_at DESC
    LIMIT page_size
    OFFSET (page_number - 1) * page_size
  )
  SELECT 
    fp.profile_data as profile_json,
    fp.full_count as total_count
  FROM filtered_profiles fp;
END;
$$ LANGUAGE plpgsql;