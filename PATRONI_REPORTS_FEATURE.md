# PostgreSQL Patroni Reports Feature

## Tổng quan

Tính năng PostgreSQL Patroni Reports cho phép lưu trữ dữ liệu giám sát từ bảng PostgreSQL Patroni vào database với các checkbox được lưu dưới dạng `true`/`false` và ghi chú cho từng hàng.

**Tương tự NEMSM Reports**: Khi gửi báo cáo chính (nút "Gửi báo cáo"), hệ thống sẽ tự động tạo dữ liệu PostgreSQL Patroni vào bảng `patroni_reports` dựa trên Report ID vừa tạo.

## Cấu trúc Database

### Bảng `patroni_reports`

```sql
CREATE TABLE `patroni_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `primary_node` varchar(10) DEFAULT 'false',
  `wal_replay_paused` varchar(10) DEFAULT 'false',
  `replicas_received_wal` varchar(10) DEFAULT 'false',
  `primary_wal_location` varchar(10) DEFAULT 'false',
  `replicas_replayed_wal` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `fk_patroni_reports_report` (`id_report_id`),
  KEY `idx_patroni_row_index` (`row_index`),
  CONSTRAINT `fk_patroni_reports_report` FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`)
);
```

**Tạo bảng**: Chạy script `CREATE_PATRONI_REPORTS_TABLE.sql` để tạo bảng trong database.

## Cấu trúc Code

### Backend (NestJS)

#### 1. Entity (`server/src/entities/patroni-report.entity.ts`)
- Định nghĩa cấu trúc bảng `patroni_reports`
- Thiết lập relationship với `Report` entity
- Bao gồm trường `row_index` để phân biệt các hàng

#### 2. Service (`server/src/reports/patroni-reports.service.ts`)
- `createPatroniReport()`: Tạo một record PostgreSQL Patroni report
- `createMultiplePatroniReports()`: Tạo nhiều records cùng lúc (16 hàng)
- `getPatroniReportsByReportId()`: Lấy dữ liệu theo report ID
- `getAllPatroniReports()`: Lấy tất cả dữ liệu

#### 3. Controller (`server/src/reports/patroni-reports.controller.ts`)
- `POST /patroni-reports`: Tạo nhiều PostgreSQL Patroni reports
- `POST /patroni-reports/single`: Tạo một PostgreSQL Patroni report
- `GET /patroni-reports`: Lấy tất cả reports
- `GET /patroni-reports/by-report/:reportId`: Lấy reports theo report ID

#### 4. Module (`server/src/reports/reports.module.ts`)
- Đăng ký PatroniReport entity, service và controller

### Frontend (Next.js)

#### 1. API Route (`client/src/app/api/patroni-reports/route.ts`)
- Forward requests từ frontend tới backend
- Xử lý authentication với token

#### 2. Page Component (`client/src/app/reports/page.tsx`)
- **Cập nhật `handleSubmit()`**: Tự động tạo PostgreSQL Patroni reports sau khi tạo báo cáo chính
- **Cập nhật `handleSubmitSection()`**: Xử lý riêng section PostgreSQL Patroni

## Cách sử dụng

### 1. Từ giao diện web - TẤT CẢ CÁC SECTION

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin trong **TẤT CẢ** các section bạn muốn
3. Tích các checkbox trong section "PostgreSQL Patroni" (16 hàng):
   - **Primary Node**: Node chính
   - **WAL Replay Paused**: WAL replay tạm dừng
   - **Replicas Received WAL**: Replicas nhận WAL
   - **Primary WAL Location**: Vị trí WAL chính
   - **Replicas Replayed WAL**: Replicas replay WAL
   - **Ghi chú**: Ghi chú cho từng hàng
4. **Click nút "Gửi báo cáo" ở cuối trang**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` với tất cả dữ liệu
   - **Tự động tạo các records trong bảng `patroni_reports`** nếu có dữ liệu PostgreSQL Patroni

### 2. Từ giao diện web - CHỈ SECTION POSTGRESQL PATRONI

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin **chỉ trong** section "PostgreSQL Patroni"
3. Tích các checkbox và nhập ghi chú cho từng hàng cần thiết
4. **Click nút "Gửi (Test)" trong section PostgreSQL Patroni**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` cho section này
   - Tạo các records trong bảng `patroni_reports` cho từng hàng có dữ liệu

### 3. Qua API trực tiếp

#### Gửi dữ liệu PostgreSQL Patroni

```javascript
const data = {
  reportId: 1, // ID của report chính
  patroniData: [
    {
      rowIndex: 1,
      primary_node: true,
      wal_replay_paused: false,
      replicas_received_wal: true,
      primary_wal_location: false,
      replicas_replayed_wal: true,
      notes: "Hàng 1: Primary node hoạt động tốt"
    },
    {
      rowIndex: 2,
      primary_node: false,
      wal_replay_paused: true,
      replicas_received_wal: false,
      primary_wal_location: true,
      replicas_replayed_wal: false,
      notes: "Hàng 2: WAL replay tạm dừng"
    }
    // ... up to 16 rows
  ]
};

const response = await fetch('/api/patroni-reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### Lấy dữ liệu PostgreSQL Patroni

```javascript
// Lấy tất cả
const allReports = await fetch('/api/patroni-reports');

