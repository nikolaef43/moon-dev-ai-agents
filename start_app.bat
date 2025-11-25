
@echo off
echo 🌙 Moon Dev AI Console - Startup Script 🚀
echo ==========================================

echo [1/2] Starting Backend Server...
start "Moon Dev Backend" cmd /k "python src/server.py"

echo [2/2] Starting Frontend...
cd frontend
start "Moon Dev Frontend" cmd /k "npm run dev"

echo.
echo ✅ System starting up!
echo 🌍 Frontend will be available at: http://localhost:5173
echo 🔌 Backend API is running at: http://localhost:8000
echo.
echo Press any key to exit this launcher (windows will stay open)...
pause
