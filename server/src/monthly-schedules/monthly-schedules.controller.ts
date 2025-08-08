import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MonthlySchedulesService } from './monthly-schedules.service';

@Controller('monthly-schedules')
export class MonthlySchedulesController {
  constructor(private readonly monthlySchedulesService: MonthlySchedulesService) {}

  // GET /monthly-schedules - Lấy tất cả phân công hàng tháng
  @Get()
  async getAllMonthlySchedules() {
    console.log('🎯 [MonthlySchedulesController] GET /monthly-schedules called');
    try {
      const result = await this.monthlySchedulesService.getAllMonthlySchedules();
      console.log('✅ [MonthlySchedulesController] getAllMonthlySchedules result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error in getAllMonthlySchedules:', error);
      return { success: false, error: error.message };
    }
  }

  // GET /monthly-schedules/:year/:month - Lấy phân công theo tháng/năm
  @Get(':year/:month')
  async getMonthlySchedule(@Param('year') year: number, @Param('month') month: number) {
    console.log(`🎯 [MonthlySchedulesController] GET /monthly-schedules/${year}/${month} called`);
    try {
      const result = await this.monthlySchedulesService.getMonthlySchedule(month, year);
      console.log('✅ [MonthlySchedulesController] getMonthlySchedule result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error in getMonthlySchedule:', error);
      return { success: false, error: error.message };
    }
  }

  // POST /monthly-schedules - Tạo phân công hàng tháng mới
  @Post()
  async createMonthlySchedule(@Body() createData: { month: number; year: number; created_by: number }) {
    console.log('🎯 [MonthlySchedulesController] POST /monthly-schedules called');
    console.log('📋 [MonthlySchedulesController] Create data:', createData);
    try {
      const result = await this.monthlySchedulesService.createMonthlySchedule(
        createData.month,
        createData.year,
        createData.created_by
      );
      console.log('✅ [MonthlySchedulesController] createMonthlySchedule result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error in createMonthlySchedule:', error);
      return { success: false, error: error.message };
    }
  }

  // POST /monthly-schedules/auto-generate - Tạo phân công tự động
  @Post('auto-generate')
  async generateAutoSchedule(@Body() generateData: { month: number; year: number; created_by: number; starting_role?: string }) {
    console.log('🎯 [MonthlySchedulesController] POST /monthly-schedules/auto-generate called');
    console.log('📋 [MonthlySchedulesController] Generate data:', generateData);
    
    try {
      console.log('🔄 [MonthlySchedulesController] Calling service generateAutoSchedule...');
      const result = await this.monthlySchedulesService.generateAutoSchedule(
        generateData.month,
        generateData.year,
        generateData.created_by,
        generateData.starting_role || 'A'
      );
      
      console.log('✅ [MonthlySchedulesController] Service returned result:', result);
      
      // Service đã trả về format { success, message, data }, không cần wrap thêm
      return result;
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Exception in generateAutoSchedule:', error);
      console.error('❌ [MonthlySchedulesController] Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  }

  // PUT /monthly-schedules/:id - Cập nhật phân công hàng tháng
  @Put(':id')
  async updateMonthlySchedule(
    @Param('id') id: number,
    @Body() updateData: { schedule_data: any[]; updated_by?: number }
  ) {
    console.log(`🎯 [MonthlySchedulesController] PUT /monthly-schedules/${id} called`);
    console.log('📋 [MonthlySchedulesController] Update data:', updateData);
    try {
      const result = await this.monthlySchedulesService.updateMonthlySchedule(
        id,
        JSON.stringify(updateData.schedule_data),
        updateData.updated_by || 1
      );
      console.log('✅ [MonthlySchedulesController] updateMonthlySchedule result:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error in updateMonthlySchedule:', error);
      return { success: false, error: error.message };
    }
  }

  // DELETE /monthly-schedules/:id - Xóa phân công hàng tháng
  @Delete(':id')
  async deleteMonthlySchedule(@Param('id') id: number) {
    console.log(`🎯 [MonthlySchedulesController] DELETE /monthly-schedules/${id} called`);
    try {
      const result = await this.monthlySchedulesService.deleteMonthlySchedule(id);
      console.log('✅ [MonthlySchedulesController] deleteMonthlySchedule result:', result);
      return { success: true, message: 'Xóa phân công hàng tháng thành công' };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error in deleteMonthlySchedule:', error);
      return { success: false, error: error.message };
    }
  }

  // DEBUG: Tạo dữ liệu test cho tháng 8/2025
  @Post('debug/create-test-data')
  async createTestData() {
    console.log('🧪 [MonthlySchedulesController] DEBUG: Tạo dữ liệu test cho tháng 8/2025');
    try {
      await this.monthlySchedulesService.createTestData();
      return { success: true, message: 'Đã tạo dữ liệu test cho monthly_work_schedules tháng 8/2025' };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error creating test data:', error);
      return { success: false, error: error.message };
    }
  }

  // DEBUG: Xóa tất cả monthly_work_schedules
  @Delete('debug/clear-all')
  async clearAllMonthlySchedules() {
    console.log('🗑️ [MonthlySchedulesController] DEBUG: Xóa tất cả monthly_work_schedules');
    try {
      await this.monthlySchedulesService.clearAllMonthlySchedules();
      return { success: true, message: 'Đã xóa tất cả monthly_work_schedules' };
    } catch (error) {
      console.error('❌ [MonthlySchedulesController] Error clearing all:', error);
      return { success: false, error: error.message };
    }
  }
} 