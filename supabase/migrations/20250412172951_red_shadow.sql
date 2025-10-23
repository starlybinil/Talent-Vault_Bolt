/*
  # Fix saved candidates table and policies
  
  1. Changes
    - Drop existing policies before recreating
    - Ensure table exists
    - Add proper RLS policies
    - Add trigger for updated_at
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Employers can manage saved candidates" ON saved_candidates;
END $$;

-- Create saved_candidates table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_saved_candidate UNIQUE (employer_id, candidate_id)
);

-- Enable RLS
ALTER TABLE saved_candidates ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for managing saved candidates
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

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_saved_candidates_updated_at ON saved_candidates;

CREATE TRIGGER update_saved_candidates_updated_at
  BEFORE UPDATE ON saved_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();