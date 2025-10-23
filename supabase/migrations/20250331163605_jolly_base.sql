/*
  # Update hero images to use webp format

  1. Changes
    - Clear existing data
    - Add new hero images with correct .webp file extensions
*/

-- Clear existing data
DELETE FROM hero_images;

-- Insert new hero images with correct URLs
INSERT INTO hero_images (url, alt_text) VALUES
  ('hero1.webp', 'Students working in semiconductor lab'),
  ('hero2.webp', 'Advanced chip manufacturing facility'),
  ('hero3.webp', 'Engineers collaborating on circuit design'),
  ('hero4.webp', 'Microelectronics research and development');