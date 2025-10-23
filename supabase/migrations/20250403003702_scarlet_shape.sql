/*
  # Add universities table and data
  
  1. New Tables
    - `universities`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `state` (text, required)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policy for public read access
*/

-- Create universities table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Universities are viewable by everyone"
  ON universities FOR SELECT
  TO authenticated
  USING (true);

-- Insert university data
INSERT INTO universities (name, state) VALUES
  ('Arizona State University', 'Arizona'),
  ('University of Arizona', 'Arizona'),
  ('Northern Arizona University', 'Arizona'),
  ('Maricopa Community Colleges', 'Arizona'),
  ('Pima Community College', 'Arizona'),
  
  ('University of California, Berkeley', 'California'),
  ('Stanford University', 'California'),
  ('California Institute of Technology', 'California'),
  ('University of California, Los Angeles', 'California'),
  ('San Jose State University', 'California'),
  ('University of Southern California', 'California'),
  ('San Diego State University', 'California'),
  
  ('University of Texas at Austin', 'Texas'),
  ('Texas A&M University', 'Texas'),
  ('Rice University', 'Texas'),
  ('University of Houston', 'Texas'),
  ('Texas Tech University', 'Texas'),
  ('Southern Methodist University', 'Texas'),
  
  ('Columbia University', 'New York'),
  ('Cornell University', 'New York'),
  ('New York University', 'New York'),
  ('Rochester Institute of Technology', 'New York'),
  ('Rensselaer Polytechnic Institute', 'New York'),
  
  ('Massachusetts Institute of Technology', 'Massachusetts'),
  ('Harvard University', 'Massachusetts'),
  ('Boston University', 'Massachusetts'),
  ('Northeastern University', 'Massachusetts'),
  
  ('University of Illinois Urbana-Champaign', 'Illinois'),
  ('Northwestern University', 'Illinois'),
  ('Illinois Institute of Technology', 'Illinois'),
  
  ('University of Michigan', 'Michigan'),
  ('Michigan State University', 'Michigan'),
  ('Michigan Technological University', 'Michigan'),
  
  ('Georgia Institute of Technology', 'Georgia'),
  ('Emory University', 'Georgia'),
  ('University of Georgia', 'Georgia'),
  
  ('University of Washington', 'Washington'),
  ('Washington State University', 'Washington'),
  
  ('Colorado School of Mines', 'Colorado'),
  ('University of Colorado Boulder', 'Colorado'),
  
  ('Carnegie Mellon University', 'Pennsylvania'),
  ('University of Pennsylvania', 'Pennsylvania'),
  ('Pennsylvania State University', 'Pennsylvania'),
  
  ('Virginia Tech', 'Virginia'),
  ('University of Virginia', 'Virginia'),
  
  ('North Carolina State University', 'North Carolina'),
  ('Duke University', 'North Carolina'),
  
  ('Ohio State University', 'Ohio'),
  ('Case Western Reserve University', 'Ohio'),
  
  ('University of Florida', 'Florida'),
  ('University of Central Florida', 'Florida'),
  ('University of South Florida', 'Florida');