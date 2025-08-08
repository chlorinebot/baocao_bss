# 🔧 Debug: Vấn đề không thể tạo báo cáo

## 🚨 Vấn đề
Nhân viên đã đến ca làm việc nhưng không thể tạo báo cáo.

## ✅ Các bước đã sửa

### 1. Sửa lỗi biến môi trường
- **Vấn đề**: Sự không nhất quán giữa `BACKEND_URL` và `NEXT_PUBLIC_BACKEND_URL`
- **Sửa**: Thống nhất sử dụng `NEXT_PUBLIC_BACKEND_URL` trong tất cả API routes

### 2. Thêm logging debug chi tiết
- **ReportsService**: Thêm logging để theo dõi quá trình kiểm tra quyền và tạo báo cáo  
- **WorkScheduleService**: Thêm logging để theo dõi việc lấy lịch làm việc
- **Thông tin log**: Thời gian, user ID, ca làm việc, kết quả kiểm tra

### 3. Cải thiện error handling
- Bắt và log chi tiết các lỗi
- Trả về thông báo lỗi rõ ràng hơn

### 4. **CẬP NHẬT LOGIC ROTATION** ⭐
- **Thay đổi từ**: Logic cố định (A=sáng, B=chiều, C=tối, D=dự phòng)
- **Thành**: Logic rotation (A,B,C,D luân phiên các ca theo ngày)
- **Lợi ích**: Công bằng, cân bằng workload, mỗi người nghỉ 1 ngày/4 ngày

## 🛠️ Cách kiểm tra và debug

### Bước 1: Kiểm tra backend có chạy không
```bash
# Chạy script test
node test-backend-connection.js
```

### Bước 2: Kiểm tra log trong backend
Mở terminal backend và xem log khi user thử tạo báo cáo:
```bash
cd server
npm run start:dev
```

Tìm các log có emoji sau:
- 🔍 Bắt đầu kiểm tra quyền
- 📅 Thông tin ngày kiểm tra  
- 👤 Thông tin phân công
- ⏰ Thông tin thời gian
- 📊 **Ngày thứ X từ activation_date** (MỚI)
- 🔄 **Rotation cho ngày X: Sáng=A, Chiều=B, Tối=C** (MỚI)
- ✅/❌ Kết quả kiểm tra

### Bước 3: Kiểm tra frontend console
Mở Developer Tools (F12) và xem tab Console khi submit báo cáo.
Tìm các log có emoji:
- 🚀 Gửi báo cáo
- 📥 Nhận phản hồi
- ✅/❌ Kết quả

### Bước 4: Kiểm tra database
```sql
-- Kiểm tra bảng work_schedules có data không
SELECT * FROM work_schedule 
WHERE activation_date = CURRENT_DATE 
ORDER BY created_date DESC;

-- Kiểm tra user có trong schedule không và vai trò
SELECT ws.*, 
  CASE 
    WHEN ws.employee_a = [USER_ID] THEN 'A'
    WHEN ws.employee_b = [USER_ID] THEN 'B' 
    WHEN ws.employee_c = [USER_ID] THEN 'C'
    WHEN ws.employee_d = [USER_ID] THEN 'D'
    ELSE 'NOT_ASSIGNED'
  END as user_role,
  DATEDIFF(CURRENT_DATE, ws.activation_date) + 1 as day_number
FROM work_schedule ws
WHERE ws.activation_date <= CURRENT_DATE AND u.id = [USER_ID];

-- Kiểm tra báo cáo đã có chưa
SELECT * FROM reports 
WHERE id_user = [USER_ID] AND shift_date = CURRENT_DATE;
```

## 🎯 Các trường hợp có thể xảy ra

### 1. ❌ Backend không chạy
**Triệu chứng**: Console log "Không thể kết nối đến backend"
**Giải pháp**: 
```bash
cd server
npm run start:dev
```

### 2. ❌ Database không có schedule  
**Triệu chứng**: Log "Không tìm thấy schedule cho ngày"
**Giải pháp**: Tạo work schedule cho ngày hiện tại qua dashboard