// Lấy theo report ID
const reportsByReportId = await fetch('/api/patroni-reports?reportId=1');
```

## Test Database

Chạy script SQL để kiểm tra:

```sql
-- Kiểm tra bảng đã tạo
SELECT * FROM patroni_reports ORDER BY id_report_id DESC, row_index ASC;

-- Kiểm tra liên kết với reports
SELECT 
    r.id as report_id,
    r.created_at,
    pr.id as patroni_report_id,
    pr.row_index,
    pr.primary_node,
    pr.wal_replay_paused,
    pr.replicas_received_wal,
    pr.primary_wal_location,
    pr.replicas_replayed_wal,
    pr.notes
FROM reports r
LEFT JOIN patroni_reports pr ON r.id = pr.id_report_id
ORDER BY r.created_at DESC, pr.row_index ASC;
```

## Quy trình hoạt động

### Quy trình 1: Gửi báo cáo đầy đủ (TẤT CẢ SECTIONS)
1. **User điền tất cả form** → Click "Gửi báo cáo" (nút cuối trang)
2. **Frontend tạo report chính** → Gọi `/api/reports` với tất cả dữ liệu
3. **Nhận report ID** → Sử dụng ID này để liên kết
4. **Tự động kiểm tra dữ liệu PostgreSQL Patroni** → Nếu có checkbox được tích
5. **Tự động gửi dữ liệu PostgreSQL Patroni** → Gọi `/api/patroni-reports` 
6. **Lưu vào database** → Tạo records trong bảng `patroni_reports` (tối đa 16 records)
7. **Chuyển trang** → Redirect đến `/reports/history`

### Quy trình 2: Gửi chỉ PostgreSQL Patroni (TEST)
1. **User điền PostgreSQL Patroni** → Click "Gửi (Test)" trong section
2. **Tạo report riêng** → Tạo record trong `reports` chỉ cho section này
3. **Ngay lập tức gửi PostgreSQL Patroni** → Tạo records trong `patroni_reports`

## So sánh với các Reports khác

| Tính năng | NEMSM Reports | Apache APISIX Reports | PostgreSQL Patroni Reports |
|-----------|---------------|----------------------|---------------------------|
| **Bảng DB** | `nemsm_reports` | `apisix_reports` | `patroni_reports` |
| **Dữ liệu chính** | Checkbox (true/false) | Ghi chú (text) | Checkbox + Ghi chú |
| **Số records** | Nhiều (1/server) | Một (1/report) | Nhiều (1/hàng, max 16) |
| **Trường đặc biệt** | `id_nemsm` | - | `row_index` |
| **Checkbox fields** | 5 fields | 0 fields | 5 fields |

## Lưu ý quan trọng

- **Checkbox values** được lưu dưới dạng string `"true"` hoặc `"false"`
- **Mỗi hàng tạo 1 record** trong `patroni_reports` với `row_index` từ 1-16
- **Report ID** liên kết với bảng `reports` chính
- **Row Index** để phân biệt và sắp xếp các hàng
- **Authentication required** cho tất cả API calls
- **Nếu không có dữ liệu** nào được tích, sẽ không tạo records trong `patroni_reports`
- **Lỗi PostgreSQL Patroni không ảnh hưởng** đến việc tạo báo cáo chính (chỉ hiển thị warning)

## Mapping Frontend ↔ Database

| Frontend | Database Field |
|----------|----------------|
| `checkboxStates['patroni_0_primary']` | `primary_node` (row_index=1) |
| `checkboxStates['patroni_0_wal_replay']` | `wal_replay_paused` (row_index=1) |
| `checkboxStates['patroni_0_replicas_received']` | `replicas_received_wal` (row_index=1) |
| `checkboxStates['patroni_0_primary_wal']` | `primary_wal_location` (row_index=1) |
| `checkboxStates['patroni_0_replicas_replayed']` | `replicas_replayed_wal` (row_index=1) |
| `notes['patroni_0_note']` | `notes` (row_index=1) |
| ... | ... |
| `checkboxStates['patroni_15_primary']` | `primary_node` (row_index=16) |

## API Endpoints

- `POST /api/patroni-reports` - Tạo PostgreSQL Patroni reports
- `GET /api/patroni-reports` - Lấy tất cả PostgreSQL Patroni reports  
- `GET /api/patroni-reports?reportId=1` - Lấy PostgreSQL Patroni reports theo report ID

## Tính năng đặc biệt

- **16 hàng cố định**: Luôn hỗ trợ 16 hàng như trong giao diện
- **Row indexing**: Mỗi record có `row_index` để duy trì thứ tự
- **Flexible data**: Chỉ lưu những hàng có ít nhất 1 checkbox được tích hoặc có ghi chú
- **Batch processing**: Gửi tất cả 16 hàng trong 1 request duy nhất 