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
      // Lấy thông tin phân công ca làm việc của nhân viên trong ngày hôm nay
      const today = new Date();
      const userSchedule = await this.workScheduleService.getUserScheduleForDate(userId, today);
      
      if (!userSchedule.isAssigned) {
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

      // Tìm ca làm việc hiện tại từ danh sách ca được phân công
      let currentShiftInfo = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
      
      if (!currentShiftInfo) {
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
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              break;
            }
          } else if (shift.shiftType === 'afternoon') {
            shiftEnd = 22 * 60; // 22:00
            allowedEndTime = shiftEnd + 30; // 22:30
            if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              break;
            }
          } else if (shift.shiftType === 'evening') {
            // Ca đêm đặc biệt: kết thúc 06:00 sáng hôm sau
            if (currentHour < 6 || (currentHour === 6 && currentMinute <= 30)) {
              // Đang trong thời gian 00:00 - 06:30
              canCreateInExtendedTime = true;
              extendedShiftInfo = shift;
              break;
            }
          }
        }

        if (!canCreateInExtendedTime) {
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
      }

      // Kiểm tra currentShiftInfo không null
      if (!currentShiftInfo) {
        return {
          canCreate: false,
          reason: 'Không thể xác định ca làm việc hiện tại',
          isWorkingTime: false
        };
      }

      // Xác định loại ca để kiểm tra báo cáo đã tồn tại
      const shiftType: 'morning' | 'afternoon' | 'evening' = currentShiftInfo.shiftType;

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

      if (existingReport) {
        return {
          canCreate: false,
          reason: `Đã tạo báo cáo cho ${currentShiftInfo.shiftName} hôm nay. Mỗi ca chỉ được tạo báo cáo một lần.`,
          currentShift: currentShiftInfo.shiftName,
          shiftTime: currentShiftInfo.shiftTime,
          isWorkingTime: currentShiftInfo.isCurrentShift
        };
      }

      return {
        canCreate: true,
        reason: `Được phép tạo báo cáo cho ${currentShiftInfo.shiftName}`,
        currentShift: currentShiftInfo.shiftName,
        shiftTime: currentShiftInfo.shiftTime,
        isWorkingTime: currentShiftInfo.isCurrentShift
      };

    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền tạo báo cáo:', error);
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

  /**
   * Xác định loại ca dựa trên thời gian hiện tại
   */
  private getCurrentShiftType(): 'morning' | 'afternoon' | 'evening' {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 14) {
      return 'morning';
    } else if (currentHour >= 14 && currentHour < 22) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  }

  async createReport(id_user: number, content: string): Promise<Report> {
    // Kiểm tra quyền tạo báo cáo
    const permissionCheck = await this.canCreateReport(id_user);
    
    if (!permissionCheck.canCreate) {
      throw new ForbiddenException(permissionCheck.reason);
    }

    // Xác định ca làm việc hiện tại
    const shiftType = this.getCurrentShiftType();
    const shiftDate = new Date();
    shiftDate.setHours(0, 0, 0, 0);

    const report = this.reportRepository.create({ 
      id_user, 
      content,
      shift_type: shiftType,
      shift_date: shiftDate
    });
    
    return this.reportRepository.save(report);
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