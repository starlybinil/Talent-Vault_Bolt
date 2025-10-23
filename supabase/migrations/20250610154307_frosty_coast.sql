/*
  # Remove content filtering from news_articles table
  
  1. Changes
    - Remove category constraint from news_articles table
    - Allow any category value to be stored
    - Maintain existing RLS policies for access control
*/

-- Drop the category constraint
ALTER TABLE news_articles
DROP CONSTRAINT IF EXISTS valid_category;

-- Add comment explaining the change
COMMENT ON TABLE news_articles IS 'Stores news articles for the semiconductor workforce development newsletter without content filtering';