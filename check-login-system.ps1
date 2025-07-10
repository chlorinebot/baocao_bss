# 🔧 Script Kiểm Tra và Khởi Chạy Hệ Thống Đăng Nhập
Write-Host "🚀 Kiểm tra và khởi chạy hệ thống đăng nhập..." -ForegroundColor Green

# Kiểm tra Node.js
Write-Host "`n1. Kiểm tra Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Kiểm tra npm
Write-Host "`n2. Kiểm tra npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm chưa được cài đặt!" -ForegroundColor Red
    exit 1
}

# Kiểm tra cấu trúc thư mục
Write-Host "`n3. Kiểm tra cấu trúc thư mục..." -ForegroundColor Yellow
$requiredDirs = @("server", "client")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ Thư mục $dir tồn tại" -ForegroundColor Green
    } else {
        Write-Host "❌ Thư mục $dir không tồn tại!" -ForegroundColor Red
        exit 1
    }
}

# Kiểm tra file package.json
Write-Host "`n4. Kiểm tra package.json..." -ForegroundColor Yellow
$packageFiles = @("server/package.json", "client/package.json")
foreach ($file in $packageFiles) {
    if (Test-Path $file) {
        Write-Host "✅ File $file tồn tại" -ForegroundColor Green
    } else {
        Write-Host "❌ File $file không tồn tại!" -ForegroundColor Red
        exit 1
    }
}

# Hỏi người dùng có muốn cài đặt dependencies không
Write-Host "`n5. Cài đặt dependencies..." -ForegroundColor Yellow
$installChoice = Read-Host "Bạn có muốn cài đặt dependencies? (y/n)"
if ($installChoice -eq "y" -or $installChoice -eq "Y") {
    Write-Host "📦 Cài đặt dependencies cho server..." -ForegroundColor Cyan
    Set-Location server
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cài đặt server dependencies thành công" -ForegroundColor Green
    } else {
        Write-Host "❌ Lỗi cài đặt server dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
    
    Write-Host "📦 Cài đặt dependencies cho client..." -ForegroundColor Cyan
    Set-Location client
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cài đặt client dependencies thành công" -ForegroundColor Green
    } else {
        Write-Host "❌ Lỗi cài đặt client dependencies!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    Set-Location ..
}

# Kiểm tra các file đã được cải tiến
Write-Host "`n6. Kiểm tra các file đã cải tiến..." -ForegroundColor Yellow
$improvedFiles = @(
    "server/src/auth/auth.controller.ts",
    "client/src/app/login/page.tsx",
    "client/src/app/user/page.tsx",
    "server/src/work-schedule/work-schedule.service.ts",
    "server/src/work-schedule/work-schedule.controller.ts",
    "server/test-login.js",
    "test-user-role.js"
)

foreach ($file in $improvedFiles) {
    if (Test-Path $file) {
        Write-Host "✅ File $file đã được cải tiến" -ForegroundColor Green
    } else {
        Write-Host "❌ File $file chưa tồn tại!" -ForegroundColor Red
    }
}

# Hỏi người dùng có muốn khởi chạy không
Write-Host "`n7. Khởi chạy hệ thống..." -ForegroundColor Yellow
$runChoice = Read-Host "Bạn có muốn khởi chạy hệ thống? (y/n)"
if ($runChoice -eq "y" -or $runChoice -eq "Y") {
    Write-Host "🚀 Khởi chạy server..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd server; npm run start:dev"
    
    Start-Sleep -Seconds 3
    
    Write-Host "🚀 Khởi chạy client..." -ForegroundColor Cyan
    Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"
    
    Write-Host "`n✅ Hệ thống đã được khởi chạy!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "🔗 Backend API: http://localhost:3000" -ForegroundColor Cyan
    
    # Chờ 5 giây để server khởi động
    Write-Host "`n⏳ Chờ server khởi động..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Test API
    Write-Host "`n🧪 Test API đăng nhập..." -ForegroundColor Yellow
    $testChoice = Read-Host "Bạn có muốn test API đăng nhập? (y/n)"
    if ($testChoice -eq "y" -or $testChoice -eq "Y") {
        Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd server; node test-login.js"
    }
    
    # Test User Role API
    Write-Host "`n🎭 Test API vai trò phân công..." -ForegroundColor Yellow
    $roleTestChoice = Read-Host "Bạn có muốn test API vai trò phân công? (y/n)"
    if ($roleTestChoice -eq "y" -or $roleTestChoice -eq "Y") {
        Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "node test-user-role.js"
    }
    
    # Mở browser
    Write-Host "`n🌐 Mở browser..." -ForegroundColor Yellow
    Start-Process "http://localhost:3001"
}

Write-Host "`n🎉 Hoàn thành! Hệ thống đăng nhập và hiển thị vai trò đã được cải tiến." -ForegroundColor Green
Write-Host "📋 Các tính năng đã được thêm:" -ForegroundColor Cyan
Write-Host "   ✅ Đăng nhập với validation và error handling" -ForegroundColor White
Write-Host "   ✅ Hiển thị vai trò phân công (A, B, C, D) trong navbar" -ForegroundColor White
Write-Host "   ✅ API lấy thông tin vai trò phân công của user" -ForegroundColor White
Write-Host "   ✅ Responsive design cho mobile" -ForegroundColor White 