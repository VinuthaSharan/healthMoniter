#!/usr/bin/env pwsh

# Health Monitor Application Startup Script (PowerShell)
# This script starts the Health Monitor server on Windows

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "   Health Monitor Application" -ForegroundColor Green
Write-Host "   Starting Server..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download and install from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Error: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Start the server
Write-Host ""
Write-Host "Starting Health Monitor Server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node server/app.js
