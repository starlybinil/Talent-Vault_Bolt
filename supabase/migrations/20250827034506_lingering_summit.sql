/*
  # Create admin count functions

  1. New Functions
    - `get_candidate_count()` - Returns count of candidate profiles
    - `get_employer_count()` - Returns count of employer profiles
  
  2. Security
    - Functions are security definer (run with creator privileges)
    - Only accessible by admin users
    - Bypass RLS policies for counting
*/

-- Function to get candidate count for admins
CREATE OR REPLACE FUNCTION get_candidate_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  candidate_count INTEGER;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Count candidates (bypasses RLS due to SECURITY DEFINER)
  SELECT COUNT(*)::INTEGER
  INTO candidate_count
  FROM profiles
  WHERE type = 'candidate';

  RETURN candidate_count;
END;
$$;

-- Function to get employer count for admins
CREATE OR REPLACE FUNCTION get_employer_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  employer_count INTEGER;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Count employers (bypasses RLS due to SECURITY DEFINER)
  SELECT COUNT(*)::INTEGER
  INTO employer_count
  FROM profiles
  WHERE type = 'employer';

  RETURN employer_count;
END;
$$;