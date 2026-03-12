-- Fix for page_config table schema
-- Run this in your Supabase SQL Editor

-- Drop the existing table and recreate with proper schema
DROP TABLE IF EXISTS page_config;

-- Create new table with composite primary key
CREATE TABLE page_config (
  id uuid primary key default gen_random_uuid(),
  component text not null,  -- 'about_me' | 'address' | 'birthdate'
  page_number int not null, -- 2 or 3
  created_at timestamp default now(),
  -- Allow same component on different pages, but not duplicate component+page combinations
  UNIQUE(component, page_number)
);

-- Seed initial configuration
INSERT INTO page_config (component, page_number) VALUES
  ('about_me', 2),
  ('address', 3),
  ('birthdate', 3);

-- Verify the data
SELECT * FROM page_config ORDER BY page_number, component;