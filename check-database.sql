-- Check Database Structure
-- Run this in your Supabase SQL Editor to see what tables exist

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if the staff table exists and show its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'staff'
ORDER BY ordinal_position;

-- Check if there are any other staff-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name ILIKE '%staff%'
ORDER BY table_name;

-- Check if there are any other user-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name ILIKE '%user%'
ORDER BY table_name;
