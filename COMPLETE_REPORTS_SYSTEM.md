# Complete Reports System - Hệ thống Báo cáo Hoàn chỉnh

## Tổng quan

Hệ thống báo cáo hoàn chỉnh cho ứng dụng monitoring với **6 loại báo cáo tự động** được tạo khi người dùng gửi báo cáo chính.

## 🗂️ **Cấu trúc Database - 6 Bảng Reports**

### 1. **Node Exporter** → `nemsm_reports`
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
  PRIMARY KEY (`id`)
);
```

### 2. **Apache APISIX** → `apisix_reports`
```sql
CREATE TABLE `apisix_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `note_request` text,
  `note_upstream` text,
  PRIMARY KEY (`id`)
);
```

### 3. **PostgreSQL Patroni** → `patroni_reports`
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
  PRIMARY KEY (`id`)
);
```

### 4. **Database Transactions** → `transaction_reports`
```sql
CREATE TABLE `transaction_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `transaction_monitored` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`)
);
```

### 5. **PostgreHeartbeat** → `heartbeat_reports`
```sql
CREATE TABLE `heartbeat_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `heartbeat_86` varchar(10) DEFAULT 'false',
  `heartbeat_87` varchar(10) DEFAULT 'false',
  `heartbeat_88` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`)
);
```

### 6. **Cảnh báo** → `alert_reports`
```sql
CREATE TABLE `alert_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `note_alert_1` text,
  `note_alert_2` text,
  PRIMARY KEY (`id`)
);
```

## 🔗 **Thứ tự Xử lý Tự động**

Khi người dùng bấm **"Gửi báo cáo"** ở cuối trang:

```
1. Tạo báo cáo chính → Bảng `reports` (Nhận Report ID)
2. Tự động tạo NEMSM → Bảng `nemsm_reports`
3. Tự động tạo Apache APISIX → Bảng `apisix_reports`
4. Tự động tạo PostgreSQL Patroni → Bảng `patroni_reports`
5. Tự động tạo Database Transactions → Bảng `transaction_reports`
6. Tự động tạo PostgreHeartbeat → Bảng `heartbeat_reports`
7. Tự động tạo Cảnh báo → Bảng `alert_reports`
8. Chuyển trang → `/reports/history`
```

## 📊 **So sánh Các Loại Reports**

| Section | Bảng DB | Kiểu Dữ liệu | Số Records | Đặc biệt |
|---------|---------|--------------|------------|----------|
| **Node Exporter** | `nemsm_reports` | Checkbox + Notes | 1/server | `id_nemsm` liên kết |
| **Apache APISIX** | `apisix_reports` | Notes only | 1/report | Giống text notes |
| **PostgreSQL Patroni** | `patroni_reports` | Checkbox + Notes | 1/row (max 16) | `row_index` 1-16 |
| **Database Transactions** | `transaction_reports` | Checkbox + Notes | 1/row (max 16) | `row_index` 1-16 |
| **PostgreHeartbeat** | `heartbeat_reports` | Checkbox + Notes | 1/row (max 4) | `row_index` 1-4 |
| **Cảnh báo** | `alert_reports` | Notes only | 1/report | 2 notes fields |

## 🛠️ **Cấu trúc Code**

### Backend (NestJS)
```
server/src/
├── entities/
│   ├── nemsm-report.entity.ts
│   ├── apisix-report.entity.ts
│   ├── patroni-report.entity.ts
│   ├── transaction-report.entity.ts
│   ├── heartbeat-report.entity.ts
│   └── alert-report.entity.ts
├── reports/
│   ├── nemsm-reports.service.ts + controller.ts
│   ├── apisix-reports.service.ts + controller.ts
│   ├── patroni-reports.service.ts + controller.ts
│   ├── transaction-reports.service.ts + controller.ts
│   ├── heartbeat-reports.service.ts + controller.ts
│   ├── alert-reports.service.ts + controller.ts
│   └── reports.module.ts (tích hợp tất cả)
```

### Frontend (Next.js)
```
client/src/app/
├── api/
│   ├── nemsm-reports/route.ts
│   ├── apisix-reports/route.ts
│   ├── patroni-reports/route.ts
│   ├── transaction-reports/route.ts
│   ├── heartbeat-reports/route.ts
│   └── alert-reports/route.ts
└── reports/page.tsx (tích hợp logic tất cả)
```

## 🎯 **API Endpoints**

| Report Type | Endpoint | Methods |
|-------------|----------|---------|
| **NEMSM** | `/api/nemsm-reports` | POST, GET |
| **Apache APISIX** | `/api/apisix-reports` | POST, GET |
| **PostgreSQL Patroni** | `/api/patroni-reports` | POST, GET |
| **Database Transactions** | `/api/transaction-reports` | POST, GET |
| **PostgreHeartbeat** | `/api/heartbeat-reports` | POST, GET |
| **Cảnh báo** | `/api/alert-reports` | POST, GET |

## 🧪 **Cách Test**

