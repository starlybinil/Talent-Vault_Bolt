/*
  # Add upcoming micro-credentials table
  
  1. New Tables
    - `upcoming_microcredentials`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `url` (text, required)
      - `start_date` (timestamptz, required)
      - `duration` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
*/

CREATE TABLE upcoming_microcredentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE upcoming_microcredentials ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Upcoming micro-credentials are viewable by everyone"
  ON upcoming_microcredentials
  FOR SELECT
  TO public
  USING (true);

-- Insert sample data
INSERT INTO upcoming_microcredentials (title, description, url, start_date, duration) VALUES
  (
    'VLSI Design Fundamentals',
    'Learn the fundamentals of VLSI design and layout',
    'https://microcredentials.asu.edu/vlsi',
    now() + interval '2 weeks',
    '8 weeks'
  ),
  (
    'Semiconductor Manufacturing',
    'Core principles of semiconductor fabrication',
    'https://microcredentials.asu.edu/semiconductor',
    now() + interval '1 month',
    '6 weeks'
  ),
  (
    'PCB Design Essentials',
    'Master PCB design and manufacturing',
    'https://microcredentials.asu.edu/pcb',
    now() + interval '3 weeks',
    '4 weeks'
  );

-- Add index for date-based queries
CREATE INDEX idx_upcoming_microcredentials_start_date 
ON upcoming_microcredentials(start_date);

-- Add comment explaining the table
COMMENT ON TABLE upcoming_microcredentials IS 'Stores upcoming micro-credential offerings';