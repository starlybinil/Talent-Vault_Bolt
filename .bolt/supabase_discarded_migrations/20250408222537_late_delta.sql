/*
  # Add sample profile data
  
  1. Changes
    - Add sample profile data for testing
    - Include education, experience, skills and other profile fields
*/

-- Add sample profile data
UPDATE profiles 
SET
  bio = 'Binil Starly serves as the inaugural School Director and Professor in the School of Manufacturing Systems & Networks at Arizona State University, leading a group of 21 faculty and more than 13 staff within the School. The School currently has >300 students, $11.5M (2024) annual research expenditures, 9 current and past NSF CAREER awardees.',
  technical_skills = '[
    "Manufacturing Systems",
    "Process Integration",
    "Industry 4.0",
    "Digital Manufacturing",
    "Additive Manufacturing",
    "CAD/CAM",
    "Quality Control",
    "Lean Manufacturing"
  ]'::jsonb,
  soft_skills = '[
    "Leadership",
    "Strategic Planning",
    "Team Management",
    "Research Direction",
    "Grant Writing",
    "Public Speaking"
  ]'::jsonb,
  education = '[
    {
      "degree": "PhD",
      "major": "Industrial Engineering",
      "school": "North Carolina State University",
      "graduationDate": "2004",
      "description": "Focus on Digital Manufacturing and CAD/CAM Systems"
    },
    {
      "degree": "MS",
      "major": "Industrial Engineering",
      "school": "North Carolina State University",
      "graduationDate": "2002"
    },
    {
      "degree": "BS",
      "major": "Mechanical Engineering",
      "school": "University of Mumbai",
      "graduationDate": "2000"
    }
  ]'::jsonb,
  experience = '[
    {
      "company": "Arizona State University",
      "position": "School Director and Professor",
      "startDate": "2021",
      "current": true,
      "description": "Leading the School of Manufacturing Systems & Networks with focus on advanced manufacturing education and research."
    },
    {
      "company": "University of Calgary",
      "position": "Professor",
      "startDate": "2018",
      "endDate": "2021",
      "current": false,
      "description": "Led research initiatives in digital manufacturing and Industry 4.0 technologies."
    },
    {
      "company": "North Carolina State University",
      "position": "Associate Professor",
      "startDate": "2012",
      "endDate": "2018",
      "current": false,
      "description": "Conducted research in advanced manufacturing processes and systems."
    }
  ]'::jsonb,
  credentials = 'NSF CAREER Award Recipient\nSenior Member, SME\nFellow, ASME',
  nationality_status = 'US Citizen',
  security_clearance = 'top_secret',
  job_opportunity_type = 'full-time'
WHERE user_id = auth.uid();