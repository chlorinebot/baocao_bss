# HƯỚNG DẪN KHÔI PHỤC DATABASE BSS MANAGEMENT SYSTEM

## 📋 Tổng quan
Script `COMPLETE_DATABASE_RECOVERY.sql` được tạo để khôi phục hoàn toàn database BSS Management System sau khi bị hỏng hoặc mất dữ liệu.

## 🗂️ Cấu trúc Database được khôi phục

### Các bảng chính:
1. **`roles`** - Vai trò người dùng (admin, user)
2. **`users`** - Thông tin người dùng
3. **`nemsm`** - Thông tin servers
4. **`work_schedule`** - Phân công làm việc
5. **`reports`** - Báo cáo chính
6. **`monthly_work_schedules`** - Phân công làm việc theo tháng
7. **`monthly_schedule_logs`** - Log thay đổi phân công

### Các bảng báo cáo chi tiết:
- **`nemsm_reports`** - Báo cáo hệ thống NEmSM
- **`heartbeat_reports`** - Báo cáo Heartbeat
- **`patroni_reports`** - Báo cáo Patroni Database
- **`transaction_reports`** - Báo cáo giao dịch
- **`alert_reports`** - Báo cáo cảnh báo
- **`apisix_reports`** - Báo cáo APISIX Gateway

## 🚀 Cách thực hiện khôi phục

### Bước 1: Chuẩn bị
```bash
# Đảm bảo MariaDB đang chạy
sudo systemctl status mariadb
# hoặc
net start mariadb
```

### Bước 2: Backup database hiện tại (nếu có)
```sql
-- Tạo backup trước khi khôi phục
mysqldump -u root -p bc_bss > backup_before_recovery_$(date +%Y%m%d_%H%M%S).sql
```

### Bước 3: Chạy script khôi phục
```bash
# Cách 1: Từ command line
mysql -u root -p < COMPLETE_DATABASE_RECOVERY.sql

# Cách 2: Từ MySQL/MariaDB client
mysql -u root -p
source COMPLETE_DATABASE_RECOVERY.sql
```

### Bước 4: Xác minh khôi phục thành công
Script sẽ tự động kiểm tra và hiển thị:
- Danh sách tất cả bảng đã tạo
- Các stored procedures và functions
- Tổng số bảng được tạo
- Thông báo hoàn thành

## 📊 Dữ liệu mẫu được tạo

### Users mặc định:
- **admin** (admin@bss.local) - Quản trị viên
- **user1** (user1@bss.local) - Nguyễn Văn A
- **user2** (user2@bss.local) - Trần Thị B  
- **user3** (user3@bss.local) - Lê Văn C
- **user4** (user4@bss.local) - Phạm Thị D

### Servers mẫu:
- Server-01 (10.2.45.86)
- Server-02 (10.2.45.87)
- Server-03 (10.2.45.88)

### Phân công mẫu:
- Một work_schedule với 4 nhân viên (user1-user4)

## 🔧 Stored Procedures và Functions

### Functions:
- **`GetEmployeeNameByRole(role)`** - Lấy tên nhân viên theo vai trò

### Procedures:
- **`GetEmployeeRolesFromWorkSchedule()`** - Lấy thông tin phân công hiện tại
- **`GenerateMonthlyScheduleFromRoles(month, year, created_by, starting_role)`** - Tạo phân công tháng
- **`GetMonthlySchedule(month, year)`** - Lấy phân công theo tháng
- **`UpdateMonthlySchedule(id, data, updated_by)`** - Cập nhật phân công
- **`DeleteMonthlySchedule(id, deleted_by)`** - Xóa phân công
- **`GetAllMonthlySchedules()`** - Lấy tất cả phân công

## 🔍 Kiểm tra sau khôi phục

### 1. Kiểm tra số lượng bảng:
```sql
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'bc_bss';
```

### 2. Kiểm tra dữ liệu users:
```sql
SELECT id, username, email, firstName, lastName, role_id 
FROM users;
```

### 3. Test function:
```sql
SELECT GetEmployeeNameByRole('A') as employee_name;
```

### 4. Test procedure tạo phân công tháng:
```sql
CALL GenerateMonthlyScheduleFromRoles(12, 2024, 1, 'A');
```

## ⚠️ Lưu ý quan trọng

1. **Script sẽ XÓA TẤT CẢ dữ liệu cũ** - Hãy backup trước khi chạy
2. **Mật khẩu mặc định** cho tất cả users là hash của "password123"
3. **Database name** phải là `bc_bss`
4. **MariaDB version** tương thích: 10.4+ 
5. **Charset** sử dụng: utf8mb4

## 🆘 Xử lý lỗi

### Lỗi kết nối database:
```bash
# Kiểm tra MariaDB service
sudo systemctl status mariadb
sudo systemctl start mariadb
```

### Lỗi quyền user:
```sql
-- Cấp quyền cho user root
GRANT ALL PRIVILEGES ON bc_bss.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Lỗi charset:
```sql
-- Đảm bảo charset đúng
ALTER DATABASE bc_bss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình khôi phục:
1. Kiểm tra log MariaDB: `/var/log/mysql/error.log`
2. Xem script có chạy đến dòng nào bị lỗi
3. Chạy từng phần script để debug
4. Kiểm tra version MariaDB compatibility

## 🔄 Backup tự động (Khuyến nghị)

Tạo script backup tự động để tránh mất dữ liệu:
```bash
#!/bin/bash
# backup_daily.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p bc_bss > /path/to/backup/bc_bss_backup_$DATE.sql
```

## ✅ Checklist sau khôi phục

- [ ] Database `bc_bss` được tạo thành công
- [ ] Tất cả 11 bảng được tạo
- [ ] 7 stored procedures được tạo  
- [ ] 1 function được tạo
- [ ] Dữ liệu mẫu được insert
- [ ] Index được tạo
- [ ] Backend application kết nối thành công
- [ ] API endpoints hoạt động bình thường 