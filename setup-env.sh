#!/bin/bash

# Create .env.local file with Supabase configuration
cat > apps/widget/.env.local << EOF
# Supabase Configuration
DATABASE_URL="your_supabase_database_url_here"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"
SUPABASE_JWT_SECRET="your_jwt_secret_here"

# Database URLs for different connection types
POSTGRES_URL="your_supabase_pooler_url_here"
POSTGRES_URL_NON_POOLING="your_supabase_direct_url_here"
EOF

echo "Environment variables set up successfully!"
echo "Please run the Supabase setup SQL script in your Supabase dashboard."
echo "You can find the SQL script in supabase-setup.sql" 