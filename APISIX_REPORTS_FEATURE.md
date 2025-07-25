# Apache APISIX Reports Feature

## Tổng quan

Tính năng Apache APISIX Reports cho phép lưu trữ dữ liệu ghi chú từ bảng Apache APISIX vào database với các trường `note_request` và `note_upstream`.

**Tương tự NEMSM Reports**: Khi gửi báo cáo chính (nút "Gửi báo cáo"), hệ thống sẽ tự động tạo dữ liệu Apache APISIX vào bảng `apisix_reports` dựa trên Report ID vừa tạo.

## Cấu trúc Database

### Bảng `apisix_reports`

```sql
CREATE TABLE `apisix_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `note_request` text,
  `note_upstream` text,
  PRIMARY KEY (`id`),
  KEY `fk_apisix_reports_report` (`id_report_id`),
  CONSTRAINT `fk_apisix_reports_report` FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`)
);
```

**Tạo bảng**: Chạy script `CREATE_APISIX_REPORTS_TABLE.sql` để tạo bảng trong database.

## Cấu trúc Code

### Backend (NestJS)

#### 1. Entity (`server/src/entities/apisix-report.entity.ts`)
- Định nghĩa cấu trúc bảng `apisix_reports`
- Thiết lập relationship với `Report` entity

#### 2. Service (`server/src/reports/apisix-reports.service.ts`)
- `createApisixReport()`: Tạo một record Apache APISIX report
- `getApisixReportsByReportId()`: Lấy dữ liệu theo report ID
- `getAllApisixReports()`: Lấy tất cả dữ liệu

#### 3. Controller (`server/src/reports/apisix-reports.controller.ts`)
- `POST /apisix-reports`: Tạo Apache APISIX report
- `POST /apisix-reports/single`: Tạo một Apache APISIX report
- `GET /apisix-reports`: Lấy tất cả reports
- `GET /apisix-reports/by-report/:reportId`: Lấy reports theo report ID

#### 4. Module (`server/src/reports/reports.module.ts`)
- Đăng ký ApisixReport entity, service và controller

### Frontend (Next.js)

#### 1. API Route (`client/src/app/api/apisix-reports/route.ts`)
- Forward requests từ frontend tới backend
- Xử lý authentication với token

#### 2. Page Component (`client/src/app/reports/page.tsx`)
- **Cập nhật `handleSubmit()`**: Tự động tạo Apache APISIX reports sau khi tạo báo cáo chính
- **Cập nhật `handleSubmitSection()`**: Xử lý riêng section Apache APISIX

## Cách sử dụng

### 1. Từ giao diện web - TẤT CẢ CÁC SECTION

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin trong **TẤT CẢ** các section bạn muốn
3. Nhập ghi chú trong section "Apache APISIX":
   - **Request Latency**: Ghi chú về độ trễ request
   - **Upstream Latency**: Ghi chú về độ trễ upstream
4. **Click nút "Gửi báo cáo" ở cuối trang**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` với tất cả dữ liệu
   - **Tự động tạo record trong bảng `apisix_reports`** nếu có ghi chú Apache APISIX

### 2. Từ giao diện web - CHỈ SECTION APACHE APISIX

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin **chỉ trong** section "Apache APISIX"
3. Nhập ghi chú cho Request Latency và/hoặc Upstream Latency
4. **Click nút "Gửi (Test)" trong section Apache APISIX**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` cho section này
   - Tạo record trong bảng `apisix_reports` nếu có ghi chú

### 3. Qua API trực tiếp

#### Gửi dữ liệu Apache APISIX

```javascript
const data = {
  reportId: 1, // ID của report chính
  apisixData: {
    note_request: "Request latency cao trong giờ peak",
    note_upstream: "Upstream response time ổn định"
  }
};

const response = await fetch('/api/apisix-reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### Lấy dữ liệu Apache APISIX

```javascript
// Lấy tất cả
const allReports = await fetch('/api/apisix-reports');

// Lấy theo report ID
const reportsByReportId = await fetch('/api/apisix-reports?reportId=1');
```

## Test Database

Chạy script SQL để kiểm tra:

```sql
-- Kiểm tra bảng đã tạo
SELECT * FROM apisix_reports;

-- Kiểm tra liên kết với reports
SELECT 
    r.id as report_id,
    r.created_at,
    ar.id as apisix_report_id,
    ar.note_request,
    ar.note_upstream
FROM reports r
LEFT JOIN apisix_reports ar ON r.id = ar.id_report_id
ORDER BY r.created_at DESC;
```

## Quy trình hoạt động

### Quy trình 1: Gửi báo cáo đầy đủ (TẤT CẢ SECTIONS)
1. **User điền tất cả form** → Click "Gửi báo cáo" (nút cuối trang)
2. **Frontend tạo report chính** → Gọi `/api/reports` với tất cả dữ liệu
3. **Nhận report ID** → Sử dụng ID này để liên kết
4. **Tự động kiểm tra dữ liệu Apache APISIX** → Nếu có ghi chú
5. **Tự động gửi dữ liệu Apache APISIX** → Gọi `/api/apisix-reports` 
6. **Lưu vào database** → Tạo record trong bảng `apisix_reports`
7. **Chuyển trang** → Redirect đến `/reports/history`

### Quy trình 2: Gửi chỉ Apache APISIX (TEST)
1. **User điền Apache APISIX** → Click "Gửi (Test)" trong section
2. **Tạo report riêng** → Tạo record trong `reports` chỉ cho section này
3. **Ngay lập tức gửi Apache APISIX** → Tạo record trong `apisix_reports`

## So sánh với NEMSM Reports

| Tính năng | NEMSM Reports | Apache APISIX Reports |
|-----------|---------------|----------------------|
| **Bảng DB** | `nemsm_reports` | `apisix_reports` |
| **Dữ liệu chính** | Checkbox (true/false) | Ghi chú (text) |
| **Số records** | Nhiều (1/server) | Một (1/report) |
| **Trường dữ liệu** | `cpu`, `memory`, `disk_space_used`, `network_traffic`, `netstat`, `notes` | `note_request`, `note_upstream` |
| **Foreign key** | `id_report_id`, `id_nemsm` | `id_report_id` |

## Lưu ý quan trọng

- **Ghi chú** được lưu dưới dạng `text` trong database
- **Mỗi report chỉ tạo 1 record** trong `apisix_reports`
- **Report ID** liên kết với bảng `reports` chính
- **Authentication required** cho tất cả API calls
- **Nếu không có ghi chú** nào, sẽ không tạo record trong `apisix_reports`
- **Lỗi Apache APISIX không ảnh hưởng** đến việc tạo báo cáo chính (chỉ hiển thị warning)

## Mapping Frontend ↔ Database

| Frontend | Database Field |
|----------|----------------|
| `notes['apisix_request_latency_note']` | `note_request` |
| `notes['apisix_upstream_latency_note']` | `note_upstream` |

## API Endpoints

- `POST /api/apisix-reports` - Tạo Apache APISIX report
- `GET /api/apisix-reports` - Lấy tất cả Apache APISIX reports  
- `GET /api/apisix-reports?reportId=1` - Lấy Apache APISIX reports theo report ID 