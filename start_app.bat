@echo off
echo 🌙 VortigenOS - Startup Script 🚀
echo ==========================================

echo [1/2] Starting Backend Server...
start "VortigenOS Backend" cmd /k "python src/super_app.py"

echo [2/2] Starting Frontend...
cd frontend
start "VortigenOS Frontend" cmd /k "npm run dev"

echo.
echo ✅ VortigenOS starting up!
echo 🌍 Frontend will be available at: http://localhost:5173
echo 🔌 Backend API is running at: http://localhost:8000
echo.
echo Press any key to exit this launcher (windows will stay open)...
pause
