#!/bin/bash

BASE_URL="http://localhost:8000/api/v1"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

function assert_status() {
    local expected=$1
    local actual=$2
    local message=$3
    if [ "$expected" == "$actual" ]; then
        echo -e "  [${GREEN}PASS${NC}] $message (Status: $actual)"
        PASSED=$((PASSED+1))
    else
        echo -e "  [${RED}FAIL${NC}] $message (Expected: $expected, Actual: $actual)"
        FAILED=$((FAILED+1))
    fi
}

echo -e "${BLUE}Starting End-to-End API Tests...${NC}"

# 1. Health Check
echo -e "\n${BLUE}Test 1: Health Check${NC}"
RESP=$(curl -s -w "%{http_code}" http://localhost:8000/health)
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
assert_status "200" "$STATUS" "Health check endpoint is reachable"

# 2. SuperAdmin Login
echo -e "\n${BLUE}Test 2: SuperAdmin Login${NC}"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@fastfeast.com", "password": "admin123"}')
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
ADMIN_TOKEN=$(echo $BODY | jq -r .access_token)
assert_status "200" "$STATUS" "SuperAdmin login successful"

# 3. Shop Registration
echo -e "\n${BLUE}Test 3: Shop Registration${NC}"
EMAIL="owner_$(date +%s)@example.com"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/register/shop" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$EMAIL\", \"password\": \"password123\", \"full_name\": \"New Owner\", \"shop_name\": \"Burger Joint\", \"shop_address\": \"456 Burger Ave\"}")
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
SHOP_ID=$(echo $BODY | jq -r .id)
assert_status "200" "$STATUS" "Shop registered successfully"

# 4. Admin Approves Shop
echo -e "\n${BLUE}Test 4: Admin Approves Shop${NC}"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/admin/shops/$SHOP_ID/verify" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"is_approved": true, "reason": "Verified"}')
STATUS=${RESP: -3}
assert_status "200" "$STATUS" "Admin verified shop"

# 5. Shop Owner Login
echo -e "\n${BLUE}Test 5: Shop Owner Login${NC}"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$EMAIL\", \"password\": \"password123\"}")
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
OWNER_TOKEN=$(echo $BODY | jq -r .access_token)
assert_status "200" "$STATUS" "Shop owner login successful"

# 6. Create Category
echo -e "\n${BLUE}Test 6: Create Category${NC}"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/shops/me/categories" \
     -H "Authorization: Bearer $OWNER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Fast Food"}')
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
CAT_ID=$(echo $BODY | jq -r .id)
assert_status "200" "$STATUS" "Category created"

# 7. Create Food Item
echo -e "\n${BLUE}Test 7: Create Food Item${NC}"
echo "dummy" > dummy.png
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/shops/me/items" \
     -H "Authorization: Bearer $OWNER_TOKEN" \
     -F "name=Classic Burger" \
     -F "description=Juicy" \
     -F "price=10.50" \
     -F "category_id=$CAT_ID" \
     -F "image=@dummy.png")
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
ITEM_ID=$(echo $BODY | jq -r .id)
assert_status "200" "$STATUS" "Food item created"
rm dummy.png

# 8. Buyer Registration & Login
echo -e "\n${BLUE}Test 8: Buyer Registration & Login${NC}"
B_EMAIL="buyer_$(date +%s)@example.com"
curl -s -X POST "$BASE_URL/auth/register/buyer" -H "Content-Type: application/json" \
     -d "{\"email\": \"$B_EMAIL\", \"password\": \"password123\", \"full_name\": \"Buyer\"}" > /dev/null
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"email\": \"$B_EMAIL\", \"password\": \"password123\"}")
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
BUYER_TOKEN=$(echo $BODY | jq -r .access_token)
assert_status "200" "$STATUS" "Buyer login successful"

# 9. Place Order
echo -e "\n${BLUE}Test 9: Place Order (CoD)${NC}"
RESP=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/orders" \
     -H "Authorization: Bearer $BUYER_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"shop_id\": \"$SHOP_ID\", \"delivery_address\": \"Home\", \"items\": [{\"food_item_id\": \"$ITEM_ID\", \"quantity\": 1}]}")
STATUS=${RESP: -3}
BODY=${RESP:0:${#RESP}-3}
ORDER_ID=$(echo $BODY | jq -r .id)
assert_status "200" "$STATUS" "Order placed successfully"

# 10. Update Order Status
echo -e "\n${BLUE}Test 10: Update Order Status${NC}"
RESP=$(curl -s -w "%{http_code}" -X PATCH "$BASE_URL/orders/$ORDER_ID/status" \
     -H "Authorization: Bearer $OWNER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "DELIVERED"}')
STATUS=${RESP: -3}
assert_status "200" "$STATUS" "Order status updated to DELIVERED"

echo -e "\n${BLUE}==============================${NC}"
echo -e "Tests Finished: ${GREEN}$PASSED Passed${NC}, ${RED}$FAILED Failed${NC}"
echo -e "${BLUE}==============================${NC}"

if [ $FAILED -gt 0 ]; then
    exit 1
fi
exit 0
