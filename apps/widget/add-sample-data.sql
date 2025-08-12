-- Add Sample Data for Dashboard Testing
-- Run this in your Supabase SQL Editor

-- First, let's add some sample customers
INSERT INTO "public"."Customer" (email, "firstName", "lastName", phone, "addressLine1", city, province, "postalCode", country, "passwordHash", "createdAt", "updatedAt") VALUES
('john.doe@email.com', 'John', 'Doe', '+1-555-0101', '123 Main St', 'Toronto', 'ON', 'M5V 3A8', 'Canada', 'temp-hash', NOW(), NOW()),
('jane.smith@email.com', 'Jane', 'Smith', '+1-555-0102', '456 Oak Ave', 'Vancouver', 'BC', 'V6B 1A1', 'Canada', 'temp-hash', NOW(), NOW()),
('mike.johnson@email.com', 'Mike', 'Johnson', '+1-555-0103', '789 Pine Rd', 'Montreal', 'QC', 'H2Y 1C6', 'Canada', 'temp-hash', NOW(), NOW()),
('sarah.wilson@email.com', 'Sarah', 'Wilson', '+1-555-0104', '321 Elm St', 'Calgary', 'AB', 'T2P 1J9', 'Canada', 'temp-hash', NOW(), NOW()),
('david.brown@email.com', 'David', 'Brown', '+1-555-0105', '654 Maple Dr', 'Ottawa', 'ON', 'K1P 1J1', 'Canada', 'temp-hash', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Now let's add some sample trade-in orders
INSERT INTO "public"."TradeInOrder" ("orderNumber", "customerId", "deviceModelId", "deviceConditionId", "storageOptionId", "quotedAmount", "finalAmount", "status", "paymentMethod", notes, "submittedAt", "processedAt", "completedAt", "createdAt", "updatedAt") VALUES
('TI-2025-001', 1, 1, 1, 1, 450.00, 420.00, 'COMPLETED', 'Credit Card', 'Customer was very satisfied with the process', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
('TI-2025-002', 2, 2, 2, 2, 320.00, 300.00, 'PROCESSING', 'PayPal', 'Device in good condition', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('TI-2025-003', 3, 3, 1, 3, 280.00, NULL, 'PENDING', NULL, 'Awaiting device inspection', NOW() - INTERVAL '1 day', NULL, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('TI-2025-004', 4, 4, 3, 4, 180.00, NULL, 'PENDING', NULL, 'New customer, first trade-in', NOW(), NULL, NULL, NOW(), NOW()),
('TI-2025-005', 5, 1, 2, 1, 400.00, NULL, 'PENDING', NULL, 'Customer requested expedited processing', NOW(), NULL, NULL, NOW(), NOW())
ON CONFLICT ("orderNumber") DO NOTHING;

-- Add order status history for completed orders
INSERT INTO "public"."OrderStatusHistory" ("orderId", status, notes, "updatedBy", "createdAt") VALUES
(1, 'PENDING', 'Order created from staff dashboard', 1, NOW() - INTERVAL '5 days'),
(1, 'PROCESSING', 'Device received and inspected', 1, NOW() - INTERVAL '4 days'),
(1, 'COMPLETED', 'Payment processed and device recycled', 1, NOW() - INTERVAL '2 days'),
(2, 'PENDING', 'Order created from staff dashboard', 1, NOW() - INTERVAL '3 days'),
(2, 'PROCESSING', 'Device received and being evaluated', 1, NOW() - INTERVAL '2 days'),
(3, 'PENDING', 'Order created from staff dashboard', 1, NOW() - INTERVAL '1 day'),
(4, 'PENDING', 'Order created from staff dashboard', 1, NOW()),
(5, 'PENDING', 'Order created from staff dashboard', 1, NOW());

-- Add some sample payments
INSERT INTO "public"."Payment" ("orderId", amount, "paymentMethodId", status, "processedAt", "createdAt", "updatedAt") VALUES
(1, 420.00, 1, 'COMPLETED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 300.00, 2, 'PENDING', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Verify the data was added
SELECT 'Customers' as table_name, COUNT(*) as count FROM "public"."Customer"
UNION ALL
SELECT 'TradeInOrders' as table_name, COUNT(*) as count FROM "public"."TradeInOrder"
UNION ALL
SELECT 'OrderStatusHistory' as table_name, COUNT(*) as count FROM "public"."OrderStatusHistory"
UNION ALL
SELECT 'Payments' as table_name, COUNT(*) as count FROM "public"."Payment";
