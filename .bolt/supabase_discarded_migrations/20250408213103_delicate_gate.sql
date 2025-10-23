/*
  # Fix Schema Issues

  1. New Tables
    - `micro_credentials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `issuer` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_credentials`
      - `user_id` (uuid, references profiles)
      - `credential_id` (uuid, references micro_credentials)
      - `earned_at` (timestamp)
      - `expires_at` (timestamp, nullable)
      - `badge_url` (text, nullable)

  2. Changes to Existing Tables
    - Add `bio` column to `profiles` table
    - Add function to calculate profile completeness

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create micro_credentials table
CREATE TABLE IF NOT EXISTS micro_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  issuer text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  credential_id uuid REFERENCES micro_credentials(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  badge_url text,
  PRIMARY KEY (user_id, credential_id)
);

-- Add bio column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE micro_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for micro_credentials
CREATE POLICY "Anyone can view micro_credentials"
  ON micro_credentials
  FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_credentials
CREATE POLICY "Users can view their own credentials"
  ON user_credentials
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own credentials"
  ON user_credentials
  FOR ALL
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ))
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- Create or replace the profile completeness function
CREATE OR REPLACE FUNCTION calculate_profile_completeness(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_fields integer := 8;
  filled_fields integer := 0;
BEGIN
  SELECT COUNT(*)
  INTO filled_fields
  FROM (
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.first_name IS NOT NULL
      AND p.first_name != ''
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.last_name IS NOT NULL
      AND p.last_name != ''
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.bio IS NOT NULL
      AND p.bio != ''
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.technical_skills IS NOT NULL
      AND p.technical_skills != '[]'
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.soft_skills IS NOT NULL
      AND p.soft_skills != '[]'
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.projects IS NOT NULL
      AND p.projects != '[]'
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM user_credentials uc
      WHERE uc.user_id = profile_id
      LIMIT 1
    )
    UNION ALL
    SELECT 1 WHERE EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
      AND p.linkedin IS NOT NULL
      AND p.linkedin != ''
    )
  ) AS filled;

  RETURN (filled_fields::float / total_fields * 100)::integer;
END;
$$;