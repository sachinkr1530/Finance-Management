#!/bin/bash

echo "🚀 Setting up FinanceAI..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Server setup
echo -e "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm install
echo -e "${GREEN}✅ Server dependencies installed${NC}"

# Client setup
echo ""
echo -e "${BLUE}📦 Installing client dependencies...${NC}"
cd ../client
npm install
echo -e "${GREEN}✅ Client dependencies installed${NC}"

# Environment setup
cd ../server
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo -e "${YELLOW}⚠️  Please edit server/.env with your MongoDB URI and OpenAI API key${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To start the app:"
echo "  Terminal 1: cd server && npm run dev"
echo "  Terminal 2: cd client && npm start"
echo ""
echo "Visit http://localhost:3000"
