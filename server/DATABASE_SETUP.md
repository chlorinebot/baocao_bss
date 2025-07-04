# Hướng dẫn Setup Database MariaDB

## Thông tin kết nối
- **Máy chủ**: 127.0.0.1 via TCP/IP
- **Kiểu máy chủ**: MariaDB
- **Phiên bản**: 10.4.32-MariaDB
- **Cổng**: 3306 (mặc định)
- **Người dùng**: root@localhost
- **Database**: bc_bss
- **SSL**: Không sử dụng

## Cách thiết lập

### 1. Tạo Database
Đầu tiên, bạn cần tạo database `bc_bss` trong MariaDB:

```sql
CREATE DATABASE bc_bss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Tạo bảng users thủ công
Vì đã vô hiệu hóa tính năng tự động tạo bảng, bạn cần tạo bảng users thủ công:

```sql
USE bc_bss;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình Environment Variables
Tạo file `.env` trong thư mục `server/` với nội dung:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=bc_bss
DB_TYPE=mariadb

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Kiểm tra kết nối
Chạy server để kiểm tra kết nối database:

```bash
npm run start:dev
```

### 5. Test API Endpoints

#### Health Check
```bash
GET http://localhost:3000/health
```

#### Users API
```bash
# Lấy tất cả users
GET http://localhost:3000/users

# Tạo user mới
POST http://localhost:3000/users
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}

# Lấy user theo ID
GET http://localhost:3000/users/1

# Cập nhật user
PUT http://localhost:3000/users/1
Content-Type: application/json

{
  "fullName": "Updated Name"
}

# Xóa user
DELETE http://localhost:3000/users/1

# Đếm số lượng users
GET http://localhost:3000/users/count/total
```

## Cấu trúc Database

### Entity User
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100, nullable: true })
  fullName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Lưu ý quan trọng
1. Đảm bảo MariaDB server đang chạy
2. Database `bc_bss` phải được tạo trước
3. Bảng `users` phải được tạo thủ công (xem phần 2 ở trên)
4. User `root` phải có quyền truy cập database
5. TypeORM đã được cấu hình để KHÔNG tự động tạo bảng (synchronize: false) 