/*
  # Update category labels in news_articles table
  
  1. Changes
    - Remove category constraint to allow any category value
    - Update existing category values to use new user-friendly labels
    - Add comment explaining the change
*/

-- Drop the category constraint
ALTER TABLE news_articles
DROP CONSTRAINT IF EXISTS valid_category;

-- Update existing category values
UPDATE news_articles
SET category = 
  CASE 
    WHEN category = 'industry_news' THEN 'Industry Insights'
    WHEN category = 'training' THEN 'Learning & Development'
    WHEN category = 'job_market' THEN 'Career Trends'
    WHEN category = 'technology' THEN 'Tech Innovations'
    ELSE category
  END;

-- Add comment explaining the change
COMMENT ON TABLE news_articles IS 'Stores news articles for the semiconductor workforce development newsletter with user-friendly category labels';