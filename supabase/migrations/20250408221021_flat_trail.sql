/*
  # Add showphoto column to profile_settings table

  1. Changes
    - Add `showphoto` boolean column to `profile_settings` table with default value of TRUE
    - This column controls whether a user's profile photo is visible to others

  2. Security
    - No changes to RLS policies needed as the existing policies cover the new column
*/

ALTER TABLE profile_settings 
ADD COLUMN IF NOT EXISTS showphoto BOOLEAN DEFAULT TRUE;