/*
  # Update hero images

  1. Changes
    - Clear existing hero images
    - Insert new hero images with correct URLs and alt text
*/

-- Clear existing data
DELETE FROM hero_images;

-- Insert new hero images with correct URLs
INSERT INTO hero_images (url, alt_text) VALUES
  ('cleanroom.webp', 'Engineers in cleanroom suits working on semiconductor manufacturing'),
  ('wafer-inspection.webp', 'Advanced wafer inspection and quality control'),
  ('chip-design.webp', 'Team of engineers working on integrated circuit design'),
  ('semiconductor-fab.webp', 'State-of-the-art semiconductor fabrication facility'),
  ('testing-lab.webp', 'Microelectronics testing and validation laboratory');