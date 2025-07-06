import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from '../entities/server.entity';

export interface CreateServerDto {
  server_name: string;
  ip: string;
}

export interface UpdateServerDto {
  server_name?: string;
  ip?: string;
}

@Injectable()
export class ServersService implements OnModuleInit {
  constructor(
    @InjectRepository(Server)
    private readonly serverRepository: Repository<Server>,
  ) {}

  // Khởi tạo khi module được load
  async onModuleInit() {
    await this.fixAutoIncrement();
  }

  // Sửa lỗi auto increment
  private async fixAutoIncrement() {
    try {
      // Kiểm tra xem có server nào với ID = 0 không
      const serverWithZeroId = await this.serverRepository.findOne({
        where: { id: 0 }
      });

      if (serverWithZeroId) {
        console.log('Found server with ID = 0, fixing auto increment...');
        
        // Xóa server có ID = 0
        await this.serverRepository.delete({ id: 0 });
        
        // Reset auto increment về 1
        await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
        
        // Tạo lại server với ID tự động tăng
        const newServer = this.serverRepository.create({
          server_name: serverWithZeroId.server_name,
          ip: serverWithZeroId.ip
        });
        
        await this.serverRepository.save(newServer);
        console.log('Auto increment fixed successfully!');
      } else {
        // Đảm bảo auto increment được set đúng
        await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
      }
    } catch (error) {
      console.error('Error fixing auto increment:', error);
    }
  }

  // Lấy tất cả máy chủ
  async findAll(): Promise<Server[]> {
    try {
      return await this.serverRepository.find({
        order: { id: 'ASC' }
      });
    } catch (error) {
      throw new BadRequestException('Lỗi khi tải danh sách máy chủ');
    }
  }

  // Lấy máy chủ theo ID
  async findOne(id: number): Promise<Server> {
    try {
      const server = await this.serverRepository.findOne({
        where: { id }
      });
      
      if (!server) {
        throw new NotFoundException(`Không tìm thấy máy chủ với ID ${id}`);
      }
      
      return server;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi tìm máy chủ');
    }
  }

  // Tạo máy chủ mới
  async create(createServerDto: CreateServerDto): Promise<Server> {
    try {
      console.log('📥 Nhận request tạo server mới:', createServerDto);
      
      // Kiểm tra dữ liệu đầu vào
      if (!createServerDto.server_name || !createServerDto.ip) {
        console.error('❌ Thiếu thông tin server_name hoặc ip');
        throw new BadRequestException('Tên máy chủ và địa chỉ IP là bắt buộc');
      }

      // Kiểm tra xem tên máy chủ đã tồn tại chưa
      const existingServerByName = await this.serverRepository.findOne({
        where: { server_name: createServerDto.server_name }
      });
      
      if (existingServerByName) {
        console.error('❌ Tên máy chủ đã tồn tại:', createServerDto.server_name);
        throw new BadRequestException('Tên máy chủ đã tồn tại');
      }

      // Kiểm tra xem IP đã tồn tại chưa
      const existingServerByIP = await this.serverRepository.findOne({
        where: { ip: createServerDto.ip }
      });
      
      if (existingServerByIP) {
        console.error('❌ Địa chỉ IP đã tồn tại:', createServerDto.ip);
        throw new BadRequestException('Địa chỉ IP đã tồn tại');
      }

      // Validate IP format
      if (!this.isValidIP(createServerDto.ip)) {
        console.error('❌ Địa chỉ IP không hợp lệ:', createServerDto.ip);
        throw new BadRequestException('Địa chỉ IP không hợp lệ');
      }

      // Đảm bảo auto increment được set đúng
      await this.serverRepository.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');

      // Tạo server mới trực tiếp qua SQL để đảm bảo ID được tạo đúng
      const result = await this.serverRepository.query(
        'INSERT INTO nemsm (server_name, ip) VALUES (?, ?)',
        [createServerDto.server_name, createServerDto.ip]
      );
      
      // Lấy ID của server vừa tạo
      const insertId = result.insertId;
      console.log('✅ Server đã được tạo với ID:', insertId);
      
      // Lấy thông tin đầy đủ của server vừa tạo
      const newServer = await this.serverRepository.findOne({
        where: { id: insertId }
      });
      
      if (!newServer) {
        throw new Error(`Không thể tìm thấy server vừa tạo với ID ${insertId}`);
      }
      
      console.log('✅ Thông tin đầy đủ của server vừa tạo:', newServer);
      return newServer;
    } catch (error) {
      console.error('❌ Lỗi khi tạo máy chủ mới:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi tạo máy chủ mới: ' + (error.message || 'Lỗi không xác định'));
    }
  }

  // Cập nhật máy chủ
  async update(id: number, updateServerDto: UpdateServerDto): Promise<Server> {
    try {
      const server = await this.findOne(id);
      
      // Kiểm tra tên máy chủ trùng lặp (nếu có thay đổi)
      if (updateServerDto.server_name && updateServerDto.server_name !== server.server_name) {
        const existingServerByName = await this.serverRepository.findOne({
          where: { server_name: updateServerDto.server_name }
        });
        
        if (existingServerByName) {
          throw new BadRequestException('Tên máy chủ đã tồn tại');
        }
      }

      // Kiểm tra IP trùng lặp (nếu có thay đổi)
      if (updateServerDto.ip && updateServerDto.ip !== server.ip) {
        const existingServerByIP = await this.serverRepository.findOne({
          where: { ip: updateServerDto.ip }
        });
        
        if (existingServerByIP) {
          throw new BadRequestException('Địa chỉ IP đã tồn tại');
        }

        // Validate IP format
        if (!this.isValidIP(updateServerDto.ip)) {
          throw new BadRequestException('Địa chỉ IP không hợp lệ');
        }
      }

      // Cập nhật các trường
      Object.assign(server, updateServerDto);
      return await this.serverRepository.save(server);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi cập nhật máy chủ');
    }
  }

  // Xóa máy chủ
  async remove(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const server = await this.findOne(id);
      
      await this.serverRepository.remove(server);
      
      return {
        success: true,
        message: 'Xóa máy chủ thành công'
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Lỗi khi xóa máy chủ');
    }
  }

  // Đếm tổng số máy chủ
  async count(): Promise<number> {
    try {
      return await this.serverRepository.count();
    } catch (error) {
      throw new BadRequestException('Lỗi khi đếm máy chủ');
    }
  }

  // Validate IP address format
  private isValidIP(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }
} 