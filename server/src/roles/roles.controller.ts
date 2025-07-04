import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<Role[]> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Role> {
    const role = await this.rolesService.findOne(+id);
    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }
    return role;
  }

  @Post()
  async create(@Body() roleData: Partial<Role>): Promise<{ message: string; role: Role }> {
    try {
      const role = await this.rolesService.create(roleData);
      return {
        message: 'Role created successfully',
        role
      };
    } catch (error) {
      throw new HttpException(
        'Có lỗi xảy ra khi tạo role',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('init')
  async initDefaultRoles(): Promise<{ message: string }> {
    try {
      await this.rolesService.createDefaultRoles();
      return { message: 'Default roles created successfully' };
    } catch (error) {
      throw new HttpException(
        'Có lỗi xảy ra khi tạo default roles',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 