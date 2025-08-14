# Start and Test Backend Script
Write-Host "🚀 Starting Pathwise AI Backend..." -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location "backend"

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install requirements
Write-Host "📚 Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Start backend server in background
Write-Host "🌐 Starting backend server..." -ForegroundColor Yellow
Start-Process python -ArgumentList "main.py" -WindowStyle Hidden

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend endpoints
Write-Host "🧪 Testing backend endpoints..." -ForegroundColor Yellow
python test_backend.py

# Keep the script running to maintain the backend
Write-Host "🔄 Backend is running. Press Ctrl+C to stop." -ForegroundColor Green
Write-Host "🌐 Backend URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan

try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "🛑 Stopping backend..." -ForegroundColor Yellow
    Get-Process python | Where-Object {$_.ProcessName -eq "python"} | Stop-Process -Force
    Write-Host "✅ Backend stopped" -ForegroundColor Green
}
