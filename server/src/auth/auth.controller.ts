import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const result = await this.authService.validateUser(loginDto.username, loginDto.password);
      if (!result) {
        throw new HttpException('Tên đăng nhập hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Có lỗi xảy ra trong quá trình đăng nhập', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 