#!/bin/bash

# Script khởi động nhanh client và server
echo "🚀 Bắt đầu khởi động ứng dụng..."
echo "📦 Client: Next.js trên port 9999"
echo "🖥️  Server: NestJS trên port mặc định"
echo "=================================="

# Hàm để dọn dẹp khi thoát
cleanup() {
    echo ""
    echo "🛑 Đang dừng tất cả các service..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Thiết lập trap để dọn dẹp khi nhấn Ctrl+C
trap cleanup SIGINT SIGTERM

# Khởi động server (NestJS) ở chế độ development
echo "🔧 Khởi động server (NestJS)..."
cd server
npm run start:dev &
SERVER_PID=$!
cd ..

# Đợi một chút để server khởi động
sleep 3

# Khởi động client (Next.js) ở chế độ development
echo "🎨 Khởi động client (Next.js)..."
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Đã khởi động thành công!"
echo "🌐 Client: http://localhost:9999"
echo "🔗 Server: http://localhost:3000 (mặc định)"
echo ""
echo "📝 Nhấn Ctrl+C để dừng tất cả services"
echo "=================================="

# Đợi các process con
wait 