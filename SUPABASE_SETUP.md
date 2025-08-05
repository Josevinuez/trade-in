# Supabase Setup Instructions

## 1. Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open your project
3. Go to the SQL Editor
4. Copy and paste the contents of `supabase-setup.sql` into the SQL Editor
5. Run the script to create all the necessary tables and sample data

## 2. Storage Setup

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `images`
3. Set the bucket to public (for demo purposes)
4. Set the following policies for the `images` bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow service role to upload (for API access)
CREATE POLICY "Service role can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'service_role');
```

## 3. Environment Variables

The environment variables have been set up in `.env.local` with your Supabase credentials:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `DATABASE_URL`: Your Supabase database URL

## 4. Sample Data

The setup script includes sample data for:
- Device Categories (Smartphones, Tablets, Laptops, Gaming Consoles)
- Device Brands (Apple, Samsung, Google, Sony, Microsoft, Nintendo)
- Device Conditions (Excellent, Good, Fair, Poor)
- Payment Methods (E-transfer, PayPal, Cheque)
- Staff User (admin@example.com)

## 5. Testing the Application

1. Run the development server: `pnpm dev`
2. Visit http://localhost:3000
3. Test the trade-in form
4. Test the staff dashboard at http://localhost:3000/staff-dashboard
5. Test the track order page at http://localhost:3000/track-order

## 6. Deployment

The application is now ready for deployment on Vercel. The build process has been updated to work with Supabase instead of Prisma.

## 7. Key Changes Made

- ✅ Removed Prisma dependencies
- ✅ Added Supabase client
- ✅ Updated all API endpoints to use Supabase
- ✅ Updated image upload to use Supabase Storage
- ✅ Updated authentication to use Supabase
- ✅ Created database schema for Supabase
- ✅ Added sample data
- ✅ Updated build process

## 8. Features Working

- ✅ Trade-in form submission
- ✅ Order tracking
- ✅ Staff dashboard
- ✅ Device management
- ✅ Brand management
- ✅ Image uploads
- ✅ Customer management
- ✅ Order management

The application is now fully migrated to Supabase and ready for use! 