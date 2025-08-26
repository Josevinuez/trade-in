-- iPhone Data Insertion Script
-- This script adds iPhone 11 through iPhone 16 with proper storage options and pricing

-- First, let's add the iPhone models to the DeviceModel table
-- We'll assume Apple brand ID is 1 and Smartphones category ID is 1

-- iPhone 11 Series (2019)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 11', 'A2111', 1, 1, 2019, '/images/iPhone-11.webp', 1, true),
('iPhone 11 Pro', 'A2160', 1, 1, 2019, '/images/iPhone-11-Pro.webp', 2, true),
('iPhone 11 Pro Max', 'A2161', 1, 1, 2019, '/images/iPhone-11-Pro-Max.webp', 3, true);

-- iPhone 12 Series (2020)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 12 Mini', 'A2176', 1, 1, 2020, '/images/iPhone-12-Mini.webp', 4, true),
('iPhone 12', 'A2172', 1, 1, 2020, '/images/iPhone-12.webp', 5, true),
('iPhone 12 Pro', 'A2341', 1, 1, 2020, '/images/iPhone-12-Pro.webp', 6, true),
('iPhone 12 Pro Max', 'A2342', 1, 1, 2020, '/images/iPhone-12-Pro-Max.png', 7, true);

-- iPhone 13 Series (2021)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 13 Mini', 'A2481', 1, 1, 2021, '/images/Apple-iPhone-13-Mini.webp', 8, true),
('iPhone 13', 'A2482', 1, 1, 2021, '/images/Apple-iPhone-13.webp', 9, true),
('iPhone 13 Pro', 'A2483', 1, 1, 2021, '/images/Apple-iPhone-13-Pro.webp', 10, true),
('iPhone 13 Pro Max', 'A2484', 1, 1, 2021, '/images/Apple-iPhone-13-Pro-Max.webp', 11, true);

-- iPhone 14 Series (2022)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 14', 'A2649', 1, 1, 2022, '/images/iphone-14.png', 12, true),
('iPhone 14 Plus', 'A2632', 1, 1, 2022, '/images/iphone-14-plus.png', 13, true),
('iPhone 14 Pro', 'A2890', 1, 1, 2022, '/images/iphone-14-pro.png', 14, true),
('iPhone 14 Pro Max', 'A2892', 1, 1, 2022, '/images/iphone-14-pro-max.png', 15, true);

-- iPhone 15 Series (2023)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 15', 'A3090', 1, 1, 2023, '/images/iphone-15.png', 16, true),
('iPhone 15 Plus', 'A3091', 1, 1, 2023, '/images/iphone-15-plus.png', 17, true),
('iPhone 15 Pro', 'A3092', 1, 1, 2023, '/images/iPhone-15-Pro.png', 18, true),
('iPhone 15 Pro Max', 'A3093', 1, 1, 2023, '/images/iphone-15-pro-max.png', 19, true);

-- iPhone 16 Series (2024)
INSERT INTO "DeviceModel" (name, "modelNumber", "categoryId", "brandId", "releaseYear", "imageUrl", "displayOrder", "isActive") VALUES
('iPhone 16', 'A3094', 1, 1, 2024, '/images/iphone-16.png', 20, true),
('iPhone 16 Plus', 'A3095', 1, 1, 2024, '/images/iphone-16-plus.png', 21, true),
('iPhone 16 Pro', 'A3096', 1, 1, 2024, '/images/iphone-16-pro.png', 22, true),
('iPhone 16 Pro Max', 'A3097', 1, 1, 2024, '/images/iphone-16-pro-max.png', 23, true);

-- Now let's add storage options for each iPhone model
-- We'll use the IDs from the models we just inserted

-- iPhone 11 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11'), '64GB', 250.00, 200.00, 150.00, 100.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11'), '128GB', 275.00, 220.00, 165.00, 110.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11'), '256GB', 300.00, 240.00, 180.00, 120.00, true);

-- iPhone 11 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro'), '64GB', 350.00, 280.00, 210.00, 140.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro'), '256GB', 400.00, 320.00, 240.00, 160.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro'), '512GB', 450.00, 360.00, 270.00, 180.00, true);

-- iPhone 11 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro Max'), '64GB', 400.00, 320.00, 240.00, 160.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro Max'), '256GB', 450.00, 360.00, 270.00, 180.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 11 Pro Max'), '512GB', 500.00, 400.00, 300.00, 200.00, true);

-- iPhone 12 Mini Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Mini'), '64GB', 300.00, 240.00, 180.00, 120.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Mini'), '128GB', 325.00, 260.00, 195.00, 130.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Mini'), '256GB', 350.00, 280.00, 210.00, 140.00, true);

-- iPhone 12 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12'), '64GB', 350.00, 280.00, 210.00, 140.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12'), '128GB', 375.00, 300.00, 225.00, 150.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12'), '256GB', 400.00, 320.00, 240.00, 160.00, true);

-- iPhone 12 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro'), '128GB', 450.00, 360.00, 270.00, 180.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro'), '256GB', 500.00, 400.00, 300.00, 200.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro'), '512GB', 550.00, 440.00, 330.00, 220.00, true);

-- iPhone 12 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro Max'), '128GB', 500.00, 400.00, 300.00, 200.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro Max'), '256GB', 550.00, 440.00, 330.00, 220.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 12 Pro Max'), '512GB', 600.00, 480.00, 360.00, 240.00, true);

