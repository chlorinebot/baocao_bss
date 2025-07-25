# NEMSM Reports Feature

## Tổng quan

Tính năng NEMSM Reports cho phép lưu trữ dữ liệu giám sát từ bảng Node Exporter Multiple Server Metrics vào database với các checkbox được lưu dưới dạng `true`/`false`. 

**Cập nhật mới**: Khi gửi báo cáo chính (nút "Gửi báo cáo"), hệ thống sẽ tự động tạo dữ liệu NEMSM vào bảng `nemsm_reports` dựa trên Report ID vừa tạo.

## Cấu trúc Database

### Bảng `nemsm_reports`

```sql
CREATE TABLE `nemsm_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `id_nemsm` int(11) NOT NULL,
  `cpu` varchar(10) DEFAULT 'false',
  `memory` varchar(10) DEFAULT 'false',
  `disk_space_used` varchar(10) DEFAULT 'false',
  `network_traffic` varchar(10) DEFAULT 'false',
  `netstat` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `fk_nemsm_reports_report` (`id_report_id`),
  KEY `fk_nemsm_reports_nemsm` (`id_nemsm`),
  CONSTRAINT `fk_nemsm_reports_report` FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`),
  CONSTRAINT `fk_nemsm_reports_nemsm` FOREIGN KEY (`id_nemsm`) REFERENCES `nemsm` (`id`)
);
```

**Tạo bảng**: Chạy script `CREATE_NEMSM_REPORTS_TABLE.sql` để tạo bảng trong database.

## Cấu trúc Code

### Backend (NestJS)

#### 1. Entity (`server/src/entities/nemsm-report.entity.ts`)
- Định nghĩa cấu trúc bảng `nemsm_reports`
- Thiết lập relationships với `Report` và `Server` entities

#### 2. Service (`server/src/reports/nemsm-reports.service.ts`)
- `createNemsmReport()`: Tạo một record NEMSM report
- `createMultipleNemsmReports()`: Tạo nhiều records cùng lúc
- `getNemsmReportsByReportId()`: Lấy dữ liệu theo report ID
- `getAllNemsmReports()`: Lấy tất cả dữ liệu

#### 3. Controller (`server/src/reports/nemsm-reports.controller.ts`)
- `POST /nemsm-reports`: Tạo nhiều NEMSM reports
- `POST /nemsm-reports/single`: Tạo một NEMSM report
- `GET /nemsm-reports`: Lấy tất cả reports
- `GET /nemsm-reports/by-report/:reportId`: Lấy reports theo report ID

#### 4. Module (`server/src/reports/reports.module.ts`)
- Đăng ký NemsmReport entity, service và controller

### Frontend (Next.js)

#### 1. API Route (`client/src/app/api/nemsm-reports/route.ts`)
- Forward requests từ frontend tới backend
- Xử lý authentication với token

#### 2. Page Component (`client/src/app/reports/page.tsx`)
- **Cập nhật mới**: `handleSubmit()` tự động tạo NEMSM reports sau khi tạo báo cáo chính
- `handleSubmitSection()` để xử lý từng section riêng lẻ (Node Exporter)

## Cách sử dụng

### 1. Từ giao diện web - TẤT CẢ CÁC SECTION

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin trong **TẤT CẢ** các section bạn muốn
3. Tích các checkbox trong section "Node Exporter Multiple Server Metrics"
4. Nhập ghi chú nếu cần cho từng section
5. **Click nút "Gửi báo cáo" ở cuối trang**
6. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` với tất cả dữ liệu
   - **Tự động tạo các records tương ứng trong bảng `nemsm_reports`** nếu có dữ liệu Node Exporter

### 2. Từ giao diện web - CHỈ SECTION NODE EXPORTER

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin **chỉ trong** section "Node Exporter Multiple Server Metrics"
3. Tích các checkbox tương ứng với trạng thái giám sát
4. Nhập ghi chú nếu cần
5. **Click nút "Gửi (Test)" trong section Node Exporter**
6. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` cho section này
   - Tạo các records tương ứng trong bảng `nemsm_reports`

### 3. Qua API trực tiếp

#### Gửi dữ liệu NEMSM

```javascript
const data = {
  reportId: 1, // ID của report chính
  nemsmData: [
    {
      serverId: 1,
      cpu: true,
      memory: false,
      disk: true,
      network: false,
      netstat: true,
      notes: "CPU và Disk có vấn đề"
    },
    {
      serverId: 2,
      cpu: false,
      memory: true,
      disk: false,
      network: true,
      netstat: false,
      notes: "Memory và Network OK"
    }
  ]
};

const response = await fetch('/api/nemsm-reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### Lấy dữ liệu NEMSM

```javascript
// Lấy tất cả
const allReports = await fetch('/api/nemsm-reports');

// Lấy theo report ID
const reportsByReportId = await fetch('/api/nemsm-reports?reportId=1');
```

## Test

### 1. Test Backend API

```bash
node test-full-report-flow.js
```

Script sẽ test:
- Tạo báo cáo chính trong bảng `reports`
- Tự động tạo dữ liệu NEMSM trong bảng `nemsm_reports`
- Kiểm tra dữ liệu đã lưu

### 2. Test Database

Chạy script SQL:
```sql
-- Kiểm tra bảng đã tạo
SELECT * FROM nemsm_reports;

-- Kiểm tra liên kết với reports
SELECT 
    r.id as report_id,
    r.created_at,
    nr.id as nemsm_report_id,
    nr.id_nemsm,
    nr.cpu,
    nr.memory,
    nr.notes
FROM reports r
LEFT JOIN nemsm_reports nr ON r.id = nr.id_report_id
ORDER BY r.created_at DESC;
```

## Quy trình hoạt động mới

### Quy trình 1: Gửi báo cáo đầy đủ (TẤT CẢ SECTIONS)
1. **User điền tất cả form** → Click "Gửi báo cáo" (nút cuối trang)
2. **Frontend tạo report chính** → Gọi `/api/reports` với tất cả dữ liệu từ tất cả sections
3. **Nhận report ID** → Sử dụng ID này để liên kết
4. **Tự động kiểm tra dữ liệu NEMSM** → Nếu có checkbox Node Exporter được tích
5. **Tự động gửi dữ liệu NEMSM** → Gọi `/api/nemsm-reports` 
6. **Lưu vào database** → Tạo records trong bảng `nemsm_reports`
7. **Chuyển trang** → Redirect đến `/reports/history`

### Quy trình 2: Gửi chỉ Node Exporter (TEST)
1. **User điền Node Exporter** → Click "Gửi (Test)" trong section
2. **Tạo report riêng** → Tạo record trong `reports` chỉ cho section này
3. **Ngay lập tức gửi NEMSM** → Tạo records trong `nemsm_reports`

## Lưu ý quan trọng

- **Checkbox values** được lưu dưới dạng string `"true"` hoặc `"false"`
- **Mỗi server** sẽ tạo một record riêng trong `nemsm_reports`
- **Report ID** liên kết với bảng `reports` chính  
- **Server ID** liên kết với bảng `nemsm` (servers)
- **Authentication required** cho tất cả API calls
- **Nếu không có dữ liệu NEMSM** nào được tích, sẽ không tạo records trong `nemsm_reports`
- **Lỗi NEMSM không ảnh hưởng** đến việc tạo báo cáo chính (chỉ hiển thị warning) 