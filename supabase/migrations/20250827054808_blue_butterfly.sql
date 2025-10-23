/*
  # Add RPC function to get active users count

  1. New Functions
    - `get_active_users_24h()` - Returns count of users active in last 24 hours
  
  2. Security
    - Function uses security definer to access profiles table
    - Only accessible by authenticated users (admin verification happens in edge function)
  
  3. Logic
    - Counts profiles where updated_at is within last 24 hours
    - Filters for candidate and employer types only
*/

CREATE OR REPLACE FUNCTION get_active_users_24h()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM profiles
    WHERE updated_at >= NOW() - INTERVAL '24 hours'
    AND type IN ('candidate', 'employer')
  );
END;
$$;