### 3. ❌ User không được phân công
**Triệu chứng**: Log "User không có trong schedule" 
**Giải pháp**: Thêm user vào schedule qua dashboard

### 4. ❌ **User nghỉ ngày hôm nay** (MỚI)
**Triệu chứng**: Log "User nghỉ ngày hôm nay"
**Giải pháp**: 
- Đây là tính năng mới của rotation
- Mỗi user nghỉ 1 ngày trong chu kỳ 4 ngày
- Không thể tạo báo cáo khi nghỉ
- Kiểm tra lại rotation schedule

### 5. ❌ Ngoài giờ làm việc
**Triệu chứng**: Log "Ngoài thời gian cho phép"
**Giải pháp**: 
- Kiểm tra thời gian hiện tại
- **Kiểm tra ca được phân công theo rotation** (thay đổi theo ngày)
- Đảm bảo trong khung giờ cho phép:
  - Ca sáng: 06:00 - 14:30
  - Ca chiều: 14:00 - 22:30  
  - Ca đêm: 22:00 - 06:30 (hôm sau)

### 6. ❌ Đã tạo báo cáo rồi
**Triệu chứng**: Log "Đã tạo báo cáo cho [ca] hôm nay"
**Giải pháp**: Mỗi ca chỉ được tạo 1 báo cáo, kiểm tra lại hoặc chỉnh sửa báo cáo cũ

### 7. ❌ **Activation Date sai** (MỚI)
**Triệu chứng**: Rotation không đúng, ca làm việc sai
**Giải pháp**:
- Kiểm tra `activation_date` trong work_schedule
- Phải là ngày bắt đầu đúng để tính rotation
- Cập nhật activation_date nếu sai

### 8. ❌ Lỗi database
**Triệu chứng**: Log "Lỗi hệ thống khi kiểm tra quyền"
**Giải pháp**:
- Kiểm tra kết nối database
- Kiểm tra các bảng có tồn tại không
- Restart lại backend

## 🔄 **Kiểm tra Logic Rotation** (MỚI)

### Công thức kiểm tra:
```javascript
// Với user role X, ngày thứ N từ activation_date
const roleOffset = {'A': 0, 'B': 1, 'C': 2, 'D': 3}[userRole];
const dayNumber = Math.floor((today - activationDate) / (1000*60*60*24)) + 1;

const morningRole = ['A','B','C','D'][((roleOffset - (dayNumber - 1)) % 4 + 4) % 4];
const afternoonRole = ['A','B','C','D'][((roleOffset - (dayNumber - 1) - 1) % 4 + 4) % 4];  
const eveningRole = ['A','B','C','D'][((roleOffset - (dayNumber - 1) - 2) % 4 + 4) % 4];
```

### Ví dụ kiểm tra:
- **User A, Ngày 1**: Sáng=A, Chiều=D, Tối=C, Nghỉ=B
- **User A, Ngày 2**: Sáng=B, Chiều=A, Tối=D, Nghỉ=C
- **User A, Ngày 3**: Sáng=C, Chiều=B, Tối=A, Nghỉ=D
- **User A, Ngày 4**: Sáng=D, Chiều=C, Tối=B, Nghỉ=A

## 🚀 Chạy lại backend với logging

```bash
# Terminal 1 - Backend với log chi tiết
cd server  
npm run start:dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 📞 Nếu vấn đề vẫn tồn tại

1. Chạy `node test-backend-connection.js` và gửi kết quả
2. Cung cấp log từ backend console (đặc biệt chú ý rotation logs)
3. Cung cấp log từ frontend console  
4. Screenshot của lỗi trên giao diện
5. Thông tin về thời gian hiện tại và ca làm việc được phân công
6. **Thông tin activation_date và ngày hiện tại để kiểm tra rotation**

## 📚 Tài liệu tham khảo

- [ROTATION_SCHEDULE_LOGIC.md](./ROTATION_SCHEDULE_LOGIC.md) - Chi tiết về logic rotation
- [SHIFT_BASED_REPORT_PERMISSION.md](./SHIFT_BASED_REPORT_PERMISSION.md) - Quy tắc tạo báo cáo theo ca 