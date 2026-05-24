#!/bin/bash

# Color codes for beautiful terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    Leaderboard Multi-Terminal Runner  ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Get the absolute path of the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure the sub-scripts are executable
chmod +x "$ROOT_DIR/client.sh" "$ROOT_DIR/server.sh"

echo -e "${GREEN}Opening Client and Server in separate terminal windows...${NC}"

# Open Client in a new Terminal window
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT_DIR' && ./client.sh\"" > /dev/null

# Brief pause to avoid launch overlap
sleep 1

# Open Server in a new Terminal window
osascript -e "tell application \"Terminal\" to do script \"cd '$ROOT_DIR' && ./server.sh\"" > /dev/null

echo -e "${GREEN}Successfully launched both processes in new terminals!${NC}"
