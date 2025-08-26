#!/bin/bash

echo "🗄️  Setting up TradeIn Pro database tables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please run the setup first."
    exit 1
fi

echo "📊 Creating database tables..."

# You can run this SQL in your Supabase dashboard:
echo ""
echo "📝 To set up your database, please:"
echo ""
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Open your project: jhisfnskijvxeacjfovx"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of setup-db-tables.sql"
echo "5. Click 'Run' to execute the SQL"
echo ""
echo "📁 The SQL file is located at: apps/widget/setup-db-tables.sql"
echo ""
echo "✅ After running the SQL, restart your development server:"
echo "   pnpm dev"
echo ""
echo "🌐 Then test the endpoints:"
echo "   curl http://localhost:3000/api/debug-db"
echo "   curl http://localhost:3000/api/devices/catalog"
echo "   curl http://localhost:3000/api/devices/conditions"
