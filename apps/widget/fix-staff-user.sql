-- Fix Missing Staff User Record
-- Run this in your Supabase SQL Editor

-- First, let's check what's in the staff table
SELECT 'Current staff table contents:' as info;
SELECT * FROM "public"."staff";

-- Now let's add the missing staff user
INSERT INTO "public"."staff" (email, "first_name", "last_name", role, "is_active", "created_at", "updated_at") VALUES (
  'staff@tradeinpro.com',
  'Demo',
  'Staff',
  'STAFF',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  "first_name" = EXCLUDED."first_name",
  "last_name" = EXCLUDED."last_name",
  role = EXCLUDED.role,
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();

-- Verify the user was added
SELECT 'After fix - staff table contents:' as info;
SELECT * FROM "public"."staff";

-- Test the lookup that was failing
SELECT 'Testing the lookup that was failing:' as info;
SELECT * FROM "public"."staff" 
WHERE email = 'staff@tradeinpro.com' 
AND "is_active" = true;
