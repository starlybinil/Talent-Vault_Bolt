/*
  # Update hero images with correct URLs

  Updates the hero_images table with correct image URLs and alt text.
*/

-- Clear existing data
DELETE FROM hero_images;

-- Insert new hero images with correct URLs
INSERT INTO hero_images (url, alt_text) VALUES
  ('hero1.webp', 'Students working in semiconductor lab'),
  ('hero2.webp', 'Advanced chip manufacturing facility'),
  ('hero3.webp', 'Engineers collaborating on circuit design'),
  ('hero4.webp', 'Microelectronics research and development');