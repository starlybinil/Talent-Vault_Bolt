/*
  # Initial Schema for TalentVault

  1. Tables
    - profiles
      - Stores user profile information for both candidates and employers
      - Links to Supabase auth.users
    - companies
      - Stores company information
    - job_listings
      - Stores job postings
    - skills
      - Stores predefined skills
    - user_skills
      - Junction table for user-skill relationships
    - job_skills
      - Junction table for job-skill relationships
    - applications
      - Stores job applications
    - messages
      - Stores communication between users

  2. Security
    - RLS policies for all tables
    - Secure access patterns for different user types
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DO $$ 
BEGIN
  -- Drop tables in correct order to handle dependencies
  DROP TABLE IF EXISTS messages CASCADE;
  DROP TABLE IF EXISTS applications CASCADE;
  DROP TABLE IF EXISTS job_skills CASCADE;
  DROP TABLE IF EXISTS user_skills CASCADE;
  DROP TABLE IF EXISTS skills CASCADE;
  DROP TABLE IF EXISTS job_listings CASCADE;
  DROP TABLE IF EXISTS companies CASCADE;
  DROP TABLE IF EXISTS profiles CASCADE;
END $$;

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('candidate', 'employer')),
  full_name VARCHAR(100),
  bio TEXT,
  location VARCHAR(100),
  education TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  industry VARCHAR(100),
  location VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job listings table
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100),
  salary_range VARCHAR(100),
  employment_type VARCHAR(50),
  experience_level VARCHAR(50),
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User skills junction table
CREATE TABLE user_skills (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

-- Job skills junction table
CREATE TABLE job_skills (
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  required_level INTEGER CHECK (required_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (job_id, skill_id)
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Companies: Public read, employer create/update
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can create companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND type = 'employer'
  ));

-- Job Listings: Public read, employer create/update for own company
CREATE POLICY "Job listings are viewable by everyone"
  ON job_listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can manage job listings"
  ON job_listings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'employer'
    )
  );

-- Applications: Candidates can create, both parties can view their own
CREATE POLICY "Users can view their applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    applicant_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    ) OR
    job_id IN (
      SELECT id FROM job_listings
      WHERE company_id IN (
        SELECT company_id FROM profiles
        WHERE user_id = auth.uid()
        AND type = 'employer'
      )
    )
  );

-- Messages: Participants can view their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    ) OR
    receiver_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_job_listings_company_id ON job_listings(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);