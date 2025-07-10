import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthServiceResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role_id: number;
    birthday?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role_id: number;
    birthday?: string;
    createdAt: string;
    updatedAt: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    try {
      // Validate input
      if (!loginDto.username || !loginDto.password) {
        return {
          success: false,
          message: 'Tên đăng nhập và mật khẩu là bắt buộc'
        };
      }

      // Trim whitespace
      loginDto.username = loginDto.username.trim();
      loginDto.password = loginDto.password.trim();

      const result = await this.authService.validateUser(loginDto.username, loginDto.password);
      
      if (!result) {
        return {
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không đúng'
        };
      }

      return {
        success: true,
        message: 'Đăng nhập thành công',
        token: result.access_token,
        user: result.user
      };
    } catch (error) {
      console.error('❌ Lỗi trong auth controller:', error);
      
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.'
      };
    }
  }
} 