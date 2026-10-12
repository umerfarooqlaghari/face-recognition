#!/usr/bin/env bash

# ==============================================================================
# Face Attendance - Start All Services
# Launches:
#   1. Backend  (FastAPI on http://localhost:8000)
#   2. Frontend (Next.js on http://localhost:3000)
#   3. Mobile   (Expo on iOS Simulator, port 8081)
# ==============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Colors
BOLD='\033[1m'
NC='\033[0m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'

echo -e "${BOLD}${CYAN}======================================================${NC}"
echo -e "${BOLD}${CYAN}    Face Attendance - Multi-Service Local Launcher    ${NC}"
echo -e "${BOLD}${CYAN}======================================================${NC}"

# 1. Cleanup trap for graceful shutdown
cleanup() {
  echo -e "\n${BOLD}${RED}Stopping all Face Attendance services...${NC}"
  kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" "${MOBILE_PID:-}" 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM EXIT

# 2. Kill any stale processes on ports 8000, 3000, 8081
echo -e "\n${YELLOW}[INFO] Clearing ports 8000, 3000, 8081...${NC}"
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :8081 | xargs kill -9 2>/dev/null || true

# 3. Ensure iOS Simulator is open
echo -e "${YELLOW}[INFO] Opening iOS Simulator...${NC}"
open -a Simulator || true

# 4. Start Backend (FastAPI)
echo -e "\n${BOLD}${GREEN}[1/3] Starting Backend (FastAPI on port 8000)...${NC}"
if [ -d "$ROOT_DIR/backend/venv" ]; then
  PYTHON_BIN="$ROOT_DIR/backend/venv/bin/python"
  UVICORN_BIN="$ROOT_DIR/backend/venv/bin/uvicorn"
elif [ -d "$ROOT_DIR/backend/.venv" ]; then
  PYTHON_BIN="$ROOT_DIR/backend/.venv/bin/python"
  UVICORN_BIN="$ROOT_DIR/backend/.venv/bin/uvicorn"
else
  PYTHON_BIN="python3"
  UVICORN_BIN="uvicorn"
fi

(
  cd "$ROOT_DIR/backend"
  $UVICORN_BIN app.main:app --reload --port 8000
) &
BACKEND_PID=$!

sleep 2

# 5. Start Frontend (Next.js)
echo -e "\n${BOLD}${BLUE}[2/3] Starting Frontend (Next.js on port 3000)...${NC}"
(
  cd "$ROOT_DIR/frontend"
  npm run dev -- --port 3000
) &
FRONTEND_PID=$!

sleep 2

# 6. Start Mobile (Expo on iOS Simulator)
echo -e "\n${BOLD}${CYAN}[3/3] Starting Mobile (Expo on iOS Simulator, port 8081)...${NC}"
(
  cd "$ROOT_DIR/mobile"
  npx expo start --ios --port 8081
) &
MOBILE_PID=$!

echo -e "\n${BOLD}${GREEN}[SUCCESS] All Face Attendance services are running!${NC}"
echo -e "  * ${BOLD}Backend API:${NC}      http://localhost:8000  (Docs: http://localhost:8000/docs)"
echo -e "  * ${BOLD}Web Portal:${NC}       http://localhost:3000"
echo -e "  * ${BOLD}Mobile (iOS):${NC}     Metro running on port 8081 (Simulator connected)"
echo -e "\nPress ${BOLD}Ctrl + C${NC} to stop all services.\n"

# Wait for background processes
wait "$BACKEND_PID" "$FRONTEND_PID" "$MOBILE_PID"
