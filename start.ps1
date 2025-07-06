# Script khởi động nhanh client và server cho Windows PowerShell
Write-Host "🚀 Bắt đầu khởi động ứng dụng..." -ForegroundColor Green
Write-Host "📦 Client: Next.js trên port 9999" -ForegroundColor Cyan
Write-Host "🖥️  Server: NestJS trên port mặc định" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor White

# Biến lưu trữ các job
$jobs = @()

try {
    # Khởi động server (NestJS) ở chế độ development
    Write-Host "🔧 Khởi động server (NestJS)..." -ForegroundColor Yellow
    $serverJob = Start-Job -ScriptBlock {
        Set-Location -Path (Join-Path $using:PWD "server")
        npm run start:dev
    }
    $jobs += $serverJob
    Write-Host "✅ Server đã được khởi động (Job ID: $($serverJob.Id))" -ForegroundColor Green

    # Đợi một chút để server khởi động
    Start-Sleep -Seconds 3

    # Khởi động client (Next.js) ở chế độ development
    Write-Host "🎨 Khởi động client (Next.js)..." -ForegroundColor Cyan
    $clientJob = Start-Job -ScriptBlock {
        Set-Location -Path (Join-Path $using:PWD "client")
        npm run dev
    }
    $jobs += $clientJob
    Write-Host "✅ Client đã được khởi động (Job ID: $($clientJob.Id))" -ForegroundColor Green

    Write-Host ""
    Write-Host "✅ Đã khởi động thành công!" -ForegroundColor Green
    Write-Host "🌐 Client: http://localhost:9999" -ForegroundColor Cyan
    Write-Host "🔗 Server: http://localhost:3000 (mặc định)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Nhấn Ctrl+C để dừng tất cả services" -ForegroundColor White
    Write-Host "💡 Hoặc chạy lệnh: Get-Job | Stop-Job" -ForegroundColor Gray
    Write-Host "==================================" -ForegroundColor White

    # Hiển thị output từ các job
    Write-Host "📊 Theo dõi logs (nhấn Ctrl+C để dừng):" -ForegroundColor Magenta
    
    # Vòng lặp để hiển thị output
    while ($true) {
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job
            if ($output) {
                Write-Host "[$($job.Name)] $output" -ForegroundColor Gray
            }
        }
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "❌ Đã xảy ra lỗi: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Dọn dẹp khi thoát
    Write-Host ""
    Write-Host "🛑 Đang dừng tất cả các service..." -ForegroundColor Red
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✅ Đã dừng tất cả services!" -ForegroundColor Green
} 