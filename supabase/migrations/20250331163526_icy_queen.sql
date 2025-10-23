/*
  # Update hero images data

  1. Changes
    - Clear existing data
    - Add new hero images with correct URLs
*/

-- Clear existing data
DELETE FROM hero_images;

-- Insert new hero images with correct URLs
INSERT INTO hero_images (url, alt_text) VALUES
  ('hero1.jpg', 'Students working in semiconductor lab'),
  ('hero2.jpg', 'Advanced chip manufacturing facility'),
  ('hero3.jpg', 'Engineers collaborating on circuit design'),
  ('hero4.jpg', 'Microelectronics research and development');