@echo off
echo ========================================
echo 🚀 Pathwise AI - Starting Application
echo ========================================
echo.

echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 📊 Backend API: http://127.0.0.1:8000
echo 📊 API Docs: http://127.0.0.1:8000/docs
echo 🎨 Frontend: http://localhost:3000
echo.
echo 🛑 Close the command windows to stop the servers
echo ========================================
pause 