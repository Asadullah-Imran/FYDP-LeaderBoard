#!/bin/bash

# Color codes for beautiful terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}        Starting Server Dev Server      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Get the absolute path of the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check and install server dependencies if needed
if [ ! -d "$ROOT_DIR/server/node_modules" ]; then
    echo -e "${YELLOW}Server node_modules not found. Installing server dependencies...${NC}"
    cd "$ROOT_DIR/server" && npm install
else
    echo -e "${GREEN}Server dependencies already installed.${NC}"
fi

# Run the server dev server
echo -e "${GREEN}Starting server dev server in server directory...${NC}\n"
cd "$ROOT_DIR/server"
npm run dev
