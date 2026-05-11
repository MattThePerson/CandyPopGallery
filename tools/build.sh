#!/usr/bin/env bash
set -euo pipefail

EXE_NAME="CandyPopGallery"

cd "$(dirname "$0")/.."

echo "[.sh] Building go"
go mod tidy
go build -ldflags="-s -w" -o "./bin/$EXE_NAME" ./cmd/app
echo "[.sh] Build complete: ./bin/$EXE_NAME"
