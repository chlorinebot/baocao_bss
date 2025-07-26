import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MonthlySchedulesService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // Lấy tất cả phân công hàng tháng
  async getAllMonthlySchedules(): Promise<any[]> {
    console.log('🔍 [MonthlySchedulesService] getAllMonthlySchedules called');
    try {
      const query = 'CALL GetAllMonthlySchedules()';
      console.log('📝 [MonthlySchedulesService] Executing query:', query);
      const result = await this.dataSource.query(query);
      console.log('✅ [MonthlySchedulesService] Query result:', result);
      return result[0] || [];
    } catch (error) {
      console.error('❌ [MonthlySchedulesService] Error in getAllMonthlySchedules:', error);
      throw error;
    }
  }

  // Lấy phân công theo tháng/năm - VIẾT LẠI HOÀN TOÀN
  async getMonthlySchedule(month: number, year: number): Promise<any> {
    console.log('🔍 =================================');
    console.log('🔍 [MonthlySchedulesService] BẮT ĐẦU getMonthlySchedule');
    console.log(`🔍 [MonthlySchedulesService] Input params: month=${month}, year=${year}`);
    console.log('🔍 =================================');
    
    try {
      // Query trực tiếp
      const query = `
        SELECT id, month, year, schedule_data, created_at, updated_at, created_by
        FROM monthly_work_schedules 
        WHERE month = ? AND year = ?
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      console.log('📝 [MonthlySchedulesService] Executing query...');
      const result = await this.dataSource.query(query, [month, year]);
      console.log('✅ [MonthlySchedulesService] Raw result:', JSON.stringify(result, null, 2));

      if (!result || !Array.isArray(result) || result.length === 0) {
        console.log('ℹ️ [MonthlySchedulesService] NO DATA FOUND');
        return null;
      }

      const scheduleData = result[0];
      console.log('📊 [MonthlySchedulesService] Raw schedule data:', JSON.stringify(scheduleData, null, 2));

      if (!scheduleData) {
        console.error('❌ [MonthlySchedulesService] SCHEDULE DATA IS NULL');
        return null;
      }

      // Debug schedule_data field chi tiết
      console.log('🔍 [MonthlySchedulesService] ===== DEBUG schedule_data =====');
      console.log('🔍 [MonthlySchedulesService] Raw schedule_data:', scheduleData.schedule_data);
      console.log('🔍 [MonthlySchedulesService] Type:', typeof scheduleData.schedule_data);
      console.log('🔍 [MonthlySchedulesService] Length:', scheduleData.schedule_data?.length);
      console.log('🔍 [MonthlySchedulesService] Is null:', scheduleData.schedule_data === null);
      console.log('🔍 [MonthlySchedulesService] Is undefined:', scheduleData.schedule_data === undefined);
      console.log('🔍 [MonthlySchedulesService] First 200 chars:', scheduleData.schedule_data?.substring(0, 200));

      // Parse JSON nếu là string - SỬA ĐIỀU KIỆN
      if (scheduleData.schedule_data !== null && scheduleData.schedule_data !== undefined) {
        if (typeof scheduleData.schedule_data === 'string') {
          try {
            console.log('🔧 [MonthlySchedulesService] PARSING JSON STRING...');
            const parsedData = JSON.parse(scheduleData.schedule_data);
            scheduleData.schedule_data = parsedData;
            
            console.log('✅ [MonthlySchedulesService] JSON PARSED SUCCESSFULLY!');
            console.log('✅ [MonthlySchedulesService] Parsed type:', typeof parsedData);
            console.log('✅ [MonthlySchedulesService] Is array:', Array.isArray(parsedData));
            console.log('✅ [MonthlySchedulesService] Array length:', parsedData?.length);
            console.log('✅ [MonthlySchedulesService] First item:', JSON.stringify(parsedData[0]));
            
          } catch (parseError) {
            console.error('❌ [MonthlySchedulesService] JSON PARSE FAILED:', parseError);
            console.error('❌ [MonthlySchedulesService] Failed string:', scheduleData.schedule_data);
            scheduleData.schedule_data = [];
          }
        } else if (Array.isArray(scheduleData.schedule_data)) {
          console.log('✅ [MonthlySchedulesService] Already an array, length:', scheduleData.schedule_data.length);
        } else {
          console.error('❌ [MonthlySchedulesService] schedule_data is not string or array, setting empty array');
          scheduleData.schedule_data = [];
        }
      } else {
        console.error('❌ [MonthlySchedulesService] schedule_data is null/undefined, setting empty array');
        scheduleData.schedule_data = [];
      }

      console.log('🎯 [MonthlySchedulesService] FINAL RESULT:');
      console.log('🎯 [MonthlySchedulesService] ID:', scheduleData.id);
      console.log('🎯 [MonthlySchedulesService] Month/Year:', scheduleData.month + '/' + scheduleData.year);
      console.log('🎯 [MonthlySchedulesService] schedule_data type:', typeof scheduleData.schedule_data);
      console.log('🎯 [MonthlySchedulesService] schedule_data length:', scheduleData.schedule_data?.length);
      console.log('🎯 [MonthlySchedulesService] schedule_data content:', JSON.stringify(scheduleData.schedule_data));
      
      console.log('🔍 =================================');
      console.log('🔍 [MonthlySchedulesService] SUCCESS - RETURNING DATA');
      console.log('🔍 =================================');
      
      return scheduleData;
      
    } catch (error) {
      console.error('🔍 =================================');
      console.error('❌ [MonthlySchedulesService] ERROR in getMonthlySchedule');
      console.error('❌ [MonthlySchedulesService] Error:', error);
      console.error('🔍 =================================');
      throw error;
    }
  }

  // Tạo phân công hàng tháng từ vai trò A,B,C,D
  async createMonthlySchedule(month: number, year: number, createdBy: number): Promise<any> {
    console.log(`🔍 [MonthlySchedulesService] createMonthlySchedule called with month=${month}, year=${year}, createdBy=${createdBy}`);
    return this.generateAutoSchedule(month, year, createdBy);
  }

  // Tạo phân công tự động từ vai trò A,B,C,D
  async generateAutoSchedule(
    month: number,
    year: number,
    createdBy: number,
    startingRole?: string
  ) {
    console.log(`🔍 [MonthlySchedulesService] generateAutoSchedule called`);
    console.log(`📋 [MonthlySchedulesService] Parameters:`, { month, year, createdBy, startingRole });
    
    try {
      // Set default starting role if not provided
      const actualStartingRole = startingRole || 'A';
      console.log(`📌 [MonthlySchedulesService] Using starting role: ${actualStartingRole}`);
      
      // Test database connection first
      console.log('🔗 [MonthlySchedulesService] Testing database connection...');
      const connectionTest = await this.dataSource.query('SELECT 1 as test');
      console.log('✅ [MonthlySchedulesService] Database connection test:', connectionTest);
      
      // Check if procedure exists
      console.log('🔍 [MonthlySchedulesService] Checking if GenerateMonthlyScheduleFromRoles procedure exists...');
      const procedureCheck = await this.dataSource.query(
        "SHOW PROCEDURE STATUS WHERE Name = 'GenerateMonthlyScheduleFromRoles'"
      );
      console.log('📋 [MonthlySchedulesService] Procedure check result:', procedureCheck);
      
      if (!procedureCheck || procedureCheck.length === 0) {
        console.error('❌ [MonthlySchedulesService] Stored procedure GenerateMonthlyScheduleFromRoles not found!');
        return {
          success: false,
          error: 'Stored procedure GenerateMonthlyScheduleFromRoles không tồn tại. Vui lòng chạy SQL script để tạo procedure.'
        };
      }
      
      // Call the stored procedure
      console.log('📞 [MonthlySchedulesService] Calling stored procedure GenerateMonthlyScheduleFromRoles...');
      const query = 'CALL GenerateMonthlyScheduleFromRoles(?, ?, ?, ?)';
      const params = [month, year, createdBy, actualStartingRole];
      console.log('📝 [MonthlySchedulesService] Query:', query);
      console.log('📝 [MonthlySchedulesService] Params:', params);
      
      const result = await this.dataSource.query(query, params);
      console.log('✅ [MonthlySchedulesService] Stored procedure result:', JSON.stringify(result, null, 2));

      if (result && result[0] && result[0][0]) {
        const response = result[0][0];
        console.log('📊 [MonthlySchedulesService] Procedure response:', response);
        
        if (response.status === 'success') {
          console.log('🎉 [MonthlySchedulesService] Procedure returned success! Schedule ID:', response.schedule_id);
          
          // Lấy schedule data thực tế thay vì chỉ metadata
          console.log('📋 [MonthlySchedulesService] Fetching actual schedule data...');
          const scheduleData = await this.getScheduleById(response.schedule_id);
          console.log('📊 [MonthlySchedulesService] Retrieved schedule data:', scheduleData);
          
          return {
            success: true,
            message: response.message,
            data: scheduleData
          };
        } else {
          console.error('❌ [MonthlySchedulesService] Procedure returned error status:', response);
          return {
            success: false,
            error: response.message || 'Stored procedure returned error status'
          };
        }
      } else {
        console.error('❌ [MonthlySchedulesService] Invalid procedure result structure:', result);
        return {
          success: false,
          error: 'Không nhận được kết quả hợp lệ từ stored procedure'
        };
      }
    } catch (error) {
      console.error('❌ [MonthlySchedulesService] Exception in generateAutoSchedule:', error);
      console.error('❌ [MonthlySchedulesService] Error stack:', error.stack);
      return {
        success: false,
        error: error.message || 'Lỗi khi tạo phân công tự động'
      };
    }
  }

  // Cập nhật phân công hàng tháng
  async updateMonthlySchedule(id: number, scheduleData: string, updatedBy: number): Promise<any> {
    console.log(`🔍 [MonthlySchedulesService] updateMonthlySchedule called with id=${id}, updatedBy=${updatedBy}`);
    try {
      const query = 'CALL UpdateMonthlySchedule(?, ?, ?)';
      console.log('📝 [MonthlySchedulesService] Executing query:', query, 'with params:', [id, scheduleData.substring(0, 100) + '...', updatedBy]);
      const result = await this.dataSource.query(query, [id, scheduleData, updatedBy]);
      console.log('✅ [MonthlySchedulesService] Update result:', result);
      
      if (result[0] && result[0][0]) {
        return this.getScheduleById(id);
      }
      
      throw new Error('Không thể cập nhật phân công');
    } catch (error) {
      console.error('❌ [MonthlySchedulesService] Error in updateMonthlySchedule:', error);
      throw error;
    }
  }

  // Xóa phân công hàng tháng
  async deleteMonthlySchedule(id: number, deletedBy: number): Promise<{ message: string }> {
    console.log(`🔍 [MonthlySchedulesService] deleteMonthlySchedule called with id=${id}, deletedBy=${deletedBy}`);
    try {
      const query = 'CALL DeleteMonthlySchedule(?, ?)';
      console.log('📝 [MonthlySchedulesService] Executing query:', query, 'with params:', [id, deletedBy]);
      const result = await this.dataSource.query(query, [id, deletedBy]);
      console.log('✅ [MonthlySchedulesService] Delete result:', result);
      
      if (result[0] && result[0][0]) {
        return { message: result[0][0].message };
      }
      
      throw new Error('Không thể xóa phân công');
    } catch (error) {
      console.error('❌ [MonthlySchedulesService] Error in deleteMonthlySchedule:', error);
      throw error;
    }
  }

  // Lấy schedule theo ID (helper method)
  async getScheduleById(id: number): Promise<any> {
    console.log(`🔍 [MonthlySchedulesService] getScheduleById called with id=${id}`);
    try {
      const query = 'SELECT * FROM monthly_work_schedules WHERE id = ?';
      console.log('📝 [MonthlySchedulesService] Executing query:', query, 'with params:', [id]);
      const result = await this.dataSource.query(query, [id]);
      console.log('✅ [MonthlySchedulesService] getScheduleById raw result:', JSON.stringify(result, null, 2));
      
      if (!result || result.length === 0) {
        console.error('❌ [MonthlySchedulesService] No data found for ID:', id);
        return null;
      }
      
      const scheduleData = result[0];
      console.log('📊 [MonthlySchedulesService] Raw schedule data:', JSON.stringify(scheduleData, null, 2));
      
      if (!scheduleData) {
        console.error('❌ [MonthlySchedulesService] SCHEDULE DATA IS NULL');
        return null;
      }
      
      // Debug schedule_data field chi tiết
      console.log('🔍 [MonthlySchedulesService] ===== DEBUG schedule_data =====');
      console.log('🔍 [MonthlySchedulesService] Raw schedule_data:', scheduleData.schedule_data);
      console.log('🔍 [MonthlySchedulesService] Type:', typeof scheduleData.schedule_data);
      console.log('🔍 [MonthlySchedulesService] Is null:', scheduleData.schedule_data === null);
      console.log('🔍 [MonthlySchedulesService] Is undefined:', scheduleData.schedule_data === undefined);
      
      // Parse JSON nếu là string
      if (scheduleData.schedule_data !== null && scheduleData.schedule_data !== undefined) {
        if (typeof scheduleData.schedule_data === 'string') {
          try {
            console.log('🔧 [MonthlySchedulesService] PARSING JSON STRING...');
            const parsedData = JSON.parse(scheduleData.schedule_data);
            scheduleData.schedule_data = parsedData;
            
            console.log('✅ [MonthlySchedulesService] JSON PARSED SUCCESSFULLY!');
            console.log('✅ [MonthlySchedulesService] Parsed type:', typeof parsedData);
            console.log('✅ [MonthlySchedulesService] Is array:', Array.isArray(parsedData));
            console.log('✅ [MonthlySchedulesService] Array length:', parsedData?.length);
            console.log('✅ [MonthlySchedulesService] First item:', JSON.stringify(parsedData[0]));
          } catch (parseError) {
            console.error('❌ [MonthlySchedulesService] JSON PARSE FAILED:', parseError);
            console.error('❌ [MonthlySchedulesService] Failed string:', scheduleData.schedule_data);
            scheduleData.schedule_data = [];
          }
        } else if (Array.isArray(scheduleData.schedule_data)) {
          console.log('✅ [MonthlySchedulesService] Already an array, length:', scheduleData.schedule_data.length);
        } else {
          console.error('❌ [MonthlySchedulesService] schedule_data is not string or array, setting empty array');
          scheduleData.schedule_data = [];
        }
      } else {
        console.error('❌ [MonthlySchedulesService] schedule_data is null/undefined, setting empty array');
        scheduleData.schedule_data = [];
      }
      
      console.log('🎯 [MonthlySchedulesService] FINAL RESULT:');
      console.log('🎯 [MonthlySchedulesService] ID:', scheduleData.id);
      console.log('🎯 [MonthlySchedulesService] Month/Year:', scheduleData.month + '/' + scheduleData.year);
      console.log('🎯 [MonthlySchedulesService] schedule_data type:', typeof scheduleData.schedule_data);
      console.log('🎯 [MonthlySchedulesService] schedule_data length:', scheduleData.schedule_data?.length);
      
      return scheduleData;
    } catch (error) {
      console.error('❌ [MonthlySchedulesService] Error in getScheduleById:', error);
      throw error;
    }
  }
} 