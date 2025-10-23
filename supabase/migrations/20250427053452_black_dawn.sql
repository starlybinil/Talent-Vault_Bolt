/*
  # Create semiconductor resources table

  1. New Tables
    - `semiconductor_resources`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `thumbnail_url` (text)
      - `category` (text)
      - `company` (text)
      - `duration` (text)
      - `published_at` (timestamptz)
      - `view_count` (integer)

  2. Security
    - Enable RLS on `semiconductor_resources` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Functions
    - Create function to track video views
*/

-- Create the semiconductor_resources table
CREATE TABLE IF NOT EXISTS semiconductor_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text NOT NULL,
  category text NOT NULL,
  company text NOT NULL,
  duration text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add category validation
ALTER TABLE semiconductor_resources
  ADD CONSTRAINT valid_category CHECK (
    category IN (
      'manufacturing_overview',
      'fabrication_technology',
      'industry_innovation',
      'equipment_tools',
      'quality_control'
    )
  );

-- Enable RLS
ALTER TABLE semiconductor_resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Resources are viewable by everyone"
  ON semiconductor_resources
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert resources"
  ON semiconductor_resources
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Only admins can update resources"
  ON semiconductor_resources
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create function to track video views
CREATE OR REPLACE FUNCTION track_video_view(resource_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE semiconductor_resources
  SET view_count = view_count + 1
  WHERE id = resource_id;
END;
$$;