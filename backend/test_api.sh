#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

echo "1. Testing Health Check..."
curl -s http://localhost:8000/health | jq .

echo -e "\n2. Testing Buyer Registration..."
curl -s -X POST "$BASE_URL/auth/register/buyer" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "buyer@example.com",
       "password": "password123",
       "full_name": "John Doe",
       "phone": "1234567890"
     }' | jq .

echo -e "\n3. Testing Shop Registration..."
curl -s -X POST "$BASE_URL/auth/register/shop" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "shop@example.com",
       "password": "password123",
       "full_name": "Shop Owner",
       "shop_name": "Best Pizza",
       "shop_address": "123 Pizza Street"
     }' | jq .

echo -e "\n4. Testing Login (Buyer)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "buyer@example.com",
       "password": "password123"
     }')
echo $LOGIN_RESPONSE | jq .

TOKEN=$(echo $LOGIN_RESPONSE | jq -r .access_token)

echo -e "\n5. Testing Get Me..."
curl -s -X GET "$BASE_URL/users/me" \
     -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n6. Testing Login (Admin)..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@fastfeast.com",
       "password": "admin123"
     }')
echo $ADMIN_LOGIN | jq .
