#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT=8020
EXE_NAME="CandyPopGallery"

cd "$(dirname "$0")/.."

echo "[.sh] Starting $EXE_NAME on port $BACKEND_PORT and extra args: '$*'"
./bin/$EXE_NAME "$@"