### 1. Tạo Database Tables
```bash
# Chạy tất cả SQL scripts
mysql -u username -p database_name < CREATE_NEMSM_REPORTS_TABLE.sql
mysql -u username -p database_name < CREATE_APISIX_REPORTS_TABLE.sql
mysql -u username -p database_name < CREATE_PATRONI_REPORTS_TABLE.sql
mysql -u username -p database_name < CREATE_TRANSACTION_REPORTS_TABLE.sql
mysql -u username -p database_name < CREATE_HEARTBEAT_REPORTS_TABLE.sql
mysql -u username -p database_name < CREATE_ALERT_REPORTS_TABLE.sql
```

### 2. Test Frontend
1. Truy cập `/reports`
2. Điền dữ liệu trong **tất cả** sections:
   - **Node Exporter**: Tích checkbox + nhập notes cho servers
   - **Apache APISIX**: Nhập notes Request/Upstream Latency
   - **PostgreSQL Patroni**: Tích checkbox + nhập notes (16 hàng)
   - **Database Transactions**: Tích checkbox + nhập notes (16 hàng)
   - **PostgreHeartbeat**: Tích checkbox + nhập notes (4 hàng)
   - **Cảnh báo**: Nhập notes (2 hàng)
3. **Bấm "Gửi báo cáo"** ở cuối trang
4. Kiểm tra database:

```sql
-- Kiểm tra báo cáo chính
SELECT * FROM reports ORDER BY created_at DESC LIMIT 1;

-- Kiểm tra tất cả sub-reports (thay REPORT_ID)
SELECT * FROM nemsm_reports WHERE id_report_id = REPORT_ID;
SELECT * FROM apisix_reports WHERE id_report_id = REPORT_ID;
SELECT * FROM patroni_reports WHERE id_report_id = REPORT_ID ORDER BY row_index;
SELECT * FROM transaction_reports WHERE id_report_id = REPORT_ID ORDER BY row_index;
SELECT * FROM heartbeat_reports WHERE id_report_id = REPORT_ID ORDER BY row_index;
SELECT * FROM alert_reports WHERE id_report_id = REPORT_ID;
```

### 3. Test Individual Sections
Có thể test từng section riêng bằng nút **"Gửi (Test)"** trong mỗi section.

## 🔑 **Mapping Dữ liệu Frontend ↔ Database**

### Node Exporter
```javascript
checkboxStates[`server_${serverId}_cpu`] → nemsm_reports.cpu
checkboxStates[`server_${serverId}_memory`] → nemsm_reports.memory
notes[`server_${serverId}_note`] → nemsm_reports.notes
```

### Apache APISIX
```javascript
notes['apisix_request_latency_note'] → apisix_reports.note_request
notes['apisix_upstream_latency_note'] → apisix_reports.note_upstream
```

### PostgreSQL Patroni (16 hàng)
```javascript
checkboxStates[`patroni_${index}_primary`] → patroni_reports.primary_node
checkboxStates[`patroni_${index}_wal_replay`] → patroni_reports.wal_replay_paused
notes[`patroni_${index}_note`] → patroni_reports.notes
```

### Database Transactions (16 hàng)
```javascript
checkboxStates[`transaction_${index}_monitored`] → transaction_reports.transaction_monitored
notes[`transaction_${index}_note`] → transaction_reports.notes
```

### PostgreHeartbeat (4 hàng)
```javascript
checkboxStates[`heartbeat_${index}_86`] → heartbeat_reports.heartbeat_86
checkboxStates[`heartbeat_${index}_87`] → heartbeat_reports.heartbeat_87
checkboxStates[`heartbeat_${index}_88`] → heartbeat_reports.heartbeat_88
notes[`heartbeat_${index}_note`] → heartbeat_reports.notes
```

### Cảnh báo (2 hàng)
```javascript
notes['alert_note_1'] → alert_reports.note_alert_1
notes['alert_note_2'] → alert_reports.note_alert_2
```

## ⚡ **Tính năng Đặc biệt**

### 1. **Graceful Error Handling**
- Nếu một sub-report fail, main report vẫn được lưu
- Hiển thị warning cho user về sub-report lỗi
- Không làm gián đoạn quy trình chính

### 2. **Conditional Data Submission**
- Chỉ tạo sub-reports nếu có dữ liệu thực sự
- Tránh tạo records rỗng trong database
- Kiểm tra checkbox/notes trước khi gửi

### 3. **Batch Processing**
- Gửi nhiều rows cùng lúc (Patroni: 16, Transactions: 16, Heartbeat: 4)
- Tối ưu performance với fewer API calls
- Transaction safety với database

### 4. **Flexible UI**
- Section-specific "Gửi (Test)" buttons
- Main "Gửi báo cáo" button cho tất cả
- Loading states cho từng section riêng biệt

## 🎉 **Kết quả Cuối cùng**

Sau khi bấm **"Gửi báo cáo"** với đầy đủ dữ liệu, hệ thống sẽ tạo:

```
✅ 1 record trong `reports` (báo cáo chính)
✅ N records trong `nemsm_reports` (1/server có dữ liệu)
✅ 1 record trong `apisix_reports` (nếu có notes)
✅ M records trong `patroni_reports` (1/hàng có dữ liệu, max 16)
✅ P records trong `transaction_reports` (1/hàng có dữ liệu, max 16)
✅ Q records trong `heartbeat_reports` (1/hàng có dữ liệu, max 4)
✅ 1 record trong `alert_reports` (nếu có notes)
```

**Total: Có thể tạo đến 6 bảng khác nhau trong 1 lần submit!** 🚀 