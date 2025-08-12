#!/bin/bash

echo "🌐 Setting up Cloud Database..."

# Create .env.local file
cat > apps/widget/.env.local << EOF
# Database (Supabase)
DATABASE_URL="your_supabase_database_url_here"



# Staff Authentication (for demo)
STAFF_EMAIL="admin@tradeinpro.com"
STAFF_PASSWORD="your_secure_password_here"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"
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