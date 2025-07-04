import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginResponse } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<LoginResponse | null> {
    try {
      // Tìm user theo username
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        return null;
      }

      // Kiểm tra mật khẩu bằng bcrypt
      const isPasswordValid = await this.usersService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      // Tạo access token đơn giản
      const access_token = `token_${user.id}_${Date.now()}`;

      // Trả về thông tin user (không bao gồm password)
      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role_id: user.role_id,
          birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : '',
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        }
      };
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }
} 