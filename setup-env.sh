#!/bin/bash

# Create .env.local file with Supabase configuration
cat > apps/widget/.env.local << EOF
# Supabase Configuration
DATABASE_URL="postgres://postgres.jhisfnskijvxeacjfovx:HvnsgwLvAqKNiOhs@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
NEXT_PUBLIC_SUPABASE_URL="https://jhisfnskijvxeacjfovx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaXNmbnNraWp2eGVhY2pmb3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjU5MjEsImV4cCI6MjA3MDAwMTkyMX0.uh46UXUAZQWnd6ZQaZWQwYA4l0B0C6gpMdmBpBq3vw0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaXNmbnNraWp2eGVhY2pmb3Z4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQyNTkyMSwiZXhwIjoyMDcwMDAxOTIxfQ.ky9Er_ZjQ4MVc0_zukP0PoBo92MK20j2uzSDbKMPihk"
SUPABASE_JWT_SECRET="qRGDfk1grxi1IR0awWR+p/9bDC9q2+fu7wRESJCDEN+XaKQA3GMiegiHf76Txh012FcYDTenJBDLRZIs8laqRA=="

# Database URLs for different connection types
POSTGRES_URL="postgres://postgres.jhisfnskijvxeacjfovx:HvnsgwLvAqKNiOhs@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.jhisfnskijvxeacjfovx:HvnsgwLvAqKNiOhs@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
EOF

echo "Environment variables set up successfully!"
echo "Please run the Supabase setup SQL script in your Supabase dashboard."
echo "You can find the SQL script in supabase-setup.sql" 