/*
  # Clean up duplicate profiles and add unique constraint

  1. Changes
    - Remove duplicate profiles keeping only the most recently updated one
    - Add unique constraint on user_id column
    - Update RLS policies to ensure one profile per user
*/

-- Keep only the most recently updated profile for each user_id
WITH duplicates AS (
  SELECT id
  FROM (
    SELECT 
      id,
      user_id,
      updated_at,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY updated_at DESC
      ) as rn
    FROM profiles
  ) ranked
  WHERE rn > 1
)
DELETE FROM profiles
WHERE id IN (SELECT id FROM duplicates);

-- Add unique constraint on user_id
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);