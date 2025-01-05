#!/bin/bash

#DEVICE_IP_ADDR="192.168.1.3"
UTILITY_NAME=cpop-gall

# Navigate to project directory
PROJECT_DIR="$(dirname "$(readlink -f "$0")")"
cd "$PROJECT_DIR"

# [NODE] Install dependnedies
cd frontend
echo "[NODE] Installing deps ..."
npm install
cd ..

# [FlaskAPI] Create and activate python virtual environment (if not already done)
cd backend
if [ ! -d ".venv" ]; then
    echo
    echo "[VENV] Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

chmod +x run.sh
echo
echo "To make symbolic link run:"
echo
echo "    sudo ln -fs "$(realpath run.sh)" /usr/local/bin/$UTILITY_NAME"
echo
echo "Then you'll have a CL utility called '$UTILITY_NAME'"
echo
