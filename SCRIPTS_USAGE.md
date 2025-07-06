# 🚀 Hướng dẫn sử dụng Scripts khởi động

## Các script có sẵn

### 1. Development (Phát triển)

#### Windows:
```bash
# Sử dụng Batch file (đơn giản nhất)
start-dev.bat

# Sử dụng PowerShell
./start.ps1

# Sử dụng Git Bash
./start.sh
```

#### Linux/Mac:
```bash
# Cấp quyền thực thi (chỉ lần đầu)
chmod +x start.sh

# Chạy script
./start.sh
```

### 2. Production (Sản xuất)

#### Linux/Mac:
```bash
# Cấp quyền thực thi (chỉ lần đầu)
chmod +x start-production.sh

# Chạy script
./start-production.sh
```

## Chi tiết từng script

### 📁 start-dev.bat
- **Platform**: Windows Command Prompt
- **Mô tả**: Mở 2 cửa sổ terminal riêng biệt cho client và server
- **Ưu điểm**: Đơn giản, dễ sử dụng
- **Nhược điểm**: Cần đóng thủ công từng cửa sổ

### 📁 start.sh
- **Platform**: Linux/Mac/Git Bash
- **Mô tả**: Chạy cả client và server trong cùng một terminal
- **Ưu điểm**: Dễ quản lý, tự động dọn dẹp khi thoát
- **Nhược điểm**: Logs có thể bị trộn lẫn

### 📁 start.ps1
- **Platform**: Windows PowerShell
- **Mô tả**: Sử dụng PowerShell Jobs để quản lý process
- **Ưu điểm**: Quản lý process tốt, có màu sắc
- **Nhược điểm**: Yêu cầu PowerShell

### 📁 start-production.sh
- **Platform**: Linux/Mac/Git Bash
- **Mô tả**: Khởi động ở chế độ production
- **Ưu điểm**: Tự động build nếu cần
- **Nhược điểm**: Chậm hơn development mode

## Ports mặc định

- **Client (Next.js)**: `http://localhost:9999`
- **Server (NestJS)**: `http://localhost:3000`

## Cách dừng services

### Development scripts:
- **Bash/PowerShell**: Nhấn `Ctrl+C`
- **Batch file**: Đóng từng cửa sổ terminal

### Lệnh PowerShell để dừng tất cả jobs:
```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
```

## Yêu cầu

- Node.js và npm đã được cài đặt
- Đã chạy `npm install` trong cả thư mục `client` và `server`
- Đối với production: Đã cấu hình database và biến môi trường

## Troubleshooting

### Port đã được sử dụng:
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :9999
netstat -ano | findstr :3000

# Dừng process theo PID
taskkill /PID <process_id> /F
```

### Lỗi permissions trên Linux/Mac:
```bash
chmod +x *.sh
```

### Lỗi PowerShell execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
``` 