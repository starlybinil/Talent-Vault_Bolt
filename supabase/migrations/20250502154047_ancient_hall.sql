/*
  # Add filter tracking system
  
  1. New Tables
    - `filter_tracking`
      - Track employer filter selections during candidate search
      - Store complete filter combinations with timestamps
      - Enable analytics on search patterns
    
  2. Security
    - Enable RLS
    - Add policies for employer access
*/

-- Create filter_tracking table
CREATE TABLE filter_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  filter_combination JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT now(),
  session_id UUID NOT NULL,
  search_instance_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE filter_tracking ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Employers can insert filter tracking"
  ON filter_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'employer'
    )
  );

CREATE POLICY "Employers can view own filter tracking"
  ON filter_tracking
  FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM profiles
      WHERE user_id = auth.uid()
      AND type = 'employer'
    )
  );

-- Add indexes for better query performance
CREATE INDEX idx_filter_tracking_employer ON filter_tracking(employer_id);
CREATE INDEX idx_filter_tracking_timestamp ON filter_tracking(timestamp);
CREATE INDEX idx_filter_tracking_session ON filter_tracking(session_id);

-- Add comment explaining the table
COMMENT ON TABLE filter_tracking IS 'Tracks employer filter selections during candidate search';