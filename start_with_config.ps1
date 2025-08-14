# PathwiseAI Startup Script with Configuration Check
# This script helps you start the application with proper API key configuration

Write-Host "🚀 PathwiseAI Startup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if .env file exists in backend
$backendEnvPath = "backend\.env"
$frontendEnvPath = "frontend\.env.local"

Write-Host "`n📋 Checking Configuration Files..." -ForegroundColor Yellow

if (Test-Path $backendEnvPath) {
    Write-Host "✅ Backend .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env file not found" -ForegroundColor Red
    Write-Host "   Please create backend\.env file with your API keys" -ForegroundColor Yellow
    Write-Host "   See API_SETUP_GUIDE.md for instructions" -ForegroundColor Yellow
    Write-Host "`n   Example .env content:" -ForegroundColor Cyan
    Write-Host "   OPENAI_API_KEY=your_openai_api_key_here" -ForegroundColor Gray
    Write-Host "   SUPABASE_URL=your_supabase_project_url" -ForegroundColor Gray
    Write-Host "   SUPABASE_ANON_KEY=your_supabase_anon_key" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key" -ForegroundColor Gray
    Write-Host "   JWT_SECRET_KEY=your_secure_random_string_here" -ForegroundColor Gray
}

if (Test-Path $frontendEnvPath) {
    Write-Host "✅ Frontend .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend .env.local file not found (optional)" -ForegroundColor Yellow
}

# Check if Python is installed
Write-Host "`n🐍 Checking Python Installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python") {
        Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Python not found or not in PATH" -ForegroundColor Red
        Write-Host "   Please install Python 3.8+ and add it to PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Python not found or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Python 3.8+ and add it to PATH" -ForegroundColor Yellow
}

# Check if Node.js is installed
Write-Host "`n📦 Checking Node.js Installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v") {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
        Write-Host "   Please install Node.js 16+ and add it to PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Node.js 16+ and add it to PATH" -ForegroundColor Yellow
}

# Check if npm is installed
Write-Host "`n📦 Checking npm Installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($npmVersion -match "\d+\.\d+\.\d+") {
        Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm not found or not in PATH" -ForegroundColor Red
        Write-Host "   Please install npm and add it to PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ npm not found or not in PATH" -ForegroundColor Red
    Write-Host "   Please install npm and add it to PATH" -ForegroundColor Yellow
}

Write-Host "`n🔍 Configuration Summary:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check backend dependencies
if (Test-Path "backend\requirements.txt") {
    Write-Host "✅ Backend requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "❌ Backend requirements.txt not found" -ForegroundColor Red
}

# Check frontend dependencies
if (Test-Path "frontend\package.json") {
    Write-Host "✅ Frontend package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
}

Write-Host "`n🚀 Ready to Start?" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$startBackend = Read-Host "Do you want to start the backend server? (y/n)"
if ($startBackend -eq "y" -or $startBackend -eq "Y") {
    Write-Host "`n🐍 Starting Backend Server..." -ForegroundColor Green
    Write-Host "   Navigate to backend directory and run: python main.py" -ForegroundColor Yellow
    Write-Host "   Or use: cd backend && python main.py" -ForegroundColor Yellow
    
    # Optionally start backend
    $autoStart = Read-Host "Auto-start backend now? (y/n)"
    if ($autoStart -eq "y" -or $autoStart -eq "Y") {
        Write-Host "`n🚀 Starting Backend..." -ForegroundColor Green
        Set-Location "backend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py"
        Set-Location ".."
        Write-Host "✅ Backend started in new PowerShell window" -ForegroundColor Green
    }
}

$startFrontend = Read-Host "`nDo you want to start the frontend server? (y/n)"
if ($startFrontend -eq "y" -or $startFrontend -eq "Y") {
    Write-Host "`n📦 Starting Frontend Server..." -ForegroundColor Green
    Write-Host "   Navigate to frontend directory and run: npm run dev" -ForegroundColor Yellow
    Write-Host "   Or use: cd frontend && npm run dev" -ForegroundColor Yellow
    
    # Optionally start frontend
    $autoStart = Read-Host "Auto-start frontend now? (y/n)"
    if ($autoStart -eq "y" -or $autoStart -eq "Y") {
        Write-Host "`n🚀 Starting Frontend..." -ForegroundColor Green
        Set-Location "frontend"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
        Set-Location ".."
        Write-Host "✅ Frontend started in new PowerShell window" -ForegroundColor Green
    }
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. Ensure both servers are running" -ForegroundColor White
Write-Host "2. Backend should be at: http://localhost:8000" -ForegroundColor White
Write-Host "3. Frontend should be at: http://localhost:3000" -ForegroundColor White
Write-Host "4. Test the application by visiting http://localhost:3000" -ForegroundColor White

Write-Host "`n📚 Need Help?" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "• Check API_SETUP_GUIDE.md for detailed setup instructions" -ForegroundColor White
Write-Host "• Review error messages in the terminal windows" -ForegroundColor White
Write-Host "• Check browser console for frontend errors" -ForegroundColor White

Write-Host "`n✨ Happy Coding!" -ForegroundColor Green
Read-Host "Press Enter to exit"
