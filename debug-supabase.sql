-- Debug script for Supabase setup
-- Run this in your Supabase SQL Editor

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_profiles', 'page_config');

-- 2. Check Row Level Security status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'user_profiles', 'page_config');

-- 3. Disable RLS if enabled (for development)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE page_config DISABLE ROW LEVEL SECURITY;

-- 4. Check page_config data
SELECT * FROM page_config;

-- 5. If page_config is empty, insert default data
INSERT INTO page_config (component, page_number) VALUES
  ('about_me', 2),
  ('address', 3),
  ('birthdate', 3)
ON CONFLICT (component) DO NOTHING;