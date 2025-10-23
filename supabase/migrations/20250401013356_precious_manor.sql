/*
  # Update profile completeness calculation with weighted sections
  
  1. Changes
    - Update calculate_profile_completeness function to use weighted sections
    - Basic Info: 10%
    - Education: 20%
    - Experience: 10%
    - Projects: 20%
    - Skills: 20%
    - Resume: 20%
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
  IF profile_record.education IS NOT NULL AND profile_record.education != '[]' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.education) * 5,
      20  -- Cap at 20%
    ) INTO education_score;
  END IF;

  -- Experience (10%) - Check experience array length and required fields
  IF profile_record.experience IS NOT NULL AND profile_record.experience != '[]' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.experience) * 5,
      10  -- Cap at 10%
    ) INTO experience_score;
  END IF;

  -- Projects (20%) - Check projects array length and required fields
  IF profile_record.projects IS NOT NULL AND profile_record.projects != '[]' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.projects) * 5,
      20  -- Cap at 20%
    ) INTO projects_score;
  END IF;

  -- Skills (20%) - Check technical_skills and soft_skills
  IF profile_record.technical_skills IS NOT NULL AND profile_record.technical_skills != '[]' THEN
    SELECT LEAST(
      jsonb_array_length(profile_record.technical_skills),
      10  -- Technical skills contribute up to 10%
    ) INTO skills_score;
  END IF;

  IF profile_record.soft_skills IS NOT NULL AND profile_record.soft_skills != '[]' THEN
    skills_score := skills_score + LEAST(
      jsonb_array_length(profile_record.soft_skills),
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