# 🔧 HƯỚNG DẪN KHẮC PHỤC LỖI HIỂN THỊ PHÂN CÔNG THÁNG

## 🔍 **Phân tích lỗi từ console:**

Từ console logs, tôi thấy:
- ✅ Frontend nhận được response từ backend
- ❌ `schedule_data` là `undefined` 
- ❌ `schedule_data_length: 0`
- ❌ Hiển thị "Không có dữ liệu phân công"

## 🔧 **Các bước khắc phục:**

### **Bước 1: Chạy SQL debug database**
Copy và chạy nội dung file `debug_database.sql` trong MySQL Workbench để:
- Kiểm tra dữ liệu có tồn tại không
- Xem cấu trúc bảng
- Insert dữ liệu test mới

### **Bước 2: Chạy ứng dụng đúng cách**

**Cách 1: Sử dụng script tự động**
```bash
# Double click file run_app.bat
# Hoặc chạy trong PowerShell:
.\run_app.bat
```

**Cách 2: Chạy thủ công**
```bash
# Terminal 1 - Backend
cd server
npm run start:dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### **Bước 3: Test và debug**
1. Mở http://localhost:9999
2. Đăng nhập với admin
3. Vào "Ca làm việc hàng tháng"
4. Chọn tháng 7/2025
5. **Mở Console (F12)** để xem logs

## 🎯 **Kết quả mong đợi sau khi sửa:**

### **Backend logs sẽ hiển thị:**
```
🔧 [MonthlySchedulesService] Raw JSON string: [{"date":1,"shifts":...}]
✅ [MonthlySchedulesService] JSON parsed successfully
✅ [MonthlySchedulesService] Parsed data length: 2
```

### **Frontend logs sẽ hiển thị:**
```
✅ [Frontend] JSON parsed successfully
✅ [Frontend] Array length: 2
🎯 [Frontend] Final parsed data: {schedule_data_length: 2}
```

### **UI sẽ hiển thị:**
- ✅ Debug info: `schedule_data is array: YES, length: 2`
- ✅ Success message: "Tìm thấy 2 ngày phân công!"
- ✅ 2 ngày với đầy đủ ca sáng, chiều, tối

## 🚨 **Nếu vẫn lỗi:**

1. **Kiểm tra database:** Chạy `debug_database.sql`
2. **Kiểm tra backend logs:** Tìm dòng `schedule_data IS NULL/UNDEFINED`
3. **Kiểm tra frontend logs:** Tìm dòng `RESPONSE IS NULL/UNDEFINED`
4. **Restart cả backend và frontend**

## 📞 **Debug nhanh:**

Nếu vẫn không hiển thị, chạy query này trong MySQL:
```sql
SELECT id, month, year, 
       schedule_data IS NULL as is_null,
       LENGTH(schedule_data) as data_length
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025;
```

Nếu `is_null = 1` hoặc `data_length = NULL` thì vấn đề ở database.
Nếu có dữ liệu nhưng frontend không hiển thị thì vấn đề ở parsing JSON. 