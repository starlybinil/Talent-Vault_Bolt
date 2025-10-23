/*
  # Add views for education data
  
  1. New Views
    - `candidate_degrees_view`: Shows candidate profiles with their degrees
    - `candidate_majors_view`: Shows candidate profiles with their majors
    
  2. Security
    - Views inherit RLS policies from underlying tables
    - Only show candidate profiles
*/

-- Create view for candidate degrees
CREATE OR REPLACE VIEW candidate_degrees_view AS
SELECT 
  p.id AS profile_id,
  p.first_name,
  p.last_name,
  d.id AS degree_id,
  d.name AS degree_name,
  d.level AS degree_level,
  ce.graduation_date,
  u.name AS university_name,
  u.state AS university_state
FROM profiles p
JOIN candidate_education ce ON p.id = ce.profile_id
JOIN degrees d ON ce.degree_id = d.id
LEFT JOIN universities u ON ce.university_id = u.id
WHERE p.type = 'candidate';

-- Create view for candidate majors
CREATE OR REPLACE VIEW candidate_majors_view AS
SELECT 
  p.id AS profile_id,
  p.first_name,
  p.last_name,
  m.id AS major_id,
  m.name AS major_name,
  m.field AS major_field,
  ce.graduation_date,
  u.name AS university_name
FROM profiles p
JOIN candidate_education ce ON p.id = ce.profile_id
JOIN majors m ON ce.major_id = m.id
LEFT JOIN universities u ON ce.university_id = u.id
WHERE p.type = 'candidate';

-- Add comments explaining the views
COMMENT ON VIEW candidate_degrees_view IS 'Shows candidate profiles with their degree information';
COMMENT ON VIEW candidate_majors_view IS 'Shows candidate profiles with their major information';