/*
  # Add hero images for homepage carousel

  1. New Data
    - Add hero images with descriptive alt text
    - Images will be stored in the hero-images bucket
*/

-- Clear existing data
DELETE FROM hero_images;

-- Insert new hero images with correct URLs
INSERT INTO hero_images (url, alt_text) VALUES
  ('hero1.webp', 'Students working in semiconductor cleanroom'),
  ('hero2.webp', 'Advanced semiconductor manufacturing equipment'),
  ('hero3.webp', 'Engineers collaborating on chip design'),
  ('hero4.webp', 'Close-up of silicon wafer manufacturing');