# Runs the go backend
$ErrorActionPreference = "Stop"

# Set backend port
$BACKEND_PORT = 8020
$EXE_NAME = "App.exe"

# Navigate to project root
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

# Run go
Write-Host "[.ps1] Starting $EXE_NAME on port $BACKEND_PORT and extra args: '$args'"
& .\bin\$EXE_NAME $args
