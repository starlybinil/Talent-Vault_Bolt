/*
  # Create employer-specific tables and migrate data

  1. New Tables
    - `employers`
      - Core employer information
      - One-to-one relationship with auth.users
    - `employer_profiles`
      - Extended employer profile information
      - Company details and preferences
    
  2. Security
    - Enable RLS
    - Add policies for employer access
*/

-- Create employers table
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_employer_user UNIQUE (user_id)
);

-- Create employer_profiles table
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  website TEXT,
  hiring_needs TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_employer_profile UNIQUE (employer_id)
);

-- Enable RLS
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employers
CREATE POLICY "Users can view own employer profile"
  ON employers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own employer profile"
  ON employers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own employer profile"
  ON employers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for employer_profiles
CREATE POLICY "Employers can view own company profile"
  ON employer_profiles
  FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can create own company profile"
  ON employer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update own company profile"
  ON employer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON employer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();