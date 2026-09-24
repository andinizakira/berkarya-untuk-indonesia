@echo off
title Menjalankan Website Berkarya Untuk Indonesia
echo ========================================================
echo   Menjalankan Website Berkarya Untuk Indonesia
echo ========================================================
echo.

:: 1. Jalankan Backend PHP di background window
echo [1/2] Menjalankan Backend PHP (port 8080)...
start "Backend Server (PHP)" cmd /k "cd /d %~dp0symfony && php -S 127.0.0.1:8080 server.php"

:: 2. Jalankan Frontend Next.js di background window
echo [2/2] Menjalankan Frontend Next.js (port 3000)...
start "Frontend Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Server Berhasil Dijalankan!
echo   - Halaman Utama : http://localhost:3000
echo   - Admin Panel   : http://localhost:3000/admin (Password: admin123)
echo   - Backend API   : http://localhost:8080
echo ========================================================
echo.
timeout /t 3 >nul
start http://localhost:3000/admin
