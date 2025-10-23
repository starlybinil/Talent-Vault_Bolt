/*
  # Add view for candidate skills text search
  
  1. Changes
    - Create view to expose candidate skills in text format
    - Add check option to maintain data integrity
    - Enable text-based searching of technical skills
*/

-- Create view for candidate skills
CREATE OR REPLACE VIEW candidates_with_skills_text AS
SELECT 
  id,
  technical_skills,
  -- Convert JSONB array to text, removing array brackets and quotes
  REPLACE(
    REPLACE(
      technical_skills::text,
      '[', ''
    ),
    ']', ''
  ) AS technical_skills_text
FROM profiles
WHERE 
  type = 'candidate'
  AND technical_skills IS NOT NULL
  AND jsonb_typeof(technical_skills) = 'array'
WITH CHECK OPTION;

-- Add comment explaining the view
COMMENT ON VIEW candidates_with_skills_text IS 'Provides text-searchable view of candidate technical skills';

-- Create index to improve text search performance
CREATE INDEX IF NOT EXISTS idx_candidates_skills_text 
ON profiles USING gin(technical_skills jsonb_path_ops);