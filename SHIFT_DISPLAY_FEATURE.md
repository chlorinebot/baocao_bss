# Tính Năng Hiển Thị Ca Trực Trong Navbar

## Tổng Quan
Đã thêm tính năng hiển thị ca trực hiện tại của nhân viên trong navbar dựa trên thời gian đăng nhập và vai trò được phân công.

## Các Ca Trực
- **Ca Sáng**: 06:00 - 14:00
- **Ca Chiều**: 14:00 - 22:00  
- **Ca Đêm**: 22:00 - 06:00

## Các Thay Đổi Đã Thực Hiện

### 1. Backend (Server)

#### Work Schedule Service (`server/src/work-schedule/work-schedule.service.ts`)
- **Thêm method `getUserRole(userId)`**: Lấy vai trò phân công của user (A, B, C, D)
- **Thêm method `getUserCurrentShift(userId)`**: Xác định ca trực hiện tại dựa trên:
  - Thời gian hiện tại
  - Vai trò được phân công
  - Trả về thông tin ca trực và thời gian

#### Work Schedule Controller (`server/src/work-schedule/work-schedule.controller.ts`)
- **Thêm endpoint `GET /work-schedule/user/:userId/current-shift`**: API lấy thông tin ca trực hiện tại
- **Thêm endpoint `GET /work-schedule/user/:userId/role`**: API lấy vai trò phân công

### 2. Frontend (Client)

#### User Interface (`client/src/app/user/page.tsx`)
- **Thêm interfaces**: `UserRole`, `UserShift` để định nghĩa cấu trúc dữ liệu
- **Thêm state `userShift`**: Lưu trữ thông tin ca trực hiện tại
- **Thêm function `fetchUserShift()`**: Gọi API lấy thông tin ca trực
- **Cập nhật navbar**: Hiển thị ca trực và thời gian làm việc

#### CSS Styling (`client/src/app/user/user.module.css`)
- **Thêm class `.shiftDisplay`**: Styling cho component hiển thị ca trực
- **Thêm class `.shiftLabel`**: Styling cho tên ca trực
- **Thêm class `.shiftTime`**: Styling cho thời gian ca trực
- **Responsive design**: Tối ưu hiển thị trên mobile

## Cách Hoạt Động

1. **Khi user đăng nhập**: 
   - Hệ thống gọi API lấy thông tin ca trực hiện tại
   - Dựa trên thời gian hiện tại để xác định ca trực
   - Hiển thị trong navbar nếu user được phân công

2. **Logic xác định ca trực**:
   ```javascript
   if (currentHour >= 6 && currentHour < 14) {
     shift = 'Ca Sáng';
   } else if (currentHour >= 14 && currentHour < 22) {
     shift = 'Ca Chiều';
   } else {
     shift = 'Ca Đêm';
   }
   ```

3. **Hiển thị trong navbar**:
   - Tên ca trực với icon Bootstrap
   - Thời gian ca trực
   - Chỉ hiển thị khi user được phân công

## API Endpoints

### GET /work-schedule/user/:userId/current-shift
**Mô tả**: Lấy thông tin ca trực hiện tại của user

**Response**:
```json
{
  "success": true,
  "message": "Lấy thông tin ca trực thành công",
  "data": {
    "role": "Nhân viên A",
    "shift": "Ca Sáng",
    "shiftTime": "06:00 - 14:00",
    "scheduleId": 1
  }
}
```

### GET /work-schedule/user/:userId/role
**Mô tả**: Lấy vai trò phân công của user

**Response**:
```json
{
  "success": true,
  "message": "Lấy vai trò phân công thành công",
  "data": {
    "role": "Nhân viên A",
    "scheduleId": 1
  }
}
```

## Files Đã Thay Đổi

1. `server/src/work-schedule/work-schedule.service.ts` - Thêm logic xử lý ca trực
2. `server/src/work-schedule/work-schedule.controller.ts` - Thêm endpoints mới
3. `client/src/app/user/page.tsx` - Thêm UI hiển thị ca trực
4. `client/src/app/user/user.module.css` - Thêm styling cho ca trực

## Test Files

1. `test-current-shift.js` - Test endpoint với axios
2. `quick-test.js` - Test endpoint với http module

## Lợi Ích

- ✅ Hiển thị ca trực theo thời gian thực
- ✅ Tự động cập nhật dựa trên thời gian hiện tại
- ✅ Chỉ hiển thị khi user được phân công
- ✅ Giao diện đẹp với Bootstrap Icons
- ✅ Responsive trên mobile
- ✅ Dễ dàng mở rộng thêm tính năng

## Hướng Dẫn Test

1. Khởi động server: `npm start` trong thư mục `server`
2. Khởi động client: `npm run dev` trong thư mục `client`
3. Truy cập: `http://localhost:3001/user`
4. Đăng nhập với tài khoản được phân công
5. Kiểm tra navbar sẽ hiển thị ca trực hiện tại

## Kết Luận

Tính năng hiển thị ca trực đã được tích hợp thành công vào hệ thống, giúp nhân viên dễ dàng biết được ca trực hiện tại của mình ngay trên navbar. 