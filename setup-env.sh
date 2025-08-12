#!/bin/bash

echo "🌐 Setting up TradeIn Pro environment..."

# Create .env.local file with Supabase configuration
cat > apps/widget/.env.local << EOF
# Supabase Configuration
DATABASE_URL="your_supabase_database_url_here"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"

# JWT Configuration
JWT_SECRET="your_jwt_secret_here"

# App Configuration
NEXT_PUBLIC_SITE_ORIGIN="https://your-domain.vercel.app"
EOF

echo "✅ Environment variables set up successfully!"
echo "📝 Please update the placeholder values with your actual Supabase credentials"
echo "🚀 You can now run: pnpm dev" 