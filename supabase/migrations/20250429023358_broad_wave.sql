/*
  # Add role type to contact messages
  
  1. Changes
    - Add role_type column to contact_messages table
    - Add check constraint for valid role types
    - Set default value to 'candidate'
*/

-- Add role_type column with constraint
ALTER TABLE contact_messages
ADD COLUMN role_type TEXT NOT NULL DEFAULT 'candidate'
CHECK (role_type IN ('candidate', 'employer'));