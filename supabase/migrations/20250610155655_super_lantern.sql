/*
  # Remove newsletter filtering and visibility restrictions
  
  1. Changes
    - Update RLS policies to make all articles publicly accessible
    - Remove employer visibility restrictions
    - Simplify access control
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Public can view public articles" ON news_articles;
DROP POLICY IF EXISTS "Employers can view employer-only articles" ON news_articles;

-- Create new policy that makes all articles public
CREATE POLICY "All articles are publicly viewable"
ON news_articles
FOR SELECT
TO public
USING (true);

-- Add comment explaining the change
COMMENT ON TABLE news_articles IS 'Stores news articles for the semiconductor workforce development newsletter with public access to all content';