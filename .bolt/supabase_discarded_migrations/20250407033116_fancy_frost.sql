/*
  # Add nationality status constraint with data cleanup
  
  1. Changes
    - Update any NULL or invalid values to NULL
    - Add check constraint for nationality_status column
    - Ensure exact values match dropdown options
*/

-- First update any invalid values to NULL
UPDATE profiles
SET nationality_status = NULL
WHERE nationality_status IS NOT NULL
  AND nationality_status NOT IN (
    'US Citizen',
    'Green Card',
    'H1-B Eligible',
    'OPT/CPT',
    'TN Visa'
  );

-- Then add the check constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_nationality_status_check
CHECK (
  nationality_status IS NULL OR
  nationality_status IN (
    'US Citizen',
    'Green Card',
    'H1-B Eligible',
    'OPT/CPT',
    'TN Visa'
  )
);