#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to the project root (one level up from scripts)
cd "$SCRIPT_DIR/.."

# Navigate to backend directory
cd backend

# Start the server in the background
echo "Starting Fast-Feast API server..."
uv run uvicorn main:app --host 0.0.0.0 --port 8000 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
MAX_RETRIES=10
COUNT=0
while ! curl -s http://localhost:8000/health > /dev/null; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "Error: Server failed to start."
        kill $SERVER_PID
        exit 1
    fi
done

# Run the E2E test script
chmod +x test_e2e.sh
./test_e2e.sh
TEST_EXIT_CODE=$?

# Stop the server
kill $SERVER_PID

exit $TEST_EXIT_CODE
