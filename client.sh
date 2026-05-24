#!/bin/bash

# Color codes for beautiful terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}        Starting Client Dev Server      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Get the absolute path of the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check and install client dependencies if needed
if [ ! -d "$ROOT_DIR/client/node_modules" ]; then
    echo -e "${YELLOW}Client node_modules not found. Installing client dependencies...${NC}"
    cd "$ROOT_DIR/client" && npm install
else
    echo -e "${GREEN}Client dependencies already installed.${NC}"
fi

# Run the client dev server
echo -e "${GREEN}Starting client dev server in client directory...${NC}\n"
cd "$ROOT_DIR/client"
npm run dev
