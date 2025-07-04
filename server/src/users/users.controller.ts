import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

interface LoginDto {
  username: string;
  password: string;
}

interface LoginResponse {
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Post()
  async create(@Body() userData: Partial<User>): Promise<{ message: string; user: User }> {
    try {
      const user = await this.usersService.create(userData);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return {
        message: 'Đăng ký thành công',
        user: userWithoutPassword as User
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Có lỗi xảy ra khi tạo tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    try {
    const user = await this.usersService.update(+id, userData);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Có lỗi xảy ra khi cập nhật tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string, 
    @Body() body: { 
      password: string; 
      adminId: number; 
      adminRoleId: number; 
    }
  ): Promise<{ message: string }> {
    try {
      const targetUserId = +id;
      const { password, adminId, adminRoleId } = body;

      // Validate input
      if (!password || password.length < 6) {
        throw new HttpException('Mật khẩu phải có ít nhất 6 ký tự', HttpStatus.BAD_REQUEST);
      }

      // Find target user
      const targetUser = await this.usersService.findOne(targetUserId);
      if (!targetUser) {
        throw new HttpException('Không tìm thấy người dùng', HttpStatus.NOT_FOUND);
      }

      // Find admin user
      const adminUser = await this.usersService.findOne(adminId);
      if (!adminUser || adminUser.role_id !== 1) {
        throw new HttpException('Không có quyền thực hiện thao tác này', HttpStatus.FORBIDDEN);
      }

      // Check permission logic
      const canChangePassword = this.checkPasswordChangePermission(adminUser, targetUser);
      if (!canChangePassword) {
        throw new HttpException(
          'Bạn không có quyền đổi mật khẩu của người dùng này', 
          HttpStatus.FORBIDDEN
        );
      }

      // Hash and update password
      const hashedPassword = await this.usersService.hashPassword(password);
      await this.usersService.updatePassword(targetUserId, hashedPassword);

      return { message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Có lỗi xảy ra khi đổi mật khẩu',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private checkPasswordChangePermission(adminUser: User, targetUser: User): boolean {
    // Admin can change password of regular users (role_id = 2)
    if (adminUser.role_id === 1 && targetUser.role_id === 2) {
      return true;
    }
    
    // Admin can only change their own password
    if (adminUser.role_id === 1 && targetUser.role_id === 1) {
      return adminUser.id === targetUser.id;
    }
    
    return false;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
    await this.usersService.remove(+id);
    return { message: 'User deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Có lỗi xảy ra khi xóa tài khoản',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('count/total')
  async count(): Promise<{ count: number }> {
    const count = await this.usersService.count();
    return { count };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    try {
      // Tìm user theo username
      const user = await this.usersService.findByUsername(loginDto.username);
      if (!user) {
        throw new HttpException('Tên đăng nhập hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
      }

      // Kiểm tra mật khẩu bằng bcrypt
      const isPasswordValid = await this.usersService.verifyPassword(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Tên đăng nhập hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
      }

      // Tạo access token đơn giản
      const access_token = `token_${user.id}_${Date.now()}`;

      // Trả về thông tin user đơn giản
      return {
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role_id: user.role_id,
          birthday: user.birthday ? user.birthday.toString().split('T')[0] : '',
          createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
        }
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Có lỗi xảy ra trong quá trình đăng nhập', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('test-login')
  async testLogin(@Body() loginDto: LoginDto): Promise<any> {
    try {
      console.log('=== TEST LOGIN START ===');
      console.log('Username:', loginDto.username);
      console.log('Password:', loginDto.password);
      
      // Test 1: Tìm user
      const user = await this.usersService.findByUsername(loginDto.username);
      console.log('User found:', !!user);
      
      if (!user) {
        return { error: 'User not found', username: loginDto.username };
      }
      
      console.log('User data:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
      
      // Test 2: Kiểm tra password
      try {
        const isValid = await this.usersService.verifyPassword(loginDto.password, user.password);
        console.log('Password check result:', isValid);
        
        return {
          success: true,
          userFound: true,
          passwordValid: isValid,
          userData: {
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
          }
        };
      } catch (passwordError) {
        console.error('Password verification error:', passwordError);
        return {
          error: 'Password verification failed',
          details: passwordError.message
        };
      }
      
    } catch (error) {
      console.error('Test login error:', error);
      return {
        error: 'Test failed',
        details: error.message,
        stack: error.stack
      };
    }
  }

  @Post('simple-login')
  async simpleLogin(@Body() loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByUsername(loginDto.username);
      if (!user) {
        return { error: 'User not found' };
      }

      const isValid = await this.usersService.verifyPassword(loginDto.password, user.password);
      return {
        success: isValid,
        user: isValid ? { id: user.id, username: user.username, role_id: user.role_id } : null
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { username: string; newPassword: string }) {
    try {
      const user = await this.usersService.findByUsername(body.username);
      if (!user) {
        throw new HttpException('User không tồn tại', HttpStatus.NOT_FOUND);
      }

      // Hash mật khẩu mới
      const hashedPassword = await this.usersService.hashPassword(body.newPassword);
      
      // Cập nhật mật khẩu
      await this.usersService.updatePassword(user.id, hashedPassword);

      return { message: 'Mật khẩu đã được cập nhật thành công' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Có lỗi xảy ra', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 