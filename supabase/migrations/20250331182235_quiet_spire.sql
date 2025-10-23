/*
  # Remove hero images table and storage

  This migration removes the hero_images table as it's no longer needed.
*/

-- Drop the hero_images table
DROP TABLE IF EXISTS hero_images;