import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginResponse } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<LoginResponse | null> {
    try {
      console.log(`🔐 Đang xác thực user: ${username}`);
      
      // Tìm user theo username
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        console.log(`❌ Không tìm thấy user: ${username}`);
        return null;
      }

      console.log(`✅ Tìm thấy user: ${username}, ID: ${user.id}`);

      // Kiểm tra mật khẩu bằng bcrypt
      const isPasswordValid = await this.usersService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        console.log(`❌ Mật khẩu không đúng cho user: ${username}`);
        return null;
      }

      console.log(`✅ Mật khẩu đúng cho user: ${username}`);

      // Tạo access token đơn giản
      const access_token = `token_${user.id}_${Date.now()}`;

      // Xử lý birthday an toàn
      let birthdayString = '';
      if (user.birthday) {
        try {
          if (user.birthday instanceof Date) {
            birthdayString = user.birthday.toISOString().split('T')[0];
          } else if (typeof user.birthday === 'string') {
            birthdayString = user.birthday;
          }
        } catch (error) {
          console.log('⚠️ Lỗi xử lý birthday:', error.message);
          birthdayString = '';
        }
      }

      // Trả về thông tin user (không bao gồm password)
      const loginResponse = {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role_id: user.role_id,
          birthday: birthdayString,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }
      };

      console.log(`✅ Đăng nhập thành công cho user: ${username}`);
      return loginResponse;
    } catch (error) {
      console.error('❌ Lỗi trong validateUser:', error);
      return null;
    }
  }
} 