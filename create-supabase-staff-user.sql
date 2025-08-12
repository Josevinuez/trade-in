-- Create Staff User in Supabase using built-in authentication
-- Run this in your Supabase SQL Editor

-- First, create the user in Supabase's auth.users table
-- You can do this through the Supabase Dashboard > Authentication > Users
-- Or use the Supabase CLI

-- For now, let's create the staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."staff" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS "staff_email_key" ON "public"."staff"("email");

-- Insert the staff user (without password - Supabase handles authentication)
INSERT INTO "public"."staff" (email, first_name, last_name, role, is_active, created_at, updated_at) VALUES (
  'staff@tradeinpro.com',
  'Demo',
  'Staff',
  'STAFF',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- After running this:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter: staff@tradeinpro.com / staff123
-- 4. The user will be created in auth.users table
-- 5. The staff record will be linked by email

-- Note: Supabase handles password hashing, JWT tokens, and session management automatically
-- This is much more secure than custom authentication!
