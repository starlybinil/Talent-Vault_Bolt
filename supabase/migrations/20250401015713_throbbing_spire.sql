/*
  # Add micro-credentials support
  
  1. New Tables
    - `micro_credentials`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `issuer` (text, required)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `user_credentials`
      - `user_id` (uuid, references profiles)
      - `credential_id` (uuid, references micro_credentials)
      - `earned_at` (timestamp)
      - `expires_at` (timestamp, optional)
      - `badge_url` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access to micro_credentials
    - Add policies for authenticated user access to user_credentials
*/

-- Create micro_credentials table
CREATE TABLE micro_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_credentials table
CREATE TABLE user_credentials (
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
  ('RF Circuit Design', 'ASU SWAP Hub', 'Fundamentals of RF circuit design and testing');