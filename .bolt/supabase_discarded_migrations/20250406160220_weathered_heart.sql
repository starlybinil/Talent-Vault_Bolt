/*
  # Add sample candidate profiles with auth users
  
  1. Changes
    - Create auth users first with proper UUID format
    - Create corresponding profiles with proper user_id references
    - Add sample education, experience, and skills data
*/

-- Create auth users first
DO $$
DECLARE
  sarah_id uuid := '11111111-1111-1111-1111-111111111111';
  james_id uuid := '22222222-2222-2222-2222-222222222222';
  maria_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN

-- Create auth users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES
  (
    sarah_id,
    'sarah.chen@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated'
  ),
  (
    james_id,
    'james.wilson@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated'
  ),
  (
    maria_id,
    'maria.garcia@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated'
  );

-- Create corresponding profiles
INSERT INTO profiles (
  id,
  user_id,
  type,
  first_name,
  last_name,
  bio,
  location,
  education,
  experience,
  technical_skills,
  soft_skills,
  job_opportunity_type,
  nationality_status,
  security_clearance,
  veteran_status,
  job_preferences,
  created_at
) VALUES
  (
    gen_random_uuid(),
    sarah_id,
    'candidate',
    'Sarah',
    'Chen',
    'MSEE graduate specializing in VLSI design and semiconductor manufacturing. Experienced in digital circuit design and process integration.',
    'Phoenix, AZ',
    '[{"school": "Arizona State University", "degree": "MS", "major": "Electrical Engineering", "graduationDate": "2023"}, {"school": "University of California, Berkeley", "degree": "BS", "major": "Electrical Engineering", "graduationDate": "2021"}]',
    '[{"company": "Intel", "position": "VLSI Design Intern", "startDate": "2022-05", "endDate": "2022-08", "current": false, "description": "Worked on digital circuit design and verification using industry-standard EDA tools."}]',
    '["VLSI Design", "Verilog", "SystemVerilog", "Physical Design", "RTL Design"]',
    '["Problem Solving", "Technical Communication", "Team Leadership"]',
    'full-time',
    'US Citizen',
    'None',
    'No',
    '{"preferredIndustries": ["Semiconductor Manufacturing", "Integrated Circuit Design"], "preferredCompanies": ["Intel", "TSMC", "AMD"], "preferredLocations": ["Phoenix, AZ", "San Jose, CA"]}',
    NOW() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    james_id,
    'candidate',
    'James',
    'Wilson',
    'Recent graduate with internship experience in semiconductor manufacturing and process integration.',
    'Tempe, AZ',
    '[{"school": "Arizona State University", "degree": "BS", "major": "Chemical Engineering", "graduationDate": "2023"}]',
    '[{"company": "Microchip Technology", "position": "Process Integration Intern", "startDate": "2023-01", "endDate": "2023-06", "current": false, "description": "Worked on process development and optimization for semiconductor manufacturing."}]',
    '["Process Integration", "Semiconductor Manufacturing", "Clean Room Operations", "Process Control"]',
    '["Analytical Thinking", "Attention to Detail", "Teamwork"]',
    'full-time',
    'US Citizen',
    'Secret',
    'Yes',
    '{"preferredIndustries": ["Semiconductor Manufacturing", "Aerospace & Defense"], "preferredCompanies": ["Raytheon", "Northrop Grumman"], "preferredLocations": ["Phoenix, AZ", "Tucson, AZ"]}',
    NOW() - interval '5 days'
  ),
  (
    gen_random_uuid(),
    maria_id,
    'candidate',
    'Maria',
    'Garcia',
    'PhD candidate in Electrical Engineering with focus on power electronics and semiconductor devices.',
    'San Jose, CA',
    '[{"school": "Stanford University", "degree": "PhD", "major": "Electrical Engineering", "graduationDate": "2024"}, {"school": "MIT", "degree": "MS", "major": "Electrical Engineering", "graduationDate": "2021"}]',
    '[{"company": "Texas Instruments", "position": "Design Engineer Intern", "startDate": "2022-06", "endDate": "2022-12", "current": false, "description": "Developed power management integrated circuits for automotive applications."}]',
    '["Power Electronics", "IC Design", "Analog Circuit Design", "SPICE Simulation", "Layout Design"]',
    '["Research", "Project Management", "Innovation"]',
    'full-time',
    'US Citizen',
    'None',
    'No',
    '{"preferredIndustries": ["Integrated Circuit Design", "Automotive Electronics"], "preferredCompanies": ["Tesla", "Texas Instruments", "NXP"], "preferredLocations": ["San Jose, CA", "Austin, TX"]}',
    NOW() - interval '1 day'
  );

END $$;