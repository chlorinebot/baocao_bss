#!/bin/bash

# Script khởi động production
echo "🚀 Khởi động ứng dụng ở chế độ production..."
echo "📦 Client: Next.js production build"
echo "🖥️  Server: NestJS production"
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

# Build client nếu chưa có
if [ ! -d "client/.next" ]; then
    echo "📦 Build client..."
    cd client
    npm run build
    cd ..
fi

# Build server nếu chưa có
if [ ! -d "server/dist" ]; then
    echo "🔧 Build server..."
    cd server
    npm run build
    cd ..
fi

# Khởi động server production
echo "🔧 Khởi động server production..."
cd server
npm run start:prod &
SERVER_PID=$!
cd ..

# Đợi một chút để server khởi động
sleep 3

# Khởi động client production
echo "🎨 Khởi động client production..."
cd client
npm run start &
CLIENT_PID=$!
cd ..

echo ""
echo "✅ Đã khởi động thành công ở chế độ production!"
echo "🌐 Client: http://localhost:3000"
echo "🔗 Server: http://localhost:3000 (API)"
echo ""
echo "📝 Nhấn Ctrl+C để dừng tất cả services"
echo "=================================="

# Đợi các process con
wait 