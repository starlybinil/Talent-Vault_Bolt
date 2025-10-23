/*
  # Update hero images with correct URLs

  1. Update hero images
    - Update URLs to match actual filenames in storage
*/

-- First, clear existing hero images
DELETE FROM hero_images;

-- Insert hero images with correct URLs
INSERT INTO hero_images (url, alt_text)
VALUES 
  ('hero-image-1.jpg', 'Students collaborating in microelectronics lab'),
  ('hero-image-2.jpg', 'Advanced semiconductor manufacturing facility'),
  ('hero-image-3.jpg', 'Engineers working on circuit design');