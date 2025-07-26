@echo off
echo ==========================================
echo CHẠY ỨNG DỤNG - VERSION ĐÚNG
echo ==========================================

echo.
echo BACKEND: Chạy từ thư mục server/
cd server
start "Backend" cmd /k "echo BACKEND STARTING... && npm run start:dev"
cd ..

echo.
echo Đợi 3 giây...
timeout /t 3 /nobreak

echo.
echo FRONTEND: Chạy từ thư mục client/
cd client  
start "Frontend" cmd /k "echo FRONTEND STARTING... && npm run dev"
cd ..

echo.
echo ==========================================
echo ✅ ỨNG DỤNG ĐÃ CHẠY!
echo ==========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:9999
echo.
echo Bước tiếp theo:
echo 1. Chạy debug_database.sql trong MySQL
echo 2. Mở http://localhost:9999
echo 3. Chọn tháng 7/2025
echo 4. Xem kết quả!
echo.
pause 