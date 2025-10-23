/*
  # Add degree and major tables
  
  1. New Tables
    - `degrees`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `level` (text, required)
      - `created_at` (timestamp)
    
    - `majors`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `field` (text, required)
      - `created_at` (timestamp)
    
    - `candidate_education`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `degree_id` (uuid, references degrees)
      - `major_id` (uuid, references majors)
      - `university_id` (uuid, references universities)
      - `graduation_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated user access
*/

-- Create degrees table
CREATE TABLE degrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_degree_level CHECK (level IN ('AA', 'BS', 'MS', 'PhD'))
);

-- Create majors table
CREATE TABLE majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidate_education table
CREATE TABLE candidate_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  degree_id UUID REFERENCES degrees(id) ON DELETE RESTRICT,
  major_id UUID REFERENCES majors(id) ON DELETE RESTRICT,
  university_id UUID REFERENCES universities(id) ON DELETE RESTRICT,
  graduation_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_candidate_education UNIQUE (profile_id, degree_id, major_id, university_id)
);

-- Enable RLS
ALTER TABLE degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Degrees are viewable by everyone"
  ON degrees FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Majors are viewable by everyone"
  ON majors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own education"
  ON candidate_education FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own education"
  ON candidate_education
  FOR ALL
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Insert sample degrees
INSERT INTO degrees (name, level) VALUES
  ('Associate of Science', 'AA'),
  ('Associate of Applied Science', 'AA'),
  ('Bachelor of Science', 'BS'),
  ('Bachelor of Engineering', 'BS'),
  ('Master of Science', 'MS'),
  ('Master of Engineering', 'MS'),
  ('Doctor of Philosophy', 'PhD');

-- Insert sample majors
INSERT INTO majors (name, field) VALUES
  ('Electrical Engineering', 'Engineering'),
  ('Computer Engineering', 'Engineering'),
  ('Mechanical Engineering', 'Engineering'),
  ('Chemical Engineering', 'Engineering'),
  ('Materials Science', 'Engineering'),
  ('Computer Science', 'Computer Science'),
  ('Physics', 'Science'),
  ('Chemistry', 'Science'),
  ('Mathematics', 'Science');

-- Add indexes for better query performance
CREATE INDEX idx_candidate_education_profile ON candidate_education(profile_id);
CREATE INDEX idx_candidate_education_degree ON candidate_education(degree_id);
CREATE INDEX idx_candidate_education_major ON candidate_education(major_id);
CREATE INDEX idx_candidate_education_university ON candidate_education(university_id);