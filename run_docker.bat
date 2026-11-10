@echo off
echo ========================================================
echo   🚢 Menjalankan Nautical ERP Automation via Docker
echo ========================================================

echo 1. Memeriksa Docker...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop belum berjalan! 
    echo Silakan buka aplikasi Docker Desktop di Windows terlebih dahulu.
    pause
    exit /b 1
)

echo 2. Menjalankan Docker Compose (PostgreSQL + FastAPI + React UI)...
docker-compose up --build -d

echo 3. Menunggu container aktif...
timeout /t 5 >nul

echo 4. Mengisi database awal (seeding data maritim)...
docker-compose exec backend python app/seed.py

echo.
echo ========================================================
echo   ✅ Nautical ERP Berhasil Dijalankan!
echo   ------------------------------------------------------
echo   🌐 Frontend React UI : http://localhost:5173
echo   🚀 Backend API Docs  : http://localhost:8000/docs
echo   📊 Dashboard Fallback: http://localhost:8000/dashboard
echo ========================================================
echo.
pause
