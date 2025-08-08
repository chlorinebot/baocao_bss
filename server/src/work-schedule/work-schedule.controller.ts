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

  // Lấy vai trò nhân viên hiện tại (A, B, C, D)
  @Get('roles')
  async getEmployeeRoles() {
    try {
      const roles = await this.workScheduleService.getEmployeeRoles();
      return {
        success: true,
        message: 'Lấy vai trò nhân viên thành công',
        data: roles
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy vai trò nhân viên',
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

  // Lấy vai trò phân công của user
  @Get('user/:userId/role')
  async getUserRole(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const userRole = await this.workScheduleService.getUserRole(userId);
      return {
        success: true,
        message: 'Lấy vai trò phân công thành công',
        data: userRole
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy vai trò phân công',
        error: error.message
      };
    }
  }

  // Lấy thông tin ca trực hiện tại của user
  @Get('user/:userId/current-shift')
  async getUserCurrentShift(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const shiftInfo = await this.workScheduleService.getUserCurrentShift(userId);
      return {
        success: true,
        message: 'Lấy thông tin ca trực thành công',
        data: shiftInfo
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thông tin ca trực',
        error: error.message
      };
    }
  }

  // DEBUG: Xóa tất cả work_schedule
  @Delete('debug/clear-all')
  async clearAllWorkSchedules() {
    try {
      console.log('🗑️ DEBUG: Xóa tất cả work_schedule');
      await this.workScheduleService.clearAllWorkSchedules();
      return {
        success: true,
        message: 'Đã xóa tất cả work_schedule'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi xóa work_schedule',
        error: error.message
      };
    }
  }

  // DEBUG: Kiểm tra database
  @Get('debug/check-db')
  async debugCheckDatabase() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const schedules = await this.workScheduleService.findAll();
      const todaySchedule = await this.workScheduleService.findByDate(today.toISOString().split('T')[0]);
      
      return {
        success: true,
        data: {
          today: today.toISOString().split('T')[0],
          totalSchedules: schedules.length,
          todaySchedules: todaySchedule.length,
          allSchedules: schedules,
          todayScheduleDetail: todaySchedule
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('debug/create-yesterday-schedule')
  async createYesterdaySchedule() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const createData = {
        employee_a: 5,
        employee_b: 7,
        employee_c: 4,
        employee_d: 8,
        activation_date: yesterday
      };
      
      const newSchedule = await this.workScheduleService.create(createData);
      
      return {
        success: true,
        message: `Đã tạo schedule cho ngày ${yesterday.toISOString().split('T')[0]}`,
        data: newSchedule
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy thống kê phân công theo tuần/tháng
  @Get('stats')
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

  // Lấy phân công theo ID - đặt cuối cùng để tránh conflict
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
} 