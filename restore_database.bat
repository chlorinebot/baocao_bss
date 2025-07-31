@echo off
chcp 65001 >nul
echo ========================================
echo  SCRIPT KHÔI PHỤC DATABASE BSS SYSTEM
echo ========================================
echo.

:: Kiểm tra xem file SQL có tồn tại không
if not exist "COMPLETE_DATABASE_RECOVERY.sql" (
    echo ❌ LỖIX: Không tìm thấy file COMPLETE_DATABASE_RECOVERY.sql
    echo Hãy đảm bảo file này có trong thư mục hiện tại.
    pause
    exit /b 1
)

echo ✅ Đã tìm thấy file khôi phục database.
echo.

:: Yêu cầu xác nhận từ người dùng
echo ⚠️  CẢNH BÁO: Script này sẽ XÓA TẤT CẢ dữ liệu cũ trong database bc_bss!
echo.
set /p confirm="Bạn có chắc chắn muốn tiếp tục? (y/N): "
if /i not "%confirm%"=="y" (
    echo Hủy bỏ quá trình khôi phục.
    pause
    exit /b 0
)

echo.
echo 📋 Bắt đầu quá trình khôi phục...
echo.

:: Yêu cầu thông tin kết nối database
set /p mysql_user="Nhập username MySQL (mặc định: root): "
if "%mysql_user%"=="" set mysql_user=root

echo.
echo 🔄 Đang kết nối và khôi phục database...
echo Vui lòng nhập mật khẩu MySQL khi được yêu cầu.
echo.

:: Chạy script khôi phục
mysql -u %mysql_user% -p < COMPLETE_DATABASE_RECOVERY.sql

:: Kiểm tra kết quả
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ KHÔI PHỤC DATABASE THÀNH CÔNG!
    echo ========================================
    echo.
    echo 📊 Thông tin database đã khôi phục:
    echo   - Database: bc_bss
    echo   - Tổng số bảng: 11 bảng
    echo   - Stored procedures: 7
    echo   - Functions: 1
    echo   - Users mặc định: admin, user1-user4
    echo   - Servers mẫu: 3 servers
    echo.
    echo 🔍 Để kiểm tra database, bạn có thể chạy:
    echo   mysql -u %mysql_user% -p bc_bss
    echo.
    echo 📝 Xem file HUONG_DAN_KHOI_PHUC_DATABASE.md để biết thêm chi tiết.
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ LỖI: KHÔI PHỤC DATABASE THẤT BẠI!
    echo ========================================
    echo.
    echo 🔧 Các bước khắc phục:
    echo   1. Kiểm tra MariaDB/MySQL service đang chạy
    echo   2. Kiểm tra username/password chính xác
    echo   3. Đảm bảo user có quyền tạo database
    echo   4. Xem log lỗi để biết chi tiết
    echo.
    echo 📞 Để hỗ trợ, hãy chạy:
    echo   mysql -u %mysql_user% -p
    echo   sau đó chạy: source COMPLETE_DATABASE_RECOVERY.sql
    echo.
)

echo 📅 Thời gian hoàn thành: %date% %time%
echo.
pause 