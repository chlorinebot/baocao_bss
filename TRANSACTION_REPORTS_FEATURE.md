# Database Transactions Reports Feature

## Tổng quan

Tính năng Database Transactions Reports cho phép lưu trữ dữ liệu giám sát từ bảng Database Transactions vào database với checkbox "Transactions Giám sát" được lưu dưới dạng `true`/`false` và ghi chú cho từng hàng.

**Tương tự NEMSM Reports**: Khi gửi báo cáo chính (nút "Gửi báo cáo"), hệ thống sẽ tự động tạo dữ liệu Database Transactions vào bảng `transaction_reports` dựa trên Report ID vừa tạo.

## Cấu trúc Database

### Bảng `transaction_reports`

```sql
CREATE TABLE `transaction_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `transaction_monitored` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `fk_transaction_reports_report` (`id_report_id`),
  KEY `idx_transaction_row_index` (`row_index`),
  CONSTRAINT `fk_transaction_reports_report` FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`)
);
```

**Tạo bảng**: Chạy script `CREATE_TRANSACTION_REPORTS_TABLE.sql` để tạo bảng trong database.

## Cấu trúc Code

### Backend (NestJS)

#### 1. Entity (`server/src/entities/transaction-report.entity.ts`)
- Định nghĩa cấu trúc bảng `transaction_reports`
- Thiết lập relationship với `Report` entity
- Bao gồm trường `row_index` để phân biệt các hàng

#### 2. Service (`server/src/reports/transaction-reports.service.ts`)
- `createTransactionReport()`: Tạo một record Database Transactions report
- `createMultipleTransactionReports()`: Tạo nhiều records cùng lúc (16 hàng)
- `getTransactionReportsByReportId()`: Lấy dữ liệu theo report ID
- `getAllTransactionReports()`: Lấy tất cả dữ liệu

#### 3. Controller (`server/src/reports/transaction-reports.controller.ts`)
- `POST /transaction-reports`: Tạo nhiều Database Transactions reports
- `POST /transaction-reports/single`: Tạo một Database Transactions report
- `GET /transaction-reports`: Lấy tất cả reports
- `GET /transaction-reports/by-report/:reportId`: Lấy reports theo report ID

#### 4. Module (`server/src/reports/reports.module.ts`)
- Đăng ký TransactionReport entity, service và controller

### Frontend (Next.js)

#### 1. API Route (`client/src/app/api/transaction-reports/route.ts`)
- Forward requests từ frontend tới backend
- Xử lý authentication với token

#### 2. Page Component (`client/src/app/reports/page.tsx`)
- **Cập nhật `handleSubmit()`**: Tự động tạo Database Transactions reports sau khi tạo báo cáo chính
- **Cập nhật `handleSubmitSection()`**: Xử lý riêng section Database Transactions

## Cách sử dụng

### 1. Từ giao diện web - TẤT CẢ CÁC SECTION

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin trong **TẤT CẢ** các section bạn muốn
3. Tích các checkbox trong section "Database Transactions" (16 hàng):
   - **Transactions Giám sát**: Checkbox theo dõi transaction
   - **Ghi chú**: Ghi chú cho từng hàng
4. **Click nút "Gửi báo cáo" ở cuối trang**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` với tất cả dữ liệu
   - **Tự động tạo các records trong bảng `transaction_reports`** nếu có dữ liệu Database Transactions

### 2. Từ giao diện web - CHỈ SECTION DATABASE TRANSACTIONS

1. Truy cập trang Reports (`/reports`)
2. Điền thông tin **chỉ trong** section "Database Transactions"
3. Tích các checkbox và nhập ghi chú cho từng hàng cần thiết
4. **Click nút "Gửi (Test)" trong section Database Transactions**
5. Hệ thống sẽ tự động:
   - Tạo một record trong bảng `reports` cho section này
   - Tạo các records trong bảng `transaction_reports` cho từng hàng có dữ liệu

### 3. Qua API trực tiếp

#### Gửi dữ liệu Database Transactions

```javascript
const data = {
  reportId: 1, // ID của report chính
  transactionData: [
    {
      rowIndex: 1,
      transaction_monitored: true,
      notes: "Hàng 1: Transaction được giám sát chặt chẽ"
    },
    {
      rowIndex: 2,
      transaction_monitored: false,
      notes: "Hàng 2: Transaction không cần giám sát"
    },
    {
      rowIndex: 3,
      transaction_monitored: true,
      notes: "Hàng 3: Transaction có vấn đề cần theo dõi"
    }
    // ... up to 16 rows
  ]
};

