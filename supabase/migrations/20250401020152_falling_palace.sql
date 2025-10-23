/*
  # Add micro-credentials tables and sample data

  1. New Tables
    - `micro_credentials`
      - Stores available micro-credentials
    - `user_credentials`
      - Junction table for user-credential relationships
      - Tracks earned dates and badge URLs

  2. Security
    - Enable RLS on both tables
    - Add policies for public viewing and user-specific access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Micro-credentials are viewable by everyone" ON micro_credentials;
  DROP POLICY IF EXISTS "Users can view their own credentials" ON user_credentials;
END $$;

-- Create micro_credentials table
CREATE TABLE IF NOT EXISTS micro_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES micro_credentials(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  badge_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, credential_id)
);

-- Enable RLS
ALTER TABLE micro_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Micro-credentials are viewable by everyone"
  ON micro_credentials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Insert sample micro-credentials
INSERT INTO micro_credentials (name, issuer, description) VALUES
  ('VLSI Design Fundamentals', 'ASU SWAP Hub', 'Fundamental concepts of VLSI design and implementation'),
  ('PCB Design Essentials', 'ASU SWAP Hub', 'Essential skills in PCB design and manufacturing'),
  ('Semiconductor Manufacturing', 'ASU SWAP Hub', 'Core principles of semiconductor manufacturing processes'),
  ('Clean Room Safety', 'ASU SWAP Hub', 'Safety protocols and procedures for clean room operations'),
  ('RF Circuit Design', 'ASU SWAP Hub', 'Fundamentals of RF circuit design and testing'),
  ('Digital Signal Processing', 'ASU SWAP Hub', 'Advanced DSP techniques and applications'),
  ('Power Electronics', 'ASU SWAP Hub', 'Design and analysis of power electronic systems'),
  ('Embedded Systems', 'ASU SWAP Hub', 'Programming and design of embedded systems'),
  ('Quality Control', 'ASU SWAP Hub', 'Quality assurance in semiconductor manufacturing'),
  ('Test Engineering', 'ASU SWAP Hub', 'Automated test equipment and test development');