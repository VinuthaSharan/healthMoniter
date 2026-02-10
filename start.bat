@echo off
echo.
echo ====================================
echo   Health Monitor Application
echo   Starting Server...
echo ====================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm packages are installed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo Starting Health Monitor Server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

node server/app.js

pause
