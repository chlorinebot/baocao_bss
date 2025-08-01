# Hệ thống Kiểm soát Quyền Tạo Báo cáo Theo Ca Làm việc

## Tổng quan

Hệ thống kiểm soát quyền tạo báo cáo đảm bảo nhân viên chỉ có thể tạo báo cáo trong ca làm việc được phân công và tuân theo các quy tắc nghiêm ngặt về thời gian.

## Quy tắc Kiểm soát

### 1. Thời gian Tạo Báo cáo
- **Ca Sáng (06:00 - 14:00)**: Có thể tạo báo cáo từ 06:00 đến 14:30
- **Ca Chiều (14:00 - 22:00)**: Có thể tạo báo cáo từ 14:00 đến 22:30  
- **Ca Tối (22:00 - 06:00)**: Có thể tạo báo cáo từ 22:00 đến 06:30 (hôm sau)

### 2. Gia hạn 30 phút
Sau khi kết thúc ca làm việc, nhân viên có thêm **30 phút** để hoàn thành báo cáo. Sau thời gian này, quyền tạo báo cáo sẽ bị khóa.

### 3. Một báo cáo mỗi ca
Mỗi nhân viên chỉ được tạo **một báo cáo duy nhất** cho mỗi ca làm việc trong ngày.

### 4. Kiểm tra phân công
Chỉ những nhân viên được phân công ca làm việc mới có quyền tạo báo cáo.

## Giao diện Người dùng

### 1. Trạng thái Quyền Tạo Báo cáo

#### ✅ Được phép tạo báo cáo
- **Icon**: Dấu tích xanh lá
- **Tiêu đề**: "Được phép tạo báo cáo"
- **Nội dung**: Hiển thị ca hiện tại và thời gian ca
- **Form**: Được kích hoạt, có thể điền và submit

#### ❌ Không được phép (lỗi thời gian)
- **Icon**: Dấu cảnh báo đỏ
- **Tiêu đề**: "Không thể tạo báo cáo"
- **Nội dung**: Thông báo lý do (ngoài giờ, chưa phân công, etc.)
- **Nút**: "Kiểm tra lại", "Về trang chủ"
- **Form**: Bị disable và mờ đi

#### ⚠️ Đã hoàn thành báo cáo ca này
- **Icon**: Dấu tích vàng
- **Tiêu đề**: "Đã hoàn thành báo cáo ca này"
- **Nội dung**: "Đã tạo báo cáo cho ca [sáng/chiều/tối] hôm nay"
- **Nút đặc biệt**: 
  - **"Xem lịch sử báo cáo"** (nút chính, màu xanh)
  - "Kiểm tra lại"
  - "Về trang chủ"
- **Form**: Bị disable và mờ đi

### 2. Trang Lịch sử Báo cáo (`/reports/history`)

#### Tính năng chính:
- **Bộ lọc thông minh**: Theo ngày, tuần, tháng
- **Quick filters**: Hôm nay, tuần này, tháng này, tuần trước, tháng trước
- **Thống kê trực quan**: Tổng báo cáo, đang hiển thị, báo cáo hôm nay
- **Bảng danh sách**: Hiển thị ca làm việc, ngày ca, thời gian tạo
- **Badge màu sắc**: 
  - Ca sáng: Vàng (warning)
  - Ca chiều: Xanh dương (info)  
  - Ca tối: Đen (dark)

#### Navigation:
- **Header**: Nút "Tạo báo cáo mới", "Về trang chủ"
- **Từ trang reports**: Nút "Xem lịch sử báo cáo" khi đã tạo báo cáo

## Các thay đổi đã thực hiện

### Backend
1. Cập nhật `report.entity.ts` - thêm `shift_type` và `shift_date`
2. Cập nhật `reports.service.ts` - thêm logic kiểm tra quyền
3. Cập nhật `reports.controller.ts` - thêm endpoint kiểm tra quyền
4. Cập nhật `reports.module.ts` - import WorkScheduleModule

### Frontend  
1. Cập nhật `reports/page.tsx` - thêm UI kiểm tra quyền với logic đặc biệt cho trường hợp đã tạo báo cáo
2. Tạo `reports/history/page.tsx` - trang lịch sử báo cáo hoàn chỉnh
3. Tạo `api/reports/can-create/[userId]/route.ts` - API proxy

### Database
1. Tạo migration `AddShiftFieldsToReports.sql`

## Cách hoạt động

### Flow chính:
1. **Vào trang tạo báo cáo** → Hệ thống kiểm tra quyền tự động
2. **Hiển thị trạng thái**:
   - Được phép: Form kích hoạt, có thể tạo báo cáo
   - Không được phép (thời gian): Form disable, hiển thị lý do
   - **Đã tạo báo cáo**: Form disable, nút "Xem lịch sử báo cáo" nổi bật
3. **Submit báo cáo**: Backend kiểm tra lại quyền trước khi lưu
4. **Sau khi tạo**: Chuyển đến trang review hoặc lịch sử

### Flow đặc biệt cho trường hợp đã tạo báo cáo:
1. **Phát hiện đã tạo báo cáo** → UI chuyển sang màu vàng (warning)
2. **Nút chính**: "Xem lịch sử báo cáo" → Chuyển đến `/reports/history`
3. **Trang lịch sử**: Hiển thị tất cả báo cáo với bộ lọc thông minh
4. **Có thể quay lại**: Nút "Tạo báo cáo mới" để kiểm tra ca khác

## Thông báo Chi tiết

### Các loại thông báo lỗi:
- "Nhân viên chưa được phân công ca làm việc"
- "Chỉ được phép tạo báo cáo trong ca làm việc và 30 phút sau ca. Thời gian cho phép: [XX:XX - XX:XX]"
- **"Đã tạo báo cáo cho ca [sáng/chiều/tối] hôm nay. Mỗi ca chỉ được tạo báo cáo một lần."**

### UI tương ứng:
- **Lỗi thông thường**: Icon đỏ, nút "Kiểm tra lại" + "Về trang chủ"  
- **Đã tạo báo cáo**: Icon vàng, nút "Xem lịch sử báo cáo" + "Kiểm tra lại" + "Về trang chủ"

Tính năng này tạo trải nghiệm người dùng mượt mà và trực quan, giúp nhân viên dễ dàng theo dõi và quản lý báo cáo ca trực của mình! 