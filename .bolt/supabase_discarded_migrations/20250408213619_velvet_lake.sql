/*
  # Add sample skills and user skills data
  
  1. Changes
    - Create skills table if it doesn't exist
    - Add sample skills data
    - Add proper constraints and indexes
*/

-- Create skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for reading skills
CREATE POLICY "Anyone can view skills"
  ON skills
  FOR SELECT
  TO public
  USING (true);

-- Insert sample skills
INSERT INTO skills (id, name, category)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'VLSI Design', 'Process Technologies'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'RTL Design', 'Process Technologies'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'PCB Design', 'Equipment & Tools'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Signal Integrity', 'Equipment & Tools'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Python', 'Software & Analysis')
ON CONFLICT (name) DO NOTHING;