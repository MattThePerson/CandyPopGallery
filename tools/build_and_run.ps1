# Runs the go backend
$ErrorActionPreference = "Stop"

# Set backend port
$BACKEND_PORT = 8020
$EXE_NAME = "App.exe"

# Navigate to project root
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

# Build and run go backend
Write-Host "[.ps1] Building go"
go mod tidy
go build -ldflags="-s -w" -o ".\bin\$EXE_NAME" .\cmd\app
if ($LASTEXITCODE -ne 0) {
    Write-Host "[.ps1] ERROR: Build exited with non-zero status $LASTEXITCODE"
    exit 1
}

# Run go
Write-Host "[.ps1] Starting $EXE_NAME on port $BACKEND_PORT and extra args: '$args'"
& .\bin\$EXE_NAME $args
