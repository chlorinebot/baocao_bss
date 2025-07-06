import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ServersService, CreateServerDto, UpdateServerDto } from './servers.service';
import { Server } from '../entities/server.entity';

@Controller('servers')
export class ServersController {
  private readonly logger = new Logger(ServersController.name);
  
  constructor(private readonly serversService: ServersService) {}

  // GET /servers - Lấy tất cả máy chủ
  @Get()
  async findAll(): Promise<Server[]> {
    this.logger.log('🔄 Getting all servers...');
    return await this.serversService.findAll();
  }

  // GET /servers/count/total - Đếm tổng số máy chủ
  @Get('count/total')
  async count(): Promise<{ count: number }> {
    const count = await this.serversService.count();
    return { count };
  }

  // GET /servers/:id - Lấy máy chủ theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Server> {
    this.logger.log(`🔍 Getting server with ID: ${id}`);
    return await this.serversService.findOne(id);
  }

  // POST /servers - Tạo máy chủ mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServerDto: CreateServerDto): Promise<Server> {
    this.logger.log(`📝 Creating new server: ${JSON.stringify(createServerDto)}`);
    try {
      const result = await this.serversService.create(createServerDto);
      this.logger.log(`✅ Server created successfully with ID: ${result.id}`);
      
      // Đảm bảo ID không phải undefined hoặc null
      if (result.id === undefined || result.id === null) {
        this.logger.error('❌ Server created but ID is undefined or null');
        throw new Error('Server created but ID is undefined or null');
      }
      
      // Đảm bảo ID là số và không phải 0
      if (typeof result.id !== 'number' || result.id === 0) {
        this.logger.error(`❌ Invalid server ID: ${result.id}`);
        
        // Thử lấy lại server từ database
        const servers = await this.serversService.findAll();
        const createdServer = servers.find(s => 
          s.server_name === createServerDto.server_name && 
          s.ip === createServerDto.ip
        );
        
        if (createdServer && createdServer.id) {
          this.logger.log(`✅ Found server with correct ID: ${createdServer.id}`);
          return createdServer;
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create server: ${error.message}`);
      throw error;
    }
  }

  // PUT /servers/:id - Cập nhật máy chủ
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServerDto: UpdateServerDto,
  ): Promise<Server> {
    this.logger.log(`📝 Updating server with ID: ${id}`);
    return await this.serversService.update(id, updateServerDto);
  }

  // DELETE /servers/:id - Xóa máy chủ
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🗑️ Deleting server with ID: ${id}`);
    return await this.serversService.remove(id);
  }
} 