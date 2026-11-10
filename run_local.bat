@echo off
echo ========================================================
echo   🚢 Menjalankan Nautical ERP Secara Lokal (Tanpa Docker)
echo ========================================================

echo 1. Mengisi database lokal...
cd backend
..\.venv\Scripts\python app/seed.py

echo 2. Menjalankan Backend FastAPI di port 8000...
start "Nautical ERP Backend" ..\.venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

echo 3. Menjalankan Frontend React di port 5173...
cd ..\frontend
start "Nautical ERP Frontend" cmd /k "npm run dev"

echo.
echo ========================================================
echo   ✅ Nautical ERP Berhasil Dijalankan Secara Lokal!
echo   ------------------------------------------------------
echo   🌐 Frontend React UI : http://localhost:5173
echo   🚀 Backend API Docs  : http://localhost:8000/docs
echo ========================================================
echo.
pause
