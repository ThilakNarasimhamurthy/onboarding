-- Run this in your Supabase SQL Editor to set up the database

-- NOTE: If using ANON key instead of SERVICE key, you must disable RLS:
-- After creating tables, run: ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- (repeat for user_profiles and page_config)

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  current_step int default 1,
  created_at timestamp default now()
);

-- User profiles table
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  about_me text,
  street text,
  city text,
  state text,
  zip text,
  birthdate date,
  updated_at timestamp default now()
);

-- Page configuration table
create table page_config (
  component text primary key,  -- 'about_me' | 'address' | 'birthdate'
  page_number int not null     -- 2 or 3
);

-- Seed initial configuration
insert into page_config (component, page_number) values
  ('about_me', 2),
  ('address', 3),
  ('birthdate', 3);
