#!/bin/bash
set -e

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting QA Checks..."

# Frontend Checks
if [ -d "frontend" ]; then
  echo -e "
${GREEN}[Frontend] Checking...${NC}"
  cd frontend
  
  # Type Check / Build
  echo "Running build (includes type check)..."
  if npm run build; then
    echo -e "${GREEN}[Frontend] Build passed.${NC}"
  else
    echo -e "${RED}[Frontend] Build failed!${NC}"
    exit 1
  fi

  # Lint
  echo "Running lint..."
  if npm run lint; then
    echo -e "${GREEN}[Frontend] Lint passed.${NC}"
  else
    echo -e "${RED}[Frontend] Lint failed!${NC}"
    # Lint failures might not always be fatal depending on config, but for QA we warn
  fi
  
  # Test
  echo "Running tests..."
  if npm run test; then
    echo -e "${GREEN}[Frontend] Tests passed.${NC}"
  else
    echo -e "${RED}[Frontend] Tests failed!${NC}"
    exit 1
  fi
  
  cd ..
else
  echo "Frontend directory not found, skipping frontend checks."
fi

# Backend Checks (Basic)
if [ -f "requirements.txt" ]; then
  echo -e "
${GREEN}[Backend] Checking...${NC}"
  # Assuming python environment is active or available
  # simplistic check: compilation
  if python3 -m compileall . -q > /dev/null; then
     echo -e "${GREEN}[Backend] Syntax check passed.${NC}"
  else
     echo -e "${RED}[Backend] Syntax check failed!${NC}"
     exit 1
  fi
  
  # Run pytest if available
  if command -v pytest &> /dev/null; then
    echo "Running pytest..."
    if pytest; then
      echo -e "${GREEN}[Backend] Tests passed.${NC}"
    else
      echo -e "${RED}[Backend] Tests failed!${NC}"
      exit 1
    fi
  else
    echo "pytest not found, skipping backend tests."
  fi
fi

echo -e "
${GREEN}All QA checks completed successfully!${NC}"
