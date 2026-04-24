-- Seed Data for Fast-Feast
-- To run: docker exec -i fast-feast-db psql -U postgres -d fastfeast_db < backend/seed.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing data
TRUNCATE TABLE "orderitem", "order", "fooditem", "category", "shop", "user" CASCADE;

-- 1. Create Users
-- Admin: admin123 | Others: password123
INSERT INTO "user" (id, email, full_name, role, hashed_password, is_active, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@fastfeast.com', 'Platform Admin', 'SUPER_ADMIN', '$2b$12$qLCpYf0ce3ZVq0tOJaV.uODSt3fq3ypaLXFRHipAxHrKIXNiHF3mq', true, NOW()),
('00000000-0000-0000-0000-000000000002', 'owner1@pizza.com', 'Marco Pizza', 'SHOP_OWNER', '$2b$12$ulczsywq2VmP2vNftx6npOXPJouCEPqWbhsUCP5stjisPDhzZUWAu', true, NOW()),
('00000000-0000-0000-0000-000000000003', 'owner2@burger.com', 'Bob Burger', 'SHOP_OWNER', '$2b$12$ulczsywq2VmP2vNftx6npOXPJouCEPqWbhsUCP5stjisPDhzZUWAu', true, NOW()),
('00000000-0000-0000-0000-000000000004', 'buyer1@example.com', 'John Buyer', 'BUYER', '$2b$12$ulczsywq2VmP2vNftx6npOXPJouCEPqWbhsUCP5stjisPDhzZUWAu', true, NOW()),
('00000000-0000-0000-0000-000000000005', 'staff1@pizza.com', 'Pizza Staff', 'SHOP_EMPLOYEE', '$2b$12$ulczsywq2VmP2vNftx6npOXPJouCEPqWbhsUCP5stjisPDhzZUWAu', true, NOW());

-- 2. Create Shops
INSERT INTO "shop" (id, owner_id, name, address, status, stripe_onboarded, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Bella Pizza', '123 Italy St', 'APPROVED', false, NOW()),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 'Big Burgers', '456 Grill Rd', 'APPROVED', false, NOW());

-- Link Staff to Shop
UPDATE "user" SET shop_id = '11111111-1111-1111-1111-111111111111' WHERE email = 'staff1@pizza.com';

-- 3. Create Categories
INSERT INTO "category" (id, shop_id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Classic Pizzas', 'Hand-tossed Italian pizzas'),
('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Beverages', 'Soft drinks and water'),
('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Beef Burgers', '100% Angus beef'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Sides', 'Fries and more');

-- 4. Create Food Items
INSERT INTO "fooditem" (id, shop_id, category_id, name, description, price, is_available, image_url) VALUES
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Margherita', 'Tomato sauce, mozzarella, basil', 12.00, true, 'https://via.placeholder.com/150'),
('f1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Pepperoni', 'Mozzarella and pepperoni slices', 15.50, true, 'https://via.placeholder.com/150'),
('f1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111112', 'Coca Cola', '500ml bottle', 2.50, true, 'https://via.placeholder.com/150'),
('f2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222221', 'Classic Cheese', 'Cheddar, lettuce, tomato', 10.00, true, 'https://via.placeholder.com/150'),
('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'French Fries', 'Large crispy fries', 4.00, true, 'https://via.placeholder.com/150');

-- 5. Create Sample Orders
INSERT INTO "order" (id, buyer_id, shop_id, total_amount, platform_fee, status, delivery_address, created_at) VALUES
('ae111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 27.50, 2.75, 'DELIVERED', 'Buyer Home, Street 1', NOW() - INTERVAL '1 day'),
('ae222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 14.00, 1.40, 'PENDING', 'Buyer Office, Block B', NOW());

-- 6. Create Order Items
INSERT INTO "orderitem" (id, order_id, food_item_id, quantity, price_at_purchase) VALUES
(uuid_generate_v4(), 'ae111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, 12.00),
(uuid_generate_v4(), 'ae111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111112', 1, 15.50),
(uuid_generate_v4(), 'ae222222-2222-2222-2222-222222222221', 'f2222222-2222-2222-2222-222222222221', 1, 10.00),
(uuid_generate_v4(), 'ae222222-2222-2222-2222-222222222221', 'f2222222-2222-2222-2222-222222222222', 1, 4.00);
