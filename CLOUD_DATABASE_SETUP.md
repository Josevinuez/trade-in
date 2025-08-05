# 🌐 Cloud Database Setup Guide

## **Option 1: Supabase (Recommended)**

### **Step 1: Create Supabase Account**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub
4. Create a new project

### **Step 2: Get Database URL**
1. Go to your Supabase project dashboard
2. Click "Settings" → "Database"
3. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

### **Step 3: Update Environment Variables**
Create `apps/widget/.env.local`:
```bash
# Database (Replace with your Supabase URL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_iPEm22ke0OXRYPKy_JC4ljlTfE31VVZAcyw7fjvyrlOFk0t"

# Staff Authentication (for demo)
STAFF_EMAIL="admin@tradeinpro.com"
STAFF_PASSWORD="admin123"
```

### **Step 4: Run Database Setup**
```bash
cd apps/widget
npx prisma db push
npx prisma db seed
```

## **Option 2: Vercel Postgres**

### **Step 1: Create Vercel Postgres**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Choose "Postgres"
4. Select your project

### **Step 2: Get Connection String**
1. Go to your Vercel project
2. Click "Storage" → "Postgres"
3. Copy the connection string

### **Step 3: Update Environment Variables**
Same as above, but use Vercel connection string.

## **Option 3: Neon (Serverless PostgreSQL)**

### **Step 1: Create Neon Account**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project

### **Step 2: Get Connection String**
1. Go to your Neon dashboard
2. Copy the connection string

### **Step 3: Update Environment Variables**
Same as above, but use Neon connection string.

## **🚀 Quick Start (Recommended: Supabase)**

1. **Create Supabase Account** → [supabase.com](https://supabase.com)
2. **Create Project** → Get connection string
3. **Create .env.local** → Use template above
4. **Run Setup** → `npx prisma db push && npx prisma db seed`
5. **Test** → Start your app and test

## **✅ Benefits of Cloud Database:**

- **No Local Setup** - No need for local PostgreSQL
- **Always Available** - Database is always running
- **Automatic Backups** - Cloud providers handle backups
- **Scalable** - Handles any amount of traffic
- **Production Ready** - Same database for dev and production
- **Free Tiers** - All options have generous free tiers

## **🔧 After Setup:**

1. **Test Connection** → `npx prisma db push`
2. **Seed Data** → `npx prisma db seed`
3. **Start App** → `pnpm dev`
4. **Verify** → Check that everything works

## **📞 Need Help?**

- **Supabase** → Great documentation and support
- **Vercel** → Perfect if you're deploying to Vercel
- **Neon** → Serverless PostgreSQL with branching

**Choose Supabase for the easiest setup!** 🎉 