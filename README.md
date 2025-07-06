# Hệ thống quản lý báo cáo BSS-MBF của TELSOFT

Một hệ thống quản lý người dùng hiện đại với giao diện đăng nhập, đăng ký và dashboard được xây dựng bằng Next.js (Frontend) và NestJS (Backend).

## 🚀 Tính năng

- ✅ **Đăng ký tài khoản** với validation đầy đủ
- ✅ **Đăng nhập** với xác thực an toàn
- ✅ **Dashboard** hiển thị thông tin người dùng
- ✅ **Responsive design** tương thích mọi thiết bị
- ✅ **Giao diện hiện đại** với gradient và animations
- ✅ **TypeScript** hỗ trợ đầy đủ

## 🏗️ Cấu trúc dự án

```
├── client/          # Frontend (Next.js)
│   ├── src/app/
│   │   ├── login/          # Trang đăng nhập
│   │   ├── register/       # Trang đăng ký
│   │   ├── dashboard/      # Trang dashboard
│   │   └── page.tsx        # Trang chủ
├── server/          # Backend (NestJS)
│   ├── src/
│   │   ├── users/          # Users module
│   │   ├── entities/       # Database entities
│   │   └── config/         # Cấu hình database
└── README.md
```

## 📋 Yêu cầu hệ thống

- **Node.js** >= 18.0.0
- **MariaDB** >= 10.4
- **npm** hoặc **yarn**

## ⚙️ Cài đặt và chạy

### 1. Cài đặt Database

```bash
# Tạo database
CREATE DATABASE bc_bss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Tạo bảng users
USE bc_bss;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255),
  lastName VARCHAR(255),
  birthday DATE,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình Server

```bash
cd server
npm install

# Tạo file .env
echo "DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=bc_bss
DB_TYPE=mariadb
PORT=3000
NODE_ENV=development" > .env
```

### 3. Cấu hình Client

```bash
cd ../client
npm install
```

### 4. Cài đặt dependencies

**Cài đặt dependencies cho Server:**
```bash
cd server
npm install
```

**Cài đặt dependencies cho Client:**
```bash
cd client
npm install
```

**Lưu ý:** Nếu gặp lỗi về bcrypt, hãy cài đặt lại:
```bash
cd server
npm uninstall bcrypt
npm install bcrypt@^5.1.1
npm install --save-dev @types/bcrypt@^5.0.2
```

### 5. Khởi động hệ thống

**Terminal 1 - Server:**
```bash
cd server
npm run start:dev
# Server chạy trên http://localhost:3000
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
# Client chạy trên http://localhost:9999
```

## 🌐 Sử dụng

1. **Truy cập**: http://localhost:9999
2. **Đăng ký**: Tạo tài khoản mới với thông tin đầy đủ
3. **Đăng nhập**: Sử dụng username/password đã tạo
4. **Dashboard**: Xem thông tin tài khoản và quản lý

## 📱 Giao diện

### Trang chủ
- Hero section với call-to-action
- Hiển thị tính năng nổi bật
- Responsive design

### Đăng ký
- Form đầy đủ: Họ, Tên, Username, Email, Ngày sinh, Mật khẩu
- Validation client-side và server-side
- Thông báo lỗi/thành công

### Đăng nhập
- Form đơn giản: Username và Password
- Chuyển hướng tự động sau khi đăng nhập thành công

### Dashboard
- Hiển thị thông tin người dùng
- Nút đăng xuất
- Interface thân thiện

## 🔧 API Endpoints

### Users
- `GET /users` - Lấy danh sách users
- `POST /users` - Tạo user mới
- `GET /users/:id` - Lấy thông tin user
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user
- `GET /users/count/total` - Đếm số lượng users

## 🎨 Thiết kế

- **Màu sắc**: Gradient tím/xanh (#667eea to #764ba2)
- **Typography**: Sans-serif hiện đại
- **Components**: Cards với border-radius lớn, shadows
- **Animations**: Hover effects, transitions mượt mà

## 🔒 Bảo mật

- Mật khẩu được hash an toàn
- Validation dữ liệu đầu vào
- TypeORM ORM để tránh SQL injection
- Environment variables cho cấu hình nhạy cảm

## 📝 Lưu ý

- TypeORM synchronize đã được **vô hiệu hóa** - bảng phải tạo thủ công
- Frontend chạy trên port 9999, Backend trên port 3000
- Đảm bảo MariaDB đang chạy trước khi khởi động server