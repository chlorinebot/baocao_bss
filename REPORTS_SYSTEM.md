# Hệ thống Báo cáo Ca trực

## Tổng quan

Hệ thống báo cáo ca trực được xây dựng dựa trên file PHP gốc `report_form.php`, được chuyển đổi thành React component cho Next.js frontend và NestJS backend.

## Cấu trúc Files

### Frontend (Next.js)
- `client/src/app/reports/page.tsx` - Form tạo báo cáo
- `client/src/app/reports/history/page.tsx` - Danh sách lịch sử báo cáo
- `client/src/app/api/reports/route.ts` - API proxy tới NestJS

### Backend (NestJS)
- `server/src/reports/reports.controller.ts` - Controller xử lý API
- `server/src/reports/reports.service.ts` - Service logic nghiệp vụ
- `server/src/reports/entities/report.entity.ts` - TypeORM Entity
- `server/src/reports/dto/create-report.dto.ts` - Data Transfer Objects
- `server/src/reports/reports.module.ts` - NestJS Module

### Database
- `server/src/migration/CreateReportsTable.sql` - SQL migration

## Tính năng

### 1. Form Báo cáo (`/reports`)
- **Node Exporter Multiple Server Metrics**: Kiểm tra 11 servers với các metrics:
  - CPU, Memory, Disk, Network, Netstat
  - Ghi chú tự động thời gian khi tick checkbox
  
- **PostgreSQL Patroni**: 16 hàng kiểm tra:
  - Primary Node, WAL Replay Paused
  - Replicas Received/Replayed WAL Location
  - Primary WAL Location
  
- **PostgreSQL Database Transactions**: 10 hàng kiểm tra transactions
  
- **PostgreHeartbeat**: 4 hàng kiểm tra heartbeat cho 3 IP
  - 10.2.45.86, 10.2.45.87, 10.2.45.88
  
- **Cảnh báo**: 2 nhóm cảnh báo
  - Warning, Critical, Info
  - Info backup, Warning Disk, Other

### 2. Lịch sử Báo cáo (`/reports/history`)
- Hiển thị danh sách báo cáo đã tạo
- Filter theo ngày tháng
- Phân trang
- Xem chi tiết báo cáo

## API Endpoints

### POST /api/reports
Tạo báo cáo mới
```json
{
  "date": "2024-01-15",
  "nodeExporter": [...],
  "patroni": [...],
  "transactions": [...],
  "heartbeat": [...],
  "alerts": {...},
  "additionalNotes": "Ghi chú thêm"
}
```

### GET /api/reports
Lấy danh sách báo cáo
Query parameters:
- `page`: Số trang (default: 1)
- `limit`: Số lượng/trang (default: 10)
- `startDate`: Từ ngày (YYYY-MM-DD)
- `endDate`: Đến ngày (YYYY-MM-DD)

### GET /api/reports/:id
Lấy chi tiết một báo cáo

## Cài đặt Database

1. Chạy migration SQL:
```bash
psql -h localhost -U your_user -d your_db -f server/src/migration/CreateReportsTable.sql
```

2. Hoặc sử dụng TypeORM CLI:
```bash
cd server
npm run migration:run
```

## Cấu hình môi trường

### Client (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Server (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
```

## Chạy ứng dụng

### Development
```bash
# Terminal 1 - Backend
cd server
npm run start:dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### Production
```bash
# Build frontend
cd client
npm run build

# Build và chạy backend
cd server
npm run build
npm run start:prod
```

## Tính năng đặc biệt

### Auto-timestamp
- Khi tick checkbox, thời gian hiện tại sẽ tự động được điền vào trường ghi chú nếu trống
- Định dạng: `dd/mm/yyyy, hh:mm:ss`

### Validation
- Chỉ cho phép tạo 1 báo cáo/ngày/user
- Validation dữ liệu đầu vào với class-validator

### Security
- Sử dụng JWT authentication
- Chỉ user đã đăng nhập mới có thể tạo/xem báo cáo
- User chỉ xem được báo cáo của mình

## Sử dụng

1. Đăng nhập vào hệ thống
2. Vào `/reports` để tạo báo cáo mới
3. Điền thông tin kiểm tra các hệ thống
4. Click "Gửi báo cáo"
5. Xem lịch sử tại `/reports/history`

## Troubleshooting

### Lỗi thường gặp

1. **"Đã có báo cáo cho ngày hôm nay"**
   - Mỗi user chỉ được tạo 1 báo cáo/ngày
   - Cần xóa báo cáo hiện tại hoặc đợi ngày mới

2. **"Unauthorized - Token not found"**
   - Chưa đăng nhập hoặc token hết hạn
   - Đăng nhập lại

3. **Database connection error**
   - Kiểm tra cấu hình database trong .env
   - Đảm bảo PostgreSQL đang chạy

### Debug

Bật debug logs:
```bash
# Backend
cd server
DEBUG=* npm run start:dev

# Frontend  
cd client
npm run dev
``` 