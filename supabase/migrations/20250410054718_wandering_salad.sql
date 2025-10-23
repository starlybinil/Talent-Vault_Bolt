/*
  # Add education statistics tracking table
  
  1. New Tables
    - `education_stats`
      - Tracks count of students by degree level
      - Updates automatically via trigger
      - Provides fast access to education statistics

  2. Changes
    - Add table for education statistics
    - Add trigger to maintain counts
    - Add function to update counts
*/

-- Create education_stats table
CREATE TABLE education_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree_level TEXT NOT NULL,
  student_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_degree_level CHECK (degree_level IN ('AA', 'BS', 'MS', 'PhD'))
);

-- Insert initial degree levels
INSERT INTO education_stats (degree_level, student_count)
VALUES 
  ('AA', 0),
  ('BS', 0),
  ('MS', 0),
  ('PhD', 0);

-- Function to update education stats
CREATE OR REPLACE FUNCTION update_education_stats()
RETURNS void AS $$
DECLARE
  aa_count INTEGER := 0;
  bs_count INTEGER := 0;
  ms_count INTEGER := 0;
  phd_count INTEGER := 0;
BEGIN
  -- Count AA degrees
  SELECT COUNT(DISTINCT p.id) INTO aa_count
  FROM profiles p
  WHERE p.type = 'candidate'
  AND p.education IS NOT NULL
  AND jsonb_typeof(p.education) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p.education) edu
    WHERE (
      edu->>'degree' LIKE 'AA%'
      OR edu->>'degree' LIKE 'Associate%'
    )
  );

  -- Count BS degrees
  SELECT COUNT(DISTINCT p.id) INTO bs_count
  FROM profiles p
  WHERE p.type = 'candidate'
  AND p.education IS NOT NULL
  AND jsonb_typeof(p.education) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p.education) edu
    WHERE (
      edu->>'degree' LIKE 'BS%'
      OR edu->>'degree' LIKE 'Bachelor%'
    )
  );

  -- Count MS degrees
  SELECT COUNT(DISTINCT p.id) INTO ms_count
  FROM profiles p
  WHERE p.type = 'candidate'
  AND p.education IS NOT NULL
  AND jsonb_typeof(p.education) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p.education) edu
    WHERE (
      edu->>'degree' LIKE 'MS%'
      OR edu->>'degree' LIKE 'Master%'
    )
  );

  -- Count PhD degrees
  SELECT COUNT(DISTINCT p.id) INTO phd_count
  FROM profiles p
  WHERE p.type = 'candidate'
  AND p.education IS NOT NULL
  AND jsonb_typeof(p.education) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p.education) edu
    WHERE (
      edu->>'degree' LIKE 'PhD%'
      OR edu->>'degree' LIKE 'Doctor%'
    )
  );

  -- Update stats
  UPDATE education_stats SET 
    student_count = aa_count,
    last_updated = now()
  WHERE degree_level = 'AA';

  UPDATE education_stats SET 
    student_count = bs_count,
    last_updated = now()
  WHERE degree_level = 'BS';

  UPDATE education_stats SET 
    student_count = ms_count,
    last_updated = now()
  WHERE degree_level = 'MS';

  UPDATE education_stats SET 
    student_count = phd_count,
    last_updated = now()
  WHERE degree_level = 'PhD';
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to update stats when profiles change
CREATE OR REPLACE FUNCTION trigger_update_education_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_education_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
CREATE TRIGGER update_education_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_education_stats();

-- Initial population of stats
SELECT update_education_stats();

-- Enable RLS
ALTER TABLE education_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to education stats
CREATE POLICY "Anyone can view education stats"
  ON education_stats
  FOR SELECT
  TO public
  USING (true);