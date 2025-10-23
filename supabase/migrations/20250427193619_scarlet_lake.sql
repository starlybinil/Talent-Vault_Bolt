/*
  # Remove education statistics function
  
  1. Changes
    - Drop update_education_stats function
    - Drop related trigger
*/

-- Drop trigger that uses the function
DROP TRIGGER IF EXISTS update_education_stats_trigger ON profiles;

-- Drop the function
DROP FUNCTION IF EXISTS update_education_stats();