-- iPhone 13 Mini Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Mini'), '128GB', 375.00, 300.00, 225.00, 150.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Mini'), '256GB', 400.00, 320.00, 240.00, 160.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Mini'), '512GB', 450.00, 360.00, 270.00, 180.00, true);

-- iPhone 13 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13'), '128GB', 425.00, 340.00, 255.00, 170.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13'), '256GB', 450.00, 360.00, 270.00, 180.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13'), '512GB', 500.00, 400.00, 300.00, 200.00, true);

-- iPhone 13 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro'), '128GB', 525.00, 420.00, 315.00, 210.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro'), '256GB', 575.00, 460.00, 345.00, 230.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro'), '512GB', 625.00, 500.00, 375.00, 250.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro'), '1TB', 675.00, 540.00, 405.00, 270.00, true);

-- iPhone 13 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro Max'), '128GB', 575.00, 460.00, 345.00, 230.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro Max'), '256GB', 625.00, 500.00, 375.00, 250.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro Max'), '512GB', 675.00, 540.00, 405.00, 270.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 13 Pro Max'), '1TB', 725.00, 580.00, 435.00, 290.00, true);

-- iPhone 14 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14'), '128GB', 475.00, 380.00, 285.00, 190.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14'), '256GB', 500.00, 400.00, 300.00, 200.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14'), '512GB', 550.00, 440.00, 330.00, 220.00, true);

-- iPhone 14 Plus Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Plus'), '128GB', 525.00, 420.00, 315.00, 210.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Plus'), '256GB', 550.00, 440.00, 330.00, 220.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Plus'), '512GB', 600.00, 480.00, 360.00, 240.00, true);

-- iPhone 14 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro'), '128GB', 625.00, 500.00, 375.00, 250.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro'), '256GB', 675.00, 540.00, 405.00, 270.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro'), '512GB', 725.00, 580.00, 435.00, 290.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro'), '1TB', 775.00, 620.00, 465.00, 310.00, true);

-- iPhone 14 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro Max'), '128GB', 675.00, 540.00, 405.00, 270.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro Max'), '256GB', 725.00, 580.00, 435.00, 290.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro Max'), '512GB', 775.00, 620.00, 465.00, 310.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 14 Pro Max'), '1TB', 825.00, 660.00, 495.00, 330.00, true);

-- iPhone 15 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15'), '128GB', 525.00, 420.00, 315.00, 210.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15'), '256GB', 550.00, 440.00, 330.00, 220.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15'), '512GB', 600.00, 480.00, 360.00, 240.00, true);

-- iPhone 15 Plus Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Plus'), '128GB', 575.00, 460.00, 345.00, 230.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Plus'), '256GB', 600.00, 480.00, 360.00, 240.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Plus'), '512GB', 650.00, 520.00, 390.00, 260.00, true);

-- iPhone 15 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro'), '128GB', 675.00, 540.00, 405.00, 270.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro'), '256GB', 725.00, 580.00, 435.00, 290.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro'), '512GB', 775.00, 620.00, 465.00, 310.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro'), '1TB', 825.00, 660.00, 495.00, 330.00, true);

-- iPhone 15 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro Max'), '256GB', 775.00, 620.00, 465.00, 310.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro Max'), '512GB', 825.00, 660.00, 495.00, 330.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 15 Pro Max'), '1TB', 875.00, 700.00, 525.00, 350.00, true);

-- iPhone 16 Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16'), '128GB', 575.00, 460.00, 345.00, 230.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16'), '256GB', 600.00, 480.00, 360.00, 240.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16'), '512GB', 650.00, 520.00, 390.00, 260.00, true);

-- iPhone 16 Plus Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Plus'), '128GB', 625.00, 500.00, 375.00, 250.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Plus'), '256GB', 650.00, 520.00, 390.00, 260.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Plus'), '512GB', 700.00, 560.00, 420.00, 280.00, true);

-- iPhone 16 Pro Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro'), '128GB', 725.00, 580.00, 435.00, 290.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro'), '256GB', 775.00, 620.00, 465.00, 310.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro'), '512GB', 825.00, 660.00, 495.00, 330.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro'), '1TB', 875.00, 700.00, 525.00, 350.00, true);

-- iPhone 16 Pro Max Storage Options
INSERT INTO "DeviceStorageOption" ("deviceModelId", storage, "excellentPrice", "goodPrice", "fairPrice", "poorPrice", "isActive") VALUES
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro Max'), '256GB', 825.00, 660.00, 495.00, 330.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro Max'), '512GB', 875.00, 700.00, 525.00, 350.00, true),
((SELECT id FROM "DeviceModel" WHERE name = 'iPhone 16 Pro Max'), '1TB', 925.00, 740.00, 555.00, 370.00, true);

-- Verification query to see what we added
SELECT 
    m.name as "Model",
    m."releaseYear",
    COUNT(s.id) as "Storage Options",
    MIN(s."excellentPrice") as "Min Excellent Price",
    MAX(s."excellentPrice") as "Max Excellent Price"
FROM "DeviceModel" m
LEFT JOIN "DeviceStorageOption" s ON m.id = s."deviceModelId"
WHERE m.name LIKE 'iPhone%'
GROUP BY m.id, m.name, m."releaseYear"
ORDER BY m."releaseYear" DESC, m."displayOrder";
