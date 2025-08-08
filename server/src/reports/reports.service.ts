import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { WorkScheduleService } from '../work-schedule/work-schedule.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly workScheduleService: WorkScheduleService,
  ) {}

  /**
   * Kiểm tra xem nhân viên có quyền tạo báo cáo không dựa trên ca làm việc
   */
  async canCreateReport(userId: number): Promise<{
    canCreate: boolean;
    reason?: string;
    currentShift?: string;
    shiftTime?: string;
    isWorkingTime?: boolean;
  }> {
    try {
      console.log(`🔍 Bắt đầu kiểm tra quyền tạo báo cáo cho user ID: ${userId}`);
      
      // Lấy thông tin phân công ca làm việc của nhân viên trong ngày hôm nay
      const today = new Date();
      console.log(`📅 Kiểm tra cho ngày: ${today.toISOString().split('T')[0]}`);
      
      const userSchedule = await this.workScheduleService.getUserScheduleForDate(userId, today);
      console.log(`👤 Thông tin lịch làm việc của user:`, JSON.stringify(userSchedule, null, 2));
      
      if (!userSchedule.isAssigned) {
        console.log('❌ User chưa được phân công ca làm việc');
        return {
          canCreate: false,
          reason: 'Nhân viên chưa được phân công ca làm việc cho ngày hôm nay',
          isWorkingTime: false
        };
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute; // Tổng số phút từ 00:00
      
      console.log(`⏰ Thời gian hiện tại: ${currentHour}:${currentMinute.toString().padStart(2, '0')} (${currentTime} phút)`);

      // Tìm ca làm việc hiện tại từ danh sách ca được phân công
      let currentShiftInfo = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
      console.log(`🎯 Ca làm việc hiện tại:`, currentShiftInfo);
      
      if (!currentShiftInfo) {
        console.log('🔄 Không có ca hiện tại, kiểm tra thời gian gia hạn...');
        // Kiểm tra xem có đang trong thời gian cho phép tạo báo cáo không (30 phút sau ca)
        let canCreateInExtendedTime = false;
        let extendedShiftInfo: {
          shiftType: 'morning' | 'afternoon' | 'evening';
          shiftName: string;
          shiftTime: string;
          isCurrentShift: boolean;
        } | undefined = undefined;

        for (const shift of userSchedule.assignedShifts) {
          let shiftEnd: number;
          let allowedEndTime: number;

          if (shift.shiftType === 'morning') {
            shiftEnd = 14 * 60; // 14:00
            allowedEndTime = shiftEnd + 30; // 14:30
            console.log(`📋 Kiểm tra ca sáng: kết thúc ${shiftEnd}, cho phép đến ${allowedEndTime}, hiện tại ${currentTime}`);
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              console.log('✅ Trong thời gian gia hạn ca sáng');
              break;
            }
          } else if (shift.shiftType === 'afternoon') {
            shiftEnd = 22 * 60; // 22:00
            allowedEndTime = shiftEnd + 30; // 22:30
            console.log(`📋 Kiểm tra ca chiều: kết thúc ${shiftEnd}, cho phép đến ${allowedEndTime}, hiện tại ${currentTime}`);
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              console.log('✅ Trong thời gian gia hạn ca chiều');
              break;
            }
          } else if (shift.shiftType === 'evening') {
            // Ca đêm đặc biệt: kết thúc 06:00 sáng hôm sau
            console.log(`📋 Kiểm tra ca đêm: giờ hiện tại ${currentHour}:${currentMinute}`);
            if (currentHour < 6 || (currentHour === 6 && currentMinute <= 30)) {
              // Đang trong thời gian 00:00 - 06:30
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              console.log('✅ Trong thời gian gia hạn ca đêm');
              break;
            }
          }
        }

        if (!canCreateInExtendedTime) {
          // Kiểm tra nếu user nghỉ ngày hôm nay
          if (userSchedule.assignedShifts.length === 0) {
            console.log('😴 User nghỉ ngày hôm nay');
            return {
              canCreate: false,
              reason: 'Bạn được nghỉ ngày hôm nay theo lịch luân phiên. Không thể tạo báo cáo.',
              currentShift: 'Nghỉ',
              shiftTime: 'Nghỉ ngày hôm nay',
              isWorkingTime: false
            };
          }

          // Tạo danh sách thời gian cho phép
          const allowedTimes = userSchedule.assignedShifts.map(shift => {
            if (shift.shiftType === 'morning') {
              return '06:00 - 14:30';
            } else if (shift.shiftType === 'afternoon') {
              return '14:00 - 22:30';
            } else {
              return '22:00 - 06:30 (hôm sau)';
            }
          }).join(', ');
          
          console.log(`❌ Ngoài thời gian cho phép. Thời gian hợp lệ: ${allowedTimes}`);

          return {
            canCreate: false,
            reason: `Chỉ được phép tạo báo cáo trong ca làm việc và 30 phút sau ca. Thời gian cho phép: ${allowedTimes}`,
            currentShift: userSchedule.assignedShifts[0]?.shiftName,
            shiftTime: userSchedule.assignedShifts[0]?.shiftTime,
            isWorkingTime: false
          };
        }

        // Đang trong thời gian gia hạn (30 phút sau ca)
        currentShiftInfo = extendedShiftInfo;
        console.log('⏰ Sử dụng thông tin ca gia hạn:', currentShiftInfo);
      }

      // Kiểm tra currentShiftInfo không null
      if (!currentShiftInfo) {
        console.log('❌ Không thể xác định ca làm việc hiện tại');
        return {
          canCreate: false,
          reason: 'Không thể xác định ca làm việc hiện tại',
          isWorkingTime: false
        };
      }

      // Xác định loại ca để kiểm tra báo cáo đã tồn tại
      const shiftType: 'morning' | 'afternoon' | 'evening' = currentShiftInfo.shiftType;
      console.log(`🎯 Kiểm tra báo cáo đã tồn tại cho ca: ${shiftType}`);

      // Kiểm tra xem đã tạo báo cáo cho ca này chưa
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const existingReport = await this.reportRepository.findOne({
        where: {
          id_user: userId,
          shift_type: shiftType,
          shift_date: todayStart
        }
      });

      console.log(`📋 Báo cáo đã tồn tại:`, existingReport ? `ID: ${existingReport.id}` : 'Chưa có');

      if (existingReport) {
        console.log(`❌ Đã tạo báo cáo cho ${currentShiftInfo.shiftName}`);
        return {
          canCreate: false,
          reason: `Đã tạo báo cáo cho ${currentShiftInfo.shiftName} hôm nay. Mỗi ca chỉ được tạo báo cáo một lần.`,
          currentShift: currentShiftInfo.shiftName,
          shiftTime: currentShiftInfo.shiftTime,
          isWorkingTime: currentShiftInfo.isCurrentShift
        };
      }

      console.log(`✅ Được phép tạo báo cáo cho ${currentShiftInfo.shiftName}`);

      return {
        canCreate: true,
        reason: `Được phép tạo báo cáo cho ${currentShiftInfo.shiftName}`,
        currentShift: currentShiftInfo.shiftName,
        shiftTime: currentShiftInfo.shiftTime,
        isWorkingTime: currentShiftInfo.isCurrentShift
      };

    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra quyền tạo báo cáo:', error);
      console.error('❌ Chi tiết lỗi:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        canCreate: false,
        reason: 'Lỗi hệ thống khi kiểm tra quyền tạo báo cáo',
        isWorkingTime: false
      };
    }
  }

  /**
   * Dịch loại ca sang tiếng Việt
   */
  private translateShiftType(shiftType: 'morning' | 'afternoon' | 'evening'): string {
    switch (shiftType) {
      case 'morning': return 'sáng';
      case 'afternoon': return 'chiều';
      case 'evening': return 'tối';
      default: return shiftType;
    }
  }

  async createReport(id_user: number, content: string): Promise<Report> {
    console.log(`🚀 Bắt đầu tạo báo cáo cho user ID: ${id_user}`);
    console.log(`📝 Nội dung báo cáo:`, content?.substring(0, 200) + (content?.length > 200 ? '...' : ''));
    
    try {
    // Kiểm tra quyền tạo báo cáo
    const permissionCheck = await this.canCreateReport(id_user);
      console.log(`🔐 Kết quả kiểm tra quyền:`, permissionCheck);
    
    if (!permissionCheck.canCreate) {
        console.log(`❌ Từ chối tạo báo cáo: ${permissionCheck.reason}`);
      throw new ForbiddenException(permissionCheck.reason);
    }

      // Lấy thông tin ca làm việc thực tế từ user schedule
      const today = new Date();
      const userSchedule = await this.workScheduleService.getUserScheduleForDate(id_user, today);
      
      // Tìm ca làm việc hiện tại từ assignedShifts
      const currentShift = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
      
      if (!currentShift) {
        // Nếu không có ca hiện tại, kiểm tra thời gian gia hạn
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;
        
        // Tìm ca vừa kết thúc (trong thời gian gia hạn 30 phút)
        for (const shift of userSchedule.assignedShifts) {
          let shiftEnd: number;
          let allowedEndTime: number;

          if (shift.shiftType === 'morning') {
            shiftEnd = 14 * 60; // 14:00
            allowedEndTime = shiftEnd + 30; // 14:30
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              console.log(`⏰ Sử dụng ca sáng (thời gian gia hạn) cho báo cáo`);
              const shiftDate = new Date();
              shiftDate.setHours(0, 0, 0, 0);
              
              const report = this.reportRepository.create({ 
                id_user, 
                content,
                shift_type: 'morning',
                shift_date: shiftDate
              });
              
              console.log(`💾 Đang lưu báo cáo vào database...`);
              const savedReport = await this.reportRepository.save(report);
              console.log(`✅ Lưu báo cáo thành công với ID: ${savedReport.id}`);
              return savedReport;
            }
          } else if (shift.shiftType === 'afternoon') {
            shiftEnd = 22 * 60; // 22:00
            allowedEndTime = shiftEnd + 30; // 22:30
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              console.log(`⏰ Sử dụng ca chiều (thời gian gia hạn) cho báo cáo`);
              const shiftDate = new Date();
              shiftDate.setHours(0, 0, 0, 0);
              
              const report = this.reportRepository.create({ 
                id_user, 
                content,
                shift_type: 'afternoon',
                shift_date: shiftDate
              });
              
              console.log(`💾 Đang lưu báo cáo vào database...`);
              const savedReport = await this.reportRepository.save(report);
              console.log(`✅ Lưu báo cáo thành công với ID: ${savedReport.id}`);
              return savedReport;
            }
          } else if (shift.shiftType === 'evening') {
            // Ca đêm đặc biệt: kết thúc 06:00 sáng hôm sau
            if (currentHour < 6 || (currentHour === 6 && currentMinute <= 30)) {
              console.log(`⏰ Sử dụng ca đêm (thời gian gia hạn) cho báo cáo`);
    const shiftDate = new Date();
    shiftDate.setHours(0, 0, 0, 0);
              
              const report = this.reportRepository.create({ 
                id_user, 
                content,
                shift_type: 'evening',
                shift_date: shiftDate
              });
              
              console.log(`💾 Đang lưu báo cáo vào database...`);
              const savedReport = await this.reportRepository.save(report);
              console.log(`✅ Lưu báo cáo thành công với ID: ${savedReport.id}`);
              return savedReport;
            }
          }
        }
        
        throw new ForbiddenException('Không thể xác định ca làm việc để tạo báo cáo');
      }

      // Sử dụng ca làm việc hiện tại từ rotation logic
      const shiftType = currentShift.shiftType;
      const shiftDate = new Date();
      shiftDate.setHours(0, 0, 0, 0);
      
      console.log(`⏰ Loại ca hiện tại từ rotation: ${shiftType}`);
      console.log(`📅 Ngày ca: ${shiftDate.toISOString().split('T')[0]}`);

    const report = this.reportRepository.create({ 
      id_user, 
      content,
      shift_type: shiftType,
      shift_date: shiftDate
    });
    
      console.log(`💾 Đang lưu báo cáo vào database...`);
      
      const savedReport = await this.reportRepository.save(report);
      console.log(`✅ Lưu báo cáo thành công với ID: ${savedReport.id}`);
      
      return savedReport;
    } catch (error) {
      console.error(`❌ Lỗi khi tạo báo cáo cho user ${id_user}:`, error);
      console.error(`❌ Chi tiết lỗi:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Re-throw the error to maintain existing behavior
      throw error;
    }
  }

  async getAllReports(): Promise<Report[]> {
    return this.reportRepository.find({ order: { created_at: 'DESC' } });
  }

  async getReportsByUserId(userId: number): Promise<Report[]> {
    return this.reportRepository.find({ 
      where: { id_user: userId },
      order: { created_at: 'DESC' } 
    });
  }

  /**
   * Lấy báo cáo theo ca làm việc
   */
  async getReportsByShift(shiftType: 'morning' | 'afternoon' | 'evening', date?: Date): Promise<Report[]> {
    const queryDate = date || new Date();
    queryDate.setHours(0, 0, 0, 0);

    return this.reportRepository.find({
      where: {
        shift_type: shiftType,
        shift_date: queryDate
      },
      order: { created_at: 'DESC' }
    });
  }
} 