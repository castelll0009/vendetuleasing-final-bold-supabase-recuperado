-- Fix RLS: Allow users to see their own properties regardless of publication_status
-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Anyone can view published properties" ON properties;

-- Create two SELECT policies:
-- 1. Public: Anyone can see published properties
CREATE POLICY "Anyone can view published properties" ON properties
  FOR SELECT
  USING (publication_status = 'published');

-- 2. Owner: Users can see ALL their own properties (including pending_payment)
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- Update existing properties that have NULL publication_status to 'published'
-- so they continue to appear on the public site
UPDATE properties
SET publication_status = 'published'
WHERE publication_status IS NULL;
