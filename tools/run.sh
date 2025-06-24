#!/bin/bash

# server ports
# DEVICE_IP_ADDR="192.168.1.3" # CHANGE THIS TO YOUR IP ADDRESS!!
BACKEND_PORT=8000

# Navigate to project directory
TOOLS_DIR="$(dirname "$(readlink -f "$0")")"
cd "$TOOLS_DIR.//"

# ARGS
EXTRA_ARGS=""
if [[ "$1" == "reload" ]]; then
    EXTRA_ARGS="--reload"
    shift
fi

# BUILD FRONTEND
cd frontend
echo "[NPM] Building frontend"
npm run build
cd ..

# CHECK VENV
if [ ! -d ".venv" ]; then
    echo "[VENV] No venv created, run 'tools/install.sh'"
    exit 1
fi

# START
print "[START] Starting uvicorn on port $BACKEND_PORT and extra args: '$EXTRA_ARGS'"
./.venv/bin/uvicorn main:app --host 0.0.0.0 --workers 1 --port $BACKEND_PORT $EXTRA_ARGS


