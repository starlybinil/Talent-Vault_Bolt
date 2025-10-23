/*
  # Add showPhoto column to profile_settings

  1. Changes
    - Add `showPhoto` column to `profile_settings` table with default value TRUE
    - This allows users to control the visibility of their profile photo

  2. Security
    - No changes to RLS policies needed as the existing policies cover the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profile_settings' 
    AND column_name = 'showPhoto'
  ) THEN
    ALTER TABLE profile_settings 
    ADD COLUMN showPhoto BOOLEAN DEFAULT TRUE;
  END IF;
END $$;