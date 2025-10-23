/*
  # Add employer authentication support
  
  1. Changes
    - Add employer-specific fields to profiles table
    - Add employer_details table for additional info
    - Add saved_candidates table for bookmarking
    - Update profile type check constraint
    
  2. Security
    - Enable RLS on new tables
    - Add policies for employer access
*/

-- Add employer type to profiles check constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_type_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_type_check 
CHECK (type IN ('candidate', 'recruiter', 'employer'));

-- Create employer_details table
CREATE TABLE employer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  hiring_needs TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_profile UNIQUE (profile_id)
);

-- Create saved_candidates table
CREATE TABLE saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_saved_candidate UNIQUE (employer_id, candidate_id)
);

-- Enable RLS
ALTER TABLE employer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for employer_details
CREATE POLICY "Employers can view own details"
  ON employer_details
  FOR SELECT
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Employers can update own details"
  ON employer_details
  FOR UPDATE
  TO authenticated
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Employers can insert own details"
  ON employer_details
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Add RLS policies for saved_candidates
CREATE POLICY "Employers can manage saved candidates"
  ON saved_candidates
  FOR ALL
  TO authenticated
  USING (employer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (employer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Create updated_at triggers
CREATE TRIGGER update_employer_details_updated_at
  BEFORE UPDATE ON employer_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_candidates_updated_at
  BEFORE UPDATE ON saved_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();