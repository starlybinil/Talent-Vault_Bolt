/*
  # Update access requests table with metadata
  
  1. Changes
    - Add metadata JSONB column to access_requests table
    - Store additional request information
*/

ALTER TABLE access_requests
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;