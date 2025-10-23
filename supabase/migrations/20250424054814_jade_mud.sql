/*
  # Add community articles table
  
  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `url` (text, required)
      - `posted_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
*/

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Articles are viewable by everyone"
  ON articles
  FOR SELECT
  TO public
  USING (true);

-- Insert sample articles
INSERT INTO articles (title, description, url, posted_at) VALUES
  (
    'Introduction to VLSI Design',
    'Learn the fundamentals of VLSI design and layout',
    'https://blog.asu.edu/vlsi-design',
    now() - interval '2 hours'
  ),
  (
    'PCB Design Best Practices',
    'Essential tips for PCB design and manufacturing',
    'https://blog.asu.edu/pcb-design',
    now() - interval '1 day'
  ),
  (
    'Semiconductor Manufacturing Trends',
    'Latest trends in semiconductor manufacturing',
    'https://blog.asu.edu/semiconductor-trends',
    now() - interval '3 days'
  );

-- Add index for date-based queries
CREATE INDEX idx_articles_posted_at ON articles(posted_at);

-- Add comment explaining the table
COMMENT ON TABLE articles IS 'Stores community articles and resources';