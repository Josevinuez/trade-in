-- Create tables for the trade-in application (without policies)

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

-- Add some sample device models with storage options
INSERT INTO "DeviceModel" ("name", "categoryId", "brandId", "releaseYear", "displayOrder") VALUES
('iPhone 15', 1, 1, 2023, 1),
('iPhone 14', 1, 1, 2022, 2),
('Galaxy S24', 1, 2, 2024, 3),
('iPad Pro', 2, 1, 2023, 1),
('MacBook Pro', 3, 1, 2023, 1),
('PS5', 4, 4, 2020, 1)
ON CONFLICT DO NOTHING;

-- Add storage options for iPhone 15
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(1, '128GB', 800.00, 700.00, 600.00, 400.00),
(1, '256GB', 900.00, 800.00, 700.00, 500.00),
(1, '512GB', 1000.00, 900.00, 800.00, 600.00)
ON CONFLICT DO NOTHING;

-- Add storage options for iPhone 14
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(2, '128GB', 700.00, 600.00, 500.00, 300.00),
(2, '256GB', 800.00, 700.00, 600.00, 400.00)
ON CONFLICT DO NOTHING;

-- Add storage options for Galaxy S24
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(3, '128GB', 750.00, 650.00, 550.00, 350.00),
(3, '256GB', 850.00, 750.00, 650.00, 450.00)
ON CONFLICT DO NOTHING;

-- Add storage options for iPad Pro
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(4, '128GB', 600.00, 500.00, 400.00, 250.00),
(4, '256GB', 700.00, 600.00, 500.00, 350.00)
ON CONFLICT DO NOTHING;

-- Add storage options for MacBook Pro
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(5, '512GB', 1200.00, 1000.00, 800.00, 500.00),
(5, '1TB', 1400.00, 1200.00, 1000.00, 700.00)
ON CONFLICT DO NOTHING;

-- Add storage options for PS5
INSERT INTO "DeviceStorageOption" ("deviceModelId", "storage", "excellentPrice", "goodPrice", "fairPrice", "poorPrice") VALUES
(6, '825GB', 400.00, 350.00, 300.00, 200.00)
ON CONFLICT DO NOTHING; 