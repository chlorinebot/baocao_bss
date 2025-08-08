# 🔄 Logic Phân Công Ca Làm Việc Theo Rotation

## 📋 Tổng quan

Hệ thống sử dụng **logic rotation** để phân công ca làm việc cho 4 nhân viên A, B, C, D. Thay vì cố định vai trò theo ca, các nhân viên sẽ **luân phiên** các ca làm việc theo ngày.

## 🎯 Nguyên tắc Rotation

### Quy tắc cơ bản:
- **4 nhân viên**: A, B, C, D
- **3 ca làm việc**: Sáng (06:00-14:00), Chiều (14:00-22:00), Tối (22:00-06:00)
- **1 người nghỉ** mỗi ngày
- **Luân phiên** theo chu kỳ 4 ngày

### Công thức Rotation:
```
Ngày thứ N từ activation_date:
- Ca sáng: Role ((roleOffset - (N-1)) % 4 + 4) % 4
- Ca chiều: Role ((roleOffset - (N-1) - 1) % 4 + 4) % 4  
- Ca tối: Role ((roleOffset - (N-1) - 2) % 4 + 4) % 4
- Nghỉ: Role còn lại
```

## 📅 Ví dụ Rotation (bắt đầu từ A)

### Ngày 1:
- **Ca sáng**: A (Nhân viên A)
- **Ca chiều**: D (Nhân viên D)  
- **Ca tối**: C (Nhân viên C)
- **Nghỉ**: B (Nhân viên B)

### Ngày 2:
- **Ca sáng**: B (Nhân viên B) - người nghỉ hôm trước
- **Ca chiều**: A (Nhân viên A)
- **Ca tối**: D (Nhân viên D)
- **Nghỉ**: C (Nhân viên C)

### Ngày 3:
- **Ca sáng**: C (Nhân viên C) - người nghỉ hôm trước
- **Ca chiều**: B (Nhân viên B)
- **Ca tối**: A (Nhân viên A)
- **Nghỉ**: D (Nhân viên D)

### Ngày 4:
- **Ca sáng**: D (Nhân viên D) - người nghỉ hôm trước
- **Ca chiều**: C (Nhân viên C)
- **Ca tối**: B (Nhân viên B)
- **Nghỉ**: A (Nhân viên A)

### Ngày 5: (Lặp lại chu kỳ)
- **Ca sáng**: A (Nhân viên A)
- **Ca chiều**: D (Nhân viên D)
- **Ca tối**: C (Nhân viên C)
- **Nghỉ**: B (Nhân viên B)

## 🔧 Cài đặt Kỹ thuật

### 1. WorkScheduleService
File: `server/src/work-schedule/work-schedule.service.ts`

**Chức năng**: Tính toán ca làm việc dựa trên:
- `activation_date`: Ngày bắt đầu rotation
- `rolePosition`: Vai trò của user (A, B, C, D)  
- `daysDiff`: Số ngày từ activation_date

### 2. ReportsService
File: `server/src/reports/reports.service.ts`

**Chức năng**: Kiểm tra quyền tạo báo cáo dựa trên:
- Ca làm việc được phân công theo rotation
- Thời gian hiện tại
- Trạng thái nghỉ ngày

## ⚠️ Trường hợp đặc biệt

### 1. Nghỉ ngày
- User không được phân công ca nào
- `assignedShifts.length === 0`
- Không thể tạo báo cáo
- Thông báo: "Bạn được nghỉ ngày hôm nay theo lịch luân phiên"

### 2. Thời gian gia hạn
- Sau khi kết thúc ca: thêm 30 phút để tạo báo cáo
- Ca sáng: đến 14:30
- Ca chiều: đến 22:30  
- Ca tối: đến 06:30 (sáng hôm sau)

### 3. Activation Date
- Ngày đầu tiên của work_schedule
- Dùng để tính `daysDiff` cho rotation
- Quan trọng: phải chính xác để rotation đúng

## 🛠️ Debug và Kiểm tra

### Log Debug
Trong console sẽ hiển thị:
```
📊 Ngày thứ 2 từ activation_date: 2024-01-15
🔄 Rotation cho ngày 2: Sáng=B, Chiều=A, Tối=D
🌇 User 123 (B) - Ca chiều, đang trong ca: true
```

### SQL Kiểm tra
```sql
-- Kiểm tra work_schedule hiện tại
SELECT * FROM work_schedule 
WHERE activation_date = CURRENT_DATE
ORDER BY created_date DESC LIMIT 1;

-- Kiểm tra user trong schedule
SELECT 
  ws.*,
  CASE 
    WHEN ws.employee_a = [USER_ID] THEN 'A'
    WHEN ws.employee_b = [USER_ID] THEN 'B' 
    WHEN ws.employee_c = [USER_ID] THEN 'C'
    WHEN ws.employee_d = [USER_ID] THEN 'D'
    ELSE 'NOT_ASSIGNED'
  END as role
FROM work_schedule ws
WHERE ws.activation_date = CURRENT_DATE;
```

## 🔄 Migration từ Logic Cũ

### Logic cũ (Cố định):
- A = Sáng cố định
- B = Chiều cố định
- C = Tối cố định  
- D = Dự phòng (tất cả ca)

### Logic mới (Rotation):
- A, B, C, D luân phiên tất cả ca
- Mỗi người nghỉ 1 ngày/4 ngày
- Công bằng và cân bằng workload

## 📝 Lưu ý quan trọng

1. **Activation Date**: Phải được set chính xác khi tạo work_schedule
2. **Time Zone**: Đảm bảo server time đúng múi giờ
3. **Database Sync**: Work_schedule và monthly_schedule phải đồng bộ logic
4. **Testing**: Test kỹ rotation với các ngày khác nhau
5. **Backup**: Lưu trữ logic cũ để rollback nếu cần 