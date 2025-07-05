import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { WorkScheduleService, CreateWorkScheduleDto, UpdateWorkScheduleDto } from './work-schedule.service';

@Controller('work-schedule')
export class WorkScheduleController {
  constructor(private readonly workScheduleService: WorkScheduleService) {}

  // Lấy tất cả phân công
  @Get()
  async findAll() {
    try {
      const schedules = await this.workScheduleService.findAll();
      return {
        success: true,
        message: 'Lấy danh sách phân công thành công',
        data: schedules
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách phân công',
        error: error.message
      };
    }
  }

  // Lấy phân công theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const schedule = await this.workScheduleService.findOne(id);
      return {
        success: true,
        message: 'Lấy thông tin phân công thành công',
        data: schedule
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thông tin phân công',
        error: error.message
      };
    }
  }

  // Lấy phân công theo ngày
  @Get('date/:date')
  async findByDate(@Param('date') date: string) {
    try {
      const schedules = await this.workScheduleService.findByDate(date);
      return {
        success: true,
        message: 'Lấy phân công theo ngày thành công',
        data: schedules
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy phân công theo ngày',
        error: error.message
      };
    }
  }

  // Lấy danh sách nhân viên có thể được phân công
  @Get('employees/available')
  async getAvailableEmployees() {
    try {
      const employees = await this.workScheduleService.getAvailableEmployees();
      return {
        success: true,
        message: 'Lấy danh sách nhân viên thành công',
        data: employees
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách nhân viên',
        error: error.message
      };
    }
  }

  // Tạo phân công mới (chỉ admin)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createWorkScheduleDto: CreateWorkScheduleDto) {
    try {
      const schedule = await this.workScheduleService.create(createWorkScheduleDto);
      return {
        success: true,
        message: 'Tạo phân công thành công',
        data: schedule
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi tạo phân công',
        error: error.message
      };
    }
  }

  // Cập nhật phân công
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkScheduleDto: UpdateWorkScheduleDto
  ) {
    try {
      const schedule = await this.workScheduleService.update(id, updateWorkScheduleDto);
      return {
        success: true,
        message: 'Cập nhật phân công thành công',
        data: schedule
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi cập nhật phân công',
        error: error.message
      };
    }
  }

  // Xóa phân công
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.workScheduleService.remove(id);
      return {
        success: true,
        message: 'Xóa phân công thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi xóa phân công',
        error: error.message
      };
    }
  }

  // Thống kê phân công
  @Get('stats/report')
  async getScheduleStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      const stats = await this.workScheduleService.getScheduleStats(startDate, endDate);
      return {
        success: true,
        message: 'Lấy thống kê phân công thành công',
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thống kê phân công',
        error: error.message
      };
    }
  }
} 