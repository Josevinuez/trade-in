#!/bin/bash

echo "🌐 Setting up Cloud Database..."

# Create .env.local file
cat > apps/widget/.env.local << EOF
# Database (Supabase)
DATABASE_URL="postgres://postgres.jhisfnskijvxeacjfovx:HvnsgwLvAqKNiOhs@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_iPEm22ke0OXRYPKy_JC4ljlTfE31VVZAcyw7fjvyrlOFk0t"

# Staff Authentication (for demo)
STAFF_EMAIL="admin@tradeinpro.com"
STAFF_PASSWORD="admin123"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://jhisfnskijvxeacjfovx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaXNmbnNraWp2eGVhY2pmb3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjU5MjEsImV4cCI6MjA3MDAwMTkyMX0.uh46UXUAZQWnd6ZQaZWQwYA4l0B0C6gpMdmBpBq3vw0"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaXNmbnNraWp2eGVhY2pmb3Z4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQyNTkyMSwiZXhwIjoyMDcwMDAxOTIxfQ.ky9Er_ZjQ4MVc0_zukP0PoBo92MK20j2uzSDbKMPihk"
EOF

echo "✅ Created .env.local file"

# Navigate to widget directory
cd apps/widget

echo "🔧 Setting up database..."

# Push schema to database
echo "📊 Pushing database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Cloud database setup complete!"
echo "🚀 You can now run: pnpm dev" 