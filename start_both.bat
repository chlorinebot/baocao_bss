@echo off
echo ==========================================
echo KHỞI ĐỘNG ỨNG DỤNG BSS
echo ==========================================

echo.
echo [1/2] Khởi động Backend (NestJS)...
cd server
start "Backend Server" cmd /k "echo Backend starting... && npm run start:dev"
cd ..

echo.
echo Đợi 5 giây để backend khởi động...
timeout /t 5 /nobreak

echo.
echo [2/2] Khởi động Frontend (Next.js)...  
cd client
start "Frontend Client" cmd /k "echo Frontend starting... && npm run dev"
cd ..

echo.
echo ==========================================
echo ✅ ỨNG DỤNG ĐÃ KHỞI ĐỘNG!
echo ==========================================
echo 🔗 Backend:  http://localhost:3000
echo 🔗 Frontend: http://localhost:9999
echo.
echo 📋 HƯỚNG DẪN:
echo 1. Chạy check_database_final.sql trong MySQL Workbench
echo 2. Mở http://localhost:9999 
echo 3. Chọn tháng 7/2025
echo 4. Kiểm tra kết quả!
echo.
pause 