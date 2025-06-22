#!/bin/bash

UTILITY_NAME=cpop-gall
UTILITY_BIN_DIR=~/WhisperaHQ/bin

# Navigate to project directory
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
cd "$SCRIPT_DIR/.."

# [NODE] Install dependnedies
echo
echo "[NODE] Installing deps ..."
cd frontend
npm install
cd ..

# [PYTHON] Create and activate python virtual environment (if not already done)
# cd backend
echo
if [ ! -d ".venv" ]; then
    echo "[PYTHON] Creating virtual environment..."
    python3 -m venv .venv
fi
echo "[PYTHON] Installing requirements into .venv"
source .venv/bin/activate
pip install -r requirements.txt
deactivate

# [SYMLINK] Create symlink to tools/run.sh
echo
echo "[SYMLINK] Creating symbolic link between 'tools/run.sh' -> '$UTILITY_BIN_DIR/$UTILITY_NAME'"
chmod +x tools/run.sh

if [ ! -d "$UTILITY_BIN_DIR" ]; then
    echo "ERROR: no such folder '$UTILITY_BIN_DIR'. Set UTILITY_BIN_DIR to folder on path that exists."
else
    ln -sf "$(realpath tools/run.sh)" "$UTILITY_BIN_DIR/$UTILITY_NAME"
    echo 
    echo "Done! Start program with '$UTILITY_NAME'"
fi

echo
