/*
  # Add profile settings table
  
  1. New Tables
    - `profile_settings`
      - `user_id` (uuid, references profiles)
      - `profile_visibility` (text)
      - `email_notifications` (boolean)
      - `allow_messages` (boolean)
      - `show_contact_info` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create profile_settings table
CREATE TABLE profile_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public',
  email_notifications BOOLEAN DEFAULT true,
  allow_messages BOOLEAN DEFAULT true,
  show_contact_info BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own settings"
  ON profile_settings FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own settings"
  ON profile_settings FOR UPDATE
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own settings"
  ON profile_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));