@echo off
echo ==========================================
echo CHẠY ỨNG DỤNG BSS - FIXED VERSION
echo ==========================================

echo.
echo [1/3] Kiểm tra thư mục...
if not exist "server" (
    echo ❌ Thư mục server không tồn tại!
    pause
    exit /b
)
if not exist "client" (
    echo ❌ Thư mục client không tồn tại!
    pause
    exit /b
)
echo ✅ Thư mục OK

echo.
echo [2/3] Chạy Backend (NestJS)...
cd server
echo Đang ở thư mục: %CD%
start "Backend Server" cmd /k "echo Backend starting... && npm run start:dev"
cd ..

echo.
echo Đợi 5 giây để backend khởi động...
timeout /t 5 /nobreak

echo.
echo [3/3] Chạy Frontend (Next.js)...
cd client
echo Đang ở thư mục: %CD%
start "Frontend Client" cmd /k "echo Frontend starting... && npm run dev"
cd ..

echo.
echo ==========================================
echo ✅ ỨNG DỤNG ĐÃ ĐƯỢC KHỞI ĐỘNG!
echo ==========================================
echo 🔗 Backend: http://localhost:3000
echo 🔗 Frontend: http://localhost:9999
echo.
echo 📋 Các bước tiếp theo:
echo 1. Chạy debug_database.sql trong MySQL
echo 2. Mở http://localhost:9999
echo 3. Vào "Ca làm việc hàng tháng"
echo 4. Chọn tháng 7/2025
echo 5. Mở Console (F12) để xem debug logs
echo.
pause 