const response = await fetch('/api/transaction-reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### Lấy dữ liệu Database Transactions

```javascript
// Lấy tất cả
const allReports = await fetch('/api/transaction-reports');

// Lấy theo report ID
const reportsByReportId = await fetch('/api/transaction-reports?reportId=1');
```

## Test Database

Chạy script SQL để kiểm tra:

```sql
-- Kiểm tra bảng đã tạo
SELECT * FROM transaction_reports ORDER BY id_report_id DESC, row_index ASC;

-- Kiểm tra liên kết với reports
SELECT 
    r.id as report_id,
    r.created_at,
    tr.id as transaction_report_id,
    tr.row_index,
    tr.transaction_monitored,
    tr.notes
FROM reports r
LEFT JOIN transaction_reports tr ON r.id = tr.id_report_id
ORDER BY r.created_at DESC, tr.row_index ASC;
```

## Quy trình hoạt động

### Quy trình 1: Gửi báo cáo đầy đủ (TẤT CẢ SECTIONS)
1. **User điền tất cả form** → Click "Gửi báo cáo" (nút cuối trang)
2. **Frontend tạo report chính** → Gọi `/api/reports` với tất cả dữ liệu
3. **Nhận report ID** → Sử dụng ID này để liên kết
4. **Tự động kiểm tra dữ liệu Database Transactions** → Nếu có checkbox được tích
5. **Tự động gửi dữ liệu Database Transactions** → Gọi `/api/transaction-reports` 
6. **Lưu vào database** → Tạo records trong bảng `transaction_reports` (tối đa 16 records)
7. **Chuyển trang** → Redirect đến `/reports/history`

### Quy trình 2: Gửi chỉ Database Transactions (TEST)
1. **User điền Database Transactions** → Click "Gửi (Test)" trong section
2. **Tạo report riêng** → Tạo record trong `reports` chỉ cho section này
3. **Ngay lập tức gửi Database Transactions** → Tạo records trong `transaction_reports`

## So sánh với các Reports khác

| Tính năng | NEMSM Reports | Apache APISIX Reports | PostgreSQL Patroni Reports | Database Transactions Reports |
|-----------|---------------|----------------------|---------------------------|------------------------------|
| **Bảng DB** | `nemsm_reports` | `apisix_reports` | `patroni_reports` | `transaction_reports` |
| **Dữ liệu chính** | Checkbox (true/false) | Ghi chú (text) | Checkbox + Ghi chú | Checkbox + Ghi chú |
| **Số records** | Nhiều (1/server) | Một (1/report) | Nhiều (1/hàng, max 16) | Nhiều (1/hàng, max 16) |
| **Trường đặc biệt** | `id_nemsm` | - | `row_index` | `row_index` |
| **Checkbox fields** | 5 fields | 0 fields | 5 fields | 1 field |

## Lưu ý quan trọng

- **Checkbox value** được lưu dưới dạng string `"true"` hoặc `"false"`
- **Mỗi hàng tạo 1 record** trong `transaction_reports` với `row_index` từ 1-16
- **Report ID** liên kết với bảng `reports` chính
- **Row Index** để phân biệt và sắp xếp các hàng
- **Authentication required** cho tất cả API calls
- **Nếu không có dữ liệu** nào được tích, sẽ không tạo records trong `transaction_reports`
- **Lỗi Database Transactions không ảnh hưởng** đến việc tạo báo cáo chính (chỉ hiển thị warning)

## Mapping Frontend ↔ Database

| Frontend | Database Field |
|----------|----------------|
| `checkboxStates['transaction_0_monitored']` | `transaction_monitored` (row_index=1) |
| `notes['transaction_0_note']` | `notes` (row_index=1) |
| `checkboxStates['transaction_1_monitored']` | `transaction_monitored` (row_index=2) |
| `notes['transaction_1_note']` | `notes` (row_index=2) |
| ... | ... |
| `checkboxStates['transaction_15_monitored']` | `transaction_monitored` (row_index=16) |
| `notes['transaction_15_note']` | `notes` (row_index=16) |

## API Endpoints

- `POST /api/transaction-reports` - Tạo Database Transactions reports
- `GET /api/transaction-reports` - Lấy tất cả Database Transactions reports  
- `GET /api/transaction-reports?reportId=1` - Lấy Database Transactions reports theo report ID

## Tính năng đặc biệt

- **16 hàng cố định**: Luôn hỗ trợ 16 hàng như trong giao diện
- **Row indexing**: Mỗi record có `row_index` để duy trì thứ tự
- **Simple checkbox**: Chỉ có 1 checkbox "Transactions Giám sát" mỗi hàng
- **Flexible data**: Chỉ lưu những hàng có checkbox được tích hoặc có ghi chú
- **Batch processing**: Gửi tất cả 16 hàng trong 1 request duy nhất

## Ví dụ sử dụng

### Scenario 1: Giám sát một số transactions quan trọng
```javascript
// User tích checkbox ở hàng 1, 5, 10 với ghi chú
const transactionData = [
  { rowIndex: 1, transaction_monitored: true, notes: "Transaction thanh toán chính" },
  { rowIndex: 5, transaction_monitored: true, notes: "Transaction backup database" },
  { rowIndex: 10, transaction_monitored: true, notes: "Transaction đồng bộ dữ liệu" }
];
```

### Scenario 2: Chỉ có ghi chú mà không tích checkbox
```javascript
// User chỉ nhập ghi chú mà không tích checkbox
const transactionData = [
  { rowIndex: 3, transaction_monitored: false, notes: "Transaction này đã bị disable" },
  { rowIndex: 7, transaction_monitored: false, notes: "Cần kiểm tra lại transaction này" }
];
``` 