/*
  # Add has_degree function
  
  1. Changes
    - Add function to check if education array contains specific degree
    - Handle JSONB array elements
    - Return boolean result
*/

-- Create function to check if education array contains degree
CREATE OR REPLACE FUNCTION has_degree(edu jsonb, target_degree text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(edu) AS e
    WHERE e->>'degree' = target_degree
  );
$$;

-- Add comment explaining the function
COMMENT ON FUNCTION has_degree IS 'Checks if a candidate''s education array contains a specific degree';