/*
  # Fix profile completeness calculation for JSON fields

  1. Changes
    - Add proper JSON validation before calculating array length
    - Handle empty arrays and null values correctly
    - Fix scalar value error by ensuring proper JSONB casting
*/

CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  basic_score INTEGER := 0;
  education_score INTEGER := 0;
  experience_score INTEGER := 0;
  projects_score INTEGER := 0;
  skills_score INTEGER := 0;
  resume_score INTEGER := 0;
  profile_record RECORD;
BEGIN
  -- Get profile data
  SELECT * INTO profile_record
  FROM profiles
  WHERE id = profile_id;

  -- Basic Info (10%) - Check first_name, last_name, bio, linkedin
  basic_score := (
    CASE WHEN profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN 2.5 ELSE 0 END +
    CASE WHEN profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN 2.5 ELSE 0 END +
    CASE WHEN profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN 2.5 ELSE 0 END +
    CASE WHEN profile_record.linkedin IS NOT NULL AND profile_record.linkedin != '' THEN 2.5 ELSE 0 END
  )::INTEGER;

  -- Education (20%) - Check education array length and required fields
  IF profile_record.education IS NOT NULL AND 
     profile_record.education::jsonb IS NOT NULL AND 
     jsonb_typeof(profile_record.education::jsonb) = 'array' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.education::jsonb) * 5,
      20  -- Cap at 20%
    ) INTO education_score;
  END IF;

  -- Experience (10%) - Check experience array length and required fields
  IF profile_record.experience IS NOT NULL AND 
     profile_record.experience::jsonb IS NOT NULL AND 
     jsonb_typeof(profile_record.experience::jsonb) = 'array' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.experience::jsonb) * 5,
      10  -- Cap at 10%
    ) INTO experience_score;
  END IF;

  -- Projects (20%) - Check projects array length and required fields
  IF profile_record.projects IS NOT NULL AND 
     profile_record.projects::jsonb IS NOT NULL AND 
     jsonb_typeof(profile_record.projects::jsonb) = 'array' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.projects::jsonb) * 5,
      20  -- Cap at 20%
    ) INTO projects_score;
  END IF;

  -- Skills (20%) - Check technical_skills and soft_skills
  IF profile_record.technical_skills IS NOT NULL AND 
     profile_record.technical_skills::jsonb IS NOT NULL AND 
     jsonb_typeof(profile_record.technical_skills::jsonb) = 'array' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.technical_skills::jsonb) * 2,
      10  -- Technical skills contribute up to 10%
    ) INTO skills_score;
  END IF;

  IF profile_record.soft_skills IS NOT NULL AND 
     profile_record.soft_skills::jsonb IS NOT NULL AND 
     jsonb_typeof(profile_record.soft_skills::jsonb) = 'array' THEN
    skills_score := skills_score + LEAST(
      jsonb_array_length(profile_record.soft_skills::jsonb) * 2,
      10  -- Soft skills contribute up to 10%
    );
  END IF;

  -- Resume (20%) - Check if resume exists in storage
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM storage.objects 
        WHERE bucket_id = 'resumes' 
        AND (storage.foldername(name))[1] = profile_record.user_id::text
      ) THEN 20
      ELSE 0
    END INTO resume_score;

  -- Return total score
  RETURN basic_score + education_score + experience_score + projects_score + skills_score + resume_score;
END;
$$ LANGUAGE plpgsql;