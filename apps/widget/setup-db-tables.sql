-- Setup database tables for TradeIn Pro

-- Create device categories table
CREATE TABLE IF NOT EXISTS "device_categories" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "icon" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device brands table
CREATE TABLE IF NOT EXISTS "device_brands" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "logo_url" VARCHAR(500),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device conditions table
CREATE TABLE IF NOT EXISTS "device_conditions" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device models table
CREATE TABLE IF NOT EXISTS "device_models" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "model_number" VARCHAR(255),
    "release_year" INTEGER,
    "image_url" VARCHAR(500),
    "category_id" INTEGER NOT NULL REFERENCES "device_categories"("id"),
    "brand_id" INTEGER NOT NULL REFERENCES "device_brands"("id"),
    "display_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device storage options table
CREATE TABLE IF NOT EXISTS "device_storage_options" (
    "id" SERIAL PRIMARY KEY,
    "device_model_id" INTEGER NOT NULL REFERENCES "device_models"("id"),
    "storage" VARCHAR(255) NOT NULL,
    "excellent_price" DECIMAL(10,2) DEFAULT 0,
    "good_price" DECIMAL(10,2) DEFAULT 0,
    "fair_price" DECIMAL(10,2) DEFAULT 0,
    "poor_price" DECIMAL(10,2) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO "device_categories" ("name", "description", "icon", "is_active") VALUES
('Smartphones', 'Mobile phones and smartphones', '📱', true),
('Tablets', 'Tablets and iPads', '📱', true),
('Laptops', 'Laptop computers and notebooks', '💻', true),
('Gaming Consoles', 'Video game consoles', '🎮', true)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "device_brands" ("name", "logo_url", "is_active") VALUES
('Apple', '/logos/apple.png', true),
('Samsung', '/logos/samsung.png', true),
('Google', '/logos/google.png', true),
('Microsoft', '/logos/microsoft.png', true),
('Sony', '/logos/sony.png', true),
('Nintendo', '/logos/nintendo.png', true)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "device_conditions" ("name", "description", "is_active") VALUES
('Excellent', 'Like new condition with minimal wear', true),
('Good', 'Minor wear and tear, fully functional', true),
('Fair', 'Visible wear but still functional', true),
('Poor', 'Significant wear or damage', true)
ON CONFLICT ("name") DO NOTHING;

-- Insert sample device models
INSERT INTO "device_models" ("name", "model_number", "category_id", "brand_id", "release_year", "image_url", "display_order", "is_active") VALUES
('iPhone 15 Pro', 'A3094', 1, 1, 2023, '/images/iphone-15-pro.png', 1, true),
('iPhone 15', 'A3092', 1, 1, 2023, '/images/iphone-15.png', 2, true),
('Samsung Galaxy S24', 'SM-S921', 1, 2, 2024, '/images/galaxy-s24.png', 3, true),
('Google Pixel 8', 'G9BQD', 1, 3, 2023, '/images/pixel-8.png', 4, true),
('iPad Pro 12.9', 'A2436', 2, 1, 2022, '/images/ipad-pro.png', 5, true),
('MacBook Pro 14', 'A2779', 3, 1, 2023, '/images/macbook-pro.png', 6, true),
('Surface Pro 9', 'SP9', 3, 4, 2022, '/images/surface-pro.png', 7, true)
ON CONFLICT DO NOTHING;

-- Insert sample storage options
INSERT INTO "device_storage_options" ("device_model_id", "storage", "excellent_price", "good_price", "fair_price", "poor_price", "is_active") VALUES
(1, '128GB', 1200.00, 960.00, 720.00, 480.00, true),
(1, '256GB', 1400.00, 1120.00, 840.00, 560.00, true),
(1, '512GB', 1600.00, 1280.00, 960.00, 640.00, true),
(2, '128GB', 800.00, 640.00, 480.00, 320.00, true),
(2, '256GB', 900.00, 720.00, 540.00, 360.00, true),
(3, '128GB', 900.00, 720.00, 540.00, 360.00, true),
(3, '256GB', 1000.00, 800.00, 600.00, 400.00, true),
(4, '128GB', 700.00, 560.00, 420.00, 280.00, true),
(4, '256GB', 800.00, 640.00, 480.00, 320.00, true),
(5, '128GB', 1000.00, 800.00, 600.00, 400.00, true),
(5, '256GB', 1100.00, 880.00, 660.00, 440.00, true),
(6, '512GB', 1800.00, 1440.00, 1080.00, 720.00, true),
(6, '1TB', 2000.00, 1600.00, 1200.00, 800.00, true),
(7, '256GB', 1000.00, 800.00, 600.00, 400.00, true),
(7, '512GB', 1200.00, 960.00, 720.00, 480.00, true)
ON CONFLICT DO NOTHING;
