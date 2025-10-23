/*
  # Add events table for upcoming events
  
  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `event_type` (text, required)
      - `start_date` (timestamptz, required)
      - `end_date` (timestamptz)
      - `location` (text)
      - `url` (text)
      - `timezone` (text, default 'MST')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for public read access
*/

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  url TEXT,
  timezone TEXT DEFAULT 'MST',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('career_fair', 'workshop', 'info_session', 'other'))
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO public
  USING (true);

-- Insert sample events
INSERT INTO events (title, description, event_type, start_date, location, url) VALUES
  (
    'Semiconductor Career Fair',
    'Connect with leading semiconductor companies hiring for various positions',
    'career_fair',
    NOW() + interval '15 days',
    'Virtual Event',
    'https://events.asu.edu/career-fair'
  ),
  (
    'Resume Workshop',
    'Learn how to create an effective resume for semiconductor industry positions',
    'workshop',
    NOW() + interval '22 days',
    'Online',
    'https://events.asu.edu/resume-workshop'
  );

-- Add index for date-based queries
CREATE INDEX idx_events_start_date ON events(start_date);

-- Add comment explaining the table
COMMENT ON TABLE events IS 'Stores upcoming events like career fairs and workshops';