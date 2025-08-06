-- Seed data for the trade-in application

-- Insert device categories with icons
INSERT INTO "DeviceCategory" ("name", "description", "icon", "displayOrder", "isActive") VALUES
('Smartphones', 'Mobile phones and smartphones', 'https://cdn-icons-png.flaticon.com/512/0/191.png', 1, true),
('Tablets', 'Tablets and iPads', 'https://cdn-icons-png.flaticon.com/512/0/191.png', 2, true),
('Laptops', 'Laptop computers and notebooks', 'https://cdn-icons-png.flaticon.com/512/0/191.png', 3, true),
('Gaming Consoles', 'Video game consoles', 'https://cdn-icons-png.flaticon.com/512/0/191.png', 4, true)
ON CONFLICT ("name") DO NOTHING;

-- Insert device brands with logos
INSERT INTO "DeviceBrand" ("name", "logoUrl", "isActive") VALUES
('Apple', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Samsung', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Google', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Microsoft', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Sony', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Nintendo', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('Xiaomi', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true),
('OnePlus', 'https://cdn-icons-png.flaticon.com/512/0/191.png', true)
ON CONFLICT ("name") DO NOTHING;

-- Insert device conditions with descriptions
INSERT INTO "DeviceCondition" ("name", "description", "isActive") VALUES
('Excellent', 'Like new condition with minimal wear', true),
('Good', 'Minor wear and tear, fully functional', true),
('Fair', 'Visible wear but still functional', true),
('Poor', 'Significant wear or damage', true)
ON CONFLICT ("name") DO NOTHING;

-- Insert device models (you'll need to get the actual category and brand IDs)
-- This is a template - you'll need to run this after the categories and brands are created
-- and replace the categoryId and brandId with actual values

-- Example device models (uncomment and modify as needed):
/*
INSERT INTO "DeviceModel" ("name", "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 15 Pro', 'A3094', 1, 1, 2023, 'https://example.com/iphone15pro.jpg', 1, true),
('iPhone 15', 'A3092', 1, 1, 2023, 'https://example.com/iphone15.jpg', 2, true),
('Samsung Galaxy S24', 'SM-S921', 1, 2, 2024, 'https://example.com/galaxys24.jpg', 3, true),
('iPad Pro 12.9', 'A2436', 2, 1, 2022, 'https://example.com/ipadpro.jpg', 4, true),
('MacBook Pro 14', 'A2779', 3, 1, 2023, 'https://example.com/macbookpro.jpg', 5, true),
('PlayStation 5', 'CFI-1000', 4, 5, 2020, 'https://example.com/ps5.jpg', 6, true)
ON CONFLICT DO NOTHING;
*/ 