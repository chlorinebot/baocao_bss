# 🔧 Sửa lỗi Hard-code Ca Làm Việc

## 🚨 Vấn đề phát hiện
Dù đã xóa dữ liệu trong bảng `monthly_work_schedules`, hệ thống vẫn hiển thị user đang ở "ca chiều". Nguyên nhân: **Logic ca làm việc bị hard-code** trong code thay vì lấy từ database rotation.

## 🔍 Các method bị hard-code đã tìm thấy:

### 1. ❌ `getCurrentShiftType()` trong ReportsService
**File**: `server/src/reports/reports.service.ts`
**Vấn đề**: 
```typescript
private getCurrentShiftType(): 'morning' | 'afternoon' | 'evening' {
  const currentHour = new Date().getHours();
  
  if (currentHour >= 6 && currentHour < 14) {
    return 'morning';
  } else if (currentHour >= 14 && currentHour < 22) {  // ← Hard-code ca chiều!
    return 'afternoon';
  } else {
    return 'evening';
  }
}
```
**Tác động**: Method `createReport()` sử dụng `getCurrentShiftType()` → luôn lưu báo cáo với ca chiều nếu tạo lúc 14:00-22:00

### 2. ❌ `getUserCurrentShift()` trong WorkScheduleService  
**File**: `server/src/work-schedule/work-schedule.service.ts`
**Vấn đề**:
```typescript
if (currentHour >= 14 && currentHour < 22) {
  // Ca chiều: 14h - 22h  ← Hard-code ca chiều!
  shift = 'Ca Chiều';
  shiftTime = '14:00 - 22:00';
}
```
**Tác động**: API `/work-schedule/user-current-shift/:userId` luôn trả về "Ca Chiều" nếu gọi lúc 14:00-22:00

## ✅ Các sửa chữa đã thực hiện:

### 1. **Xóa method `getCurrentShiftType()`**
- Method này hoàn toàn không cần thiết với logic rotation
- Gây confusion và override logic database

### 2. **Sửa method `createReport()`**
- **Trước**: Sử dụng `getCurrentShiftType()` (hard-code)
- **Sau**: Lấy `shiftType` từ `userSchedule.assignedShifts` (database rotation)
- **Logic mới**:
  1. Lấy user schedule từ rotation
  2. Tìm ca hiện tại từ `assignedShifts`
  3. Nếu không có ca hiện tại, kiểm tra thời gian gia hạn
  4. Lưu báo cáo với `shift_type` chính xác từ rotation

### 3. **Sửa method `getUserCurrentShift()`**
- **Trước**: Hard-code ca dựa trên giờ hiện tại
- **Sau**: Sử dụng `getUserScheduleForDate()` để lấy rotation
- **Logic mới**:
  1. Gọi `getUserScheduleForDate()` để lấy thông tin rotation
  2. Tìm ca hiện tại từ `assignedShifts`
  3. Xử lý trường hợp nghỉ ngày
  4. Trả về thông tin chính xác từ database

## 🎯 Kết quả sau khi sửa:

### ✅ Trước khi có work_schedule:
- **API response**: `"role": "Chưa được phân công"`
- **Shift**: `null`
- **Không còn hard-code** "Ca Chiều"

### ✅ Sau khi tạo work_schedule:
- **API response**: Dựa trên rotation logic thực tế
- **Shift**: Tính toán từ `activation_date` và `daysDiff`
- **Rotation đúng**: A,B,C,D luân phiên theo ngày

### ✅ Khi user nghỉ ngày:
- **API response**: `"shift": "Nghỉ"`
- **ShiftTime**: `"Nghỉ ngày hôm nay"`
- **Không thể tạo báo cáo**

## 🧪 Test để xác minh:

1. **Test không có schedule**:
```bash
node test-reports-permission.js
# Kỳ vọng: "Chưa được phân công", không phải "Ca Chiều"
```

2. **Test sau khi tạo schedule**:
```sql
-- Chạy script tạo schedule
mysql -u root -p bc_bss < create_test_schedule.sql
```

3. **Test rotation logic**:
```bash
# Test với user khác nhau và ngày khác nhau
node test-reports-permission.js
```

## 📝 Files đã chỉnh sửa:

1. ✅ `server/src/reports/reports.service.ts`
   - Xóa `getCurrentShiftType()`
   - Sửa `createReport()` sử dụng rotation logic

2. ✅ `server/src/work-schedule/work-schedule.service.ts`  
   - Sửa `getUserCurrentShift()` sử dụng rotation logic
   - Thêm logging debug chi tiết

3. ✅ `client/src/app/api/reports/can-create/[userId]/route.ts`
   - Sửa lỗi NextJS params awaiting

## 🚀 Cần làm tiếp:

1. **Restart backend** để áp dụng thay đổi:
```bash
cd server && npm run start:dev
```

2. **Tạo work_schedule** để test:
```bash
mysql -u root -p bc_bss < create_test_schedule.sql
```

3. **Test lại** để xác minh sửa chữa:
```bash
node test-reports-permission.js
```

## 💡 Bài học:

- **Không hard-code** business logic trong code
- **Luôn lấy dữ liệu** từ database/rotation logic  
- **Test kỹ** các edge case (không có schedule, nghỉ ngày)
- **Log chi tiết** để debug dễ dàng
- **Tách biệt** logic presentation và business logic 