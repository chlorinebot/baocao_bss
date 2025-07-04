import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles/roles.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    // Tự động tạo các roles mặc định khi ứng dụng khởi động
    try {
      await this.rolesService.createDefaultRoles();
      console.log('✅ Default roles created successfully');
    } catch (error) {
      console.error('❌ Error creating default roles:', error.message);
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
