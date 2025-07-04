import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

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
} 