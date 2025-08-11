# Pathwise AI - Simple Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pathwise AI - Starting Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "   (where frontend/ and backend/ folders are located)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start backend server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Blue
Write-Host "API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Close the command windows to stop the servers" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit" 