@echo off
echo ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                                                           ║
echo ║    ██╗  ██╗██╗███╗   ███╗████████╗██╗   ██╗ █████╗ ███╗   ██╗    ██████╗ ███████╗██╗   ██╗                ║
echo ║    ██║ ██╔╝██║████╗ ████║╚══██╔══╝██║   ██║██╔══██╗████╗  ██║    ██╔══██╗██╔════╝██║   ██║                ║
echo ║    █████╔╝ ██║██╔████╔██║   ██║   ██║   ██║███████║██╔██╗ ██║    ██║  ██║█████╗  ██║   ██║                ║
echo ║    ██╔═██╗ ██║██║╚██╔╝██║   ██║   ██║   ██║██╔══██║██║╚██╗██║    ██║  ██║██╔══╝  ╚██╗ ██╔╝                ║
echo ║    ██║  ██╗██║██║ ╚═╝ ██║   ██║   ╚██████╔╝██║  ██║██║ ╚████║    ██████╔╝███████╗ ╚████╔╝                 ║
echo ║    ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═════╝ ╚══════╝  ╚═══╝                  ║
echo ║                                                                                                           ║
echo ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

echo 🚀 Bắt đầu khởi động ứng dụng...
echo 📦 Client: Next.js trên port 9999
echo 🖥️  Server: NestJS trên port mặc định
echo ==================================

echo 🔧 Khởi động server (NestJS)...
start "Server" cmd /k "cd /d server && npm run start:dev"

echo ⏳ Đợi server khởi động...
timeout /t 3 /nobreak >nul

echo 🎨 Khởi động client (Next.js)...
start "Client" cmd /k "cd /d client && npm run dev"

echo.
echo ✅ Đã khởi động thành công!
echo 🌐 Client: http://localhost:9999
echo 🔗 Server: http://localhost:3000 (mặc định)
echo.
echo 📝 Đóng các cửa sổ terminal để dừng services
echo ==================================
pause 