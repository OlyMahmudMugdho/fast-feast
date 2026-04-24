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
('00000000-0000-0000-0000-000000000004', 'buyer1@example.com', 'John Buyer', 'BUYER', '$2b$12$ulczsywq2VmP2vNftx6npOXPJouCEPqWbhsUCP5stjisPDhzZUWAu', true, NOW());

-- 2. Create Shops
INSERT INTO "shop" (id, owner_id, name, address, status, logo_url, stripe_onboarded, created_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Bella Pizza & Grill', '123 Italy St', 'APPROVED', 'https://images.unsplash.com/photo-1513104890138-7c749659a591', false, NOW()),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 'The Gourmet Station', '456 Grill Rd', 'APPROVED', 'https://images.unsplash.com/photo-1550547660-d9450f859349', false, NOW());

-- 3. Create Categories
INSERT INTO "category" (id, shop_id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Main Course', 'Pizza and Grilled Specialties'),
('c1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Appetizers', 'Small bites and starters'),
('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Burgers & Beef', 'Premium beef selections'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Asian & Seafood', 'Wok and Grill items');

-- 4. Create Food Items
INSERT INTO "fooditem" (id, shop_id, category_id, name, description, price, is_available, image_url) VALUES
-- Pizza
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Artisan Margherita', 'Authentic Neapolitan pizza with fresh basil and buffalo mozzarella', 14.50, true, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
-- Chicken
('f1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111112', 'Crispy Roast Chicken', 'Herb-infused slow-roasted chicken with seasonal vegetables', 18.00, true, 'https://images.unsplash.com/photo-1606728035253-49e8a23146de'),
-- Burger
('f2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222221', 'The Signature Burger', 'Wagyu beef patty, aged cheddar, caramelised onions', 16.99, true, 'https://images.unsplash.com/photo-1550547660-d9450f859349'),
-- Beef
('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222221', 'Premium Ribeye Steak', 'Grain-fed beef steak served with truffle mash', 32.50, true, 'https://images.unsplash.com/photo-1576488489579-6967c02c56fc'),
-- Noodles
('f2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Authentic Spicy Noodles', 'Hand-pulled noodles with szechuan peppercorns and pork', 13.00, true, 'https://images.unsplash.com/photo-1585032226651-759b368d7246'),
-- Shrimp
('f2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Garlic Shrimp Scampi', 'Jumbo prawns sautéed in white wine and garlic butter', 24.00, true, 'https://images.unsplash.com/photo-1623188509154-fec43b95bf21');

-- 5. Create Sample Orders
INSERT INTO "order" (id, buyer_id, shop_id, total_amount, platform_fee, status, delivery_address, created_at) VALUES
('ae111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 32.50, 3.25, 'DELIVERED', 'Buyer Home, Street 1', NOW() - INTERVAL '1 day'),
('ae222222-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 16.99, 1.70, 'PENDING', 'Buyer Office, Block B', NOW());

-- 6. Create Order Items
INSERT INTO "orderitem" (id, order_id, food_item_id, quantity, price_at_purchase) VALUES
(uuid_generate_v4(), 'ae111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, 14.50),
(uuid_generate_v4(), 'ae111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111112', 1, 18.00),
(uuid_generate_v4(), 'ae222222-2222-2222-2222-222222222221', 'f2222222-2222-2222-2222-222222222221', 1, 16.99);
