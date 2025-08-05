-- Create tables for the trade-in application

-- Device Categories
CREATE TABLE IF NOT EXISTS "DeviceCategory" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "displayOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Device Brands
CREATE TABLE IF NOT EXISTS "DeviceBrand" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "logoUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Device Models
CREATE TABLE IF NOT EXISTS "DeviceModel" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "modelNumber" TEXT,
  "categoryId" INTEGER NOT NULL REFERENCES "DeviceCategory"("id"),
  "brandId" INTEGER NOT NULL REFERENCES "DeviceBrand"("id"),
  "releaseYear" INTEGER,
  "imageUrl" TEXT,
  "displayOrder" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Device Storage Options
CREATE TABLE IF NOT EXISTS "DeviceStorageOption" (
  "id" SERIAL PRIMARY KEY,
  "deviceModelId" INTEGER NOT NULL REFERENCES "DeviceModel"("id"),
  "storage" TEXT NOT NULL,
  "excellentPrice" DECIMAL(10,2) NOT NULL,
  "goodPrice" DECIMAL(10,2) NOT NULL,
  "fairPrice" DECIMAL(10,2) NOT NULL,
  "poorPrice" DECIMAL(10,2) NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Device Conditions
CREATE TABLE IF NOT EXISTS "DeviceCondition" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS "Customer" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "province" TEXT,
  "postalCode" TEXT,
  "country" TEXT DEFAULT 'Canada',
  "passwordHash" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Staff Users
CREATE TABLE IF NOT EXISTS "StaffUser" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT DEFAULT 'staff',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Trade-in Orders
CREATE TABLE IF NOT EXISTS "TradeInOrder" (
  "id" SERIAL PRIMARY KEY,
  "orderNumber" TEXT NOT NULL UNIQUE,
  "customerId" INTEGER NOT NULL REFERENCES "Customer"("id"),
  "deviceModelId" INTEGER NOT NULL REFERENCES "DeviceModel"("id"),
  "deviceConditionId" INTEGER NOT NULL REFERENCES "DeviceCondition"("id"),
  "storageOptionId" INTEGER NOT NULL REFERENCES "DeviceStorageOption"("id"),
  "quotedAmount" DECIMAL(10,2) NOT NULL,
  "finalAmount" DECIMAL(10,2),
  "paymentMethod" TEXT,
  "notes" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "submittedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Order Status History
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES "TradeInOrder"("id"),
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "updatedBy" INTEGER REFERENCES "StaffUser"("id"),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES "TradeInOrder"("id"),
  "amount" DECIMAL(10,2) NOT NULL,
  "paymentMethodId" INTEGER NOT NULL REFERENCES "PaymentMethod"("id"),
  "status" TEXT DEFAULT 'PENDING',
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Device Categories
INSERT INTO "DeviceCategory" ("name", "description", "displayOrder") VALUES
('Smartphones', 'Mobile phones and smartphones', 1),
('Tablets', 'Tablets and iPads', 2),
('Laptops', 'Laptop computers', 3),
('Gaming Consoles', 'Video game consoles', 4)
ON CONFLICT ("name") DO NOTHING;

-- Device Brands
INSERT INTO "DeviceBrand" ("name") VALUES
('Apple'),
('Samsung'),
('Google'),
('Sony'),
('Microsoft'),
('Nintendo')
ON CONFLICT ("name") DO NOTHING;

-- Device Conditions
INSERT INTO "DeviceCondition" ("name", "description") VALUES
('Excellent', 'Like new condition'),
('Good', 'Minor wear and tear'),
('Fair', 'Visible wear but functional'),
('Poor', 'Significant damage')
ON CONFLICT ("name") DO NOTHING;

-- Payment Methods
INSERT INTO "PaymentMethod" ("name") VALUES
('E-transfer'),
('PayPal'),
('Cheque')
ON CONFLICT ("name") DO NOTHING;

-- Staff User (demo)
INSERT INTO "StaffUser" ("email", "firstName", "lastName", "passwordHash") VALUES
('admin@example.com', 'Admin', 'User', '$2b$10$demo.hash.for.testing')
ON CONFLICT ("email") DO NOTHING;

-- Enable Row Level Security
ALTER TABLE "DeviceCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeviceBrand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeviceModel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeviceStorageOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeviceCondition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PaymentMethod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TradeInOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "public can read device categories" ON "DeviceCategory" FOR SELECT TO anon USING (true);
CREATE POLICY "public can read device brands" ON "DeviceBrand" FOR SELECT TO anon USING (true);
CREATE POLICY "public can read device models" ON "DeviceModel" FOR SELECT TO anon USING (true);
CREATE POLICY "public can read device storage options" ON "DeviceStorageOption" FOR SELECT TO anon USING (true);
CREATE POLICY "public can read device conditions" ON "DeviceCondition" FOR SELECT TO anon USING (true);
CREATE POLICY "public can read payment methods" ON "PaymentMethod" FOR SELECT TO anon USING (true);

-- Create policies for authenticated users
CREATE POLICY "authenticated users can manage orders" ON "TradeInOrder" FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated users can manage customers" ON "Customer" FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated users can manage payments" ON "Payment" FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated users can manage order history" ON "OrderStatusHistory" FOR ALL TO authenticated USING (true);

-- Create policies for service role (full access)
CREATE POLICY "service role has full access" ON "DeviceCategory" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "DeviceBrand" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "DeviceModel" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "DeviceStorageOption" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "DeviceCondition" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "PaymentMethod" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "Customer" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "StaffUser" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "TradeInOrder" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "OrderStatusHistory" FOR ALL TO service_role USING (true);
CREATE POLICY "service role has full access" ON "Payment" FOR ALL TO service_role USING (true); 