import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkSchedule } from '../entities/work-schedule.entity';
import { User } from '../entities/user.entity';
import { DataSource } from 'typeorm';

export interface CreateWorkScheduleDto {
  employee_a: number;
  employee_b: number;
  employee_c: number;
  employee_d: number;
}

export interface UpdateWorkScheduleDto {
  employee_a?: number;
  employee_b?: number;
  employee_c?: number;
  employee_d?: number;
}

@Injectable()
export class WorkScheduleService {
  constructor(
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // Lấy tất cả phân công
  async findAll(): Promise<any[]> {
    const schedules = await this.workScheduleRepository.find({
      relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
      order: { created_date: 'DESC' }
    });

    return schedules.map(schedule => ({
      id: schedule.id,
      employee_a: schedule.employee_a,
      employee_b: schedule.employee_b,
      employee_c: schedule.employee_c,
      employee_d: schedule.employee_d,
      active: schedule.active,
      created_at: schedule.created_date,
      updated_at: schedule.updated_date,
      activation_date: schedule.activation_date,
      employee_a_name: schedule.employeeA ? `${schedule.employeeA.firstName} ${schedule.employeeA.lastName}` : '',
      employee_b_name: schedule.employeeB ? `${schedule.employeeB.firstName} ${schedule.employeeB.lastName}` : '',
      employee_c_name: schedule.employeeC ? `${schedule.employeeC.firstName} ${schedule.employeeC.lastName}` : '',
      employee_d_name: schedule.employeeD ? `${schedule.employeeD.firstName} ${schedule.employeeD.lastName}` : '',
    }));
  }

  // Lấy phân công theo ID
  async findOne(id: number): Promise<WorkSchedule> {
    const workSchedule = await this.workScheduleRepository.findOne({
      where: { id },
      relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD']
    });

    if (!workSchedule) {
      throw new NotFoundException(`Không tìm thấy phân công với ID ${id}`);
    }

    return workSchedule;
  }

  // Lấy phân công theo ngày
  async findByDate(date: string): Promise<WorkSchedule[]> {
    return this.workScheduleRepository.find({
      where: { activation_date: new Date(date) },
      relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
      order: { created_date: 'DESC' }
    });
  }

  // Tạo phân công mới (chỉ admin mới được tạo)
  async create(createWorkScheduleDto: CreateWorkScheduleDto): Promise<WorkSchedule> {
    const { employee_a, employee_b, employee_c, employee_d } = createWorkScheduleDto;

    // Kiểm tra không có nhân viên trùng lặp
    const employeeIds = [employee_a, employee_b, employee_c, employee_d].filter(id => id > 0);
    const uniqueEmployeeIds = [...new Set(employeeIds)];
    
    if (employeeIds.length !== uniqueEmployeeIds.length) {
      throw new BadRequestException('Không thể phân công cùng một nhân viên vào nhiều vị trí');
    }

    // Kiểm tra các nhân viên có tồn tại không và không phải admin
    const employees = await this.userRepository.find({
      where: [
        { id: employee_a },
        { id: employee_b },
        { id: employee_c },
        { id: employee_d }
      ]
    });
    
    for (const empId of employeeIds) {
      const employee = employees.find(emp => emp.id === empId);
      if (!employee) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID ${empId}`);
      }
      if (employee.role_id === 1) {
        throw new BadRequestException('Không thể phân công cho tài khoản admin');
      }
    }

    // Kiểm tra xem đã có phân công trong ngày này chưa
    const existingSchedule = await this.workScheduleRepository.findOne({
      where: {
        activation_date: new Date()
      }
    });

    if (existingSchedule) {
      throw new BadRequestException(`Đã có phân công vào ngày ${existingSchedule.activation_date}`);
    }

    const workSchedule = this.workScheduleRepository.create({
      employee_a,
      employee_b,
      employee_c,
      employee_d,
      active: true
    });

    return this.workScheduleRepository.save(workSchedule);
  }

  // Cập nhật phân công
  async update(id: number, updateWorkScheduleDto: UpdateWorkScheduleDto): Promise<WorkSchedule> {
    const workSchedule = await this.findOne(id);

    // Nếu có cập nhật nhân viên, kiểm tra không có trùng lặp
    const { employee_a, employee_b, employee_c, employee_d } = updateWorkScheduleDto;
    
    // Lấy giá trị hiện tại nếu không được cập nhật
    const finalEmployeeA = employee_a !== undefined ? employee_a : workSchedule.employee_a;
    const finalEmployeeB = employee_b !== undefined ? employee_b : workSchedule.employee_b;
    const finalEmployeeC = employee_c !== undefined ? employee_c : workSchedule.employee_c;
    const finalEmployeeD = employee_d !== undefined ? employee_d : workSchedule.employee_d;

    // Kiểm tra không có nhân viên trùng lặp
    const employeeIds = [finalEmployeeA, finalEmployeeB, finalEmployeeC, finalEmployeeD].filter(id => id > 0);
    const uniqueEmployeeIds = [...new Set(employeeIds)];
    
    if (employeeIds.length !== uniqueEmployeeIds.length) {
      throw new BadRequestException('Không thể phân công cùng một nhân viên vào nhiều vị trí');
    }

    // Kiểm tra các nhân viên mới có tồn tại không và không phải admin
    if (employee_a !== undefined || employee_b !== undefined || employee_c !== undefined || employee_d !== undefined) {
      const employees = await this.userRepository.find({
        where: [
          { id: finalEmployeeA },
          { id: finalEmployeeB },
          { id: finalEmployeeC },
          { id: finalEmployeeD }
        ]
      });
      
      for (const empId of employeeIds) {
        const employee = employees.find(emp => emp.id === empId);
        if (!employee) {
          throw new NotFoundException(`Không tìm thấy nhân viên với ID ${empId}`);
        }
        if (employee.role_id === 1) {
          throw new BadRequestException('Không thể phân công cho tài khoản admin');
        }
      }
    }

    Object.assign(workSchedule, updateWorkScheduleDto);

    return this.workScheduleRepository.save(workSchedule);
  }

  // Xóa phân công
  async remove(id: number): Promise<void> {
    const workSchedule = await this.findOne(id);
    await this.workScheduleRepository.remove(workSchedule);
  }

  // Lấy danh sách nhân viên không phải admin (để hiển thị trong dropdown)
  async getAvailableEmployees(): Promise<User[]> {
    return this.userRepository.find({
      where: { role_id: 2, isActive: true }, // role_id = 2 là user thường
      order: { firstName: 'ASC' }
    });
  }

  // Lấy vai trò phân công của user
  async getUserRole(userId: number): Promise<{ role: string; roleLetter?: string; scheduleId: number | null }> {
    try {
      console.log(`🔍 getUserRole: Lấy vai trò cho user ${userId}`);
      console.log(`📊 DEBUG: User ID đang request = ${userId}`);

      // Xử lý logic ca đêm: nếu hiện tại là 0:00-6:30 thì tìm schedule của ngày hôm trước
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      let searchDate = new Date();

      // Khi trong ca đêm (0:00-6:30), tìm schedule của ngày hôm trước
      // Vì ca đêm được định nghĩa trong schedule của ngày bắt đầu ca đêm
      if (currentHour < 6 || (currentHour === 6 && currentMinute < 30)) {
        searchDate.setDate(searchDate.getDate() - 1);
        console.log(`🌙 Đang trong ca đêm, tìm schedule của ngày hôm trước: ${searchDate.toISOString().split('T')[0]}`);
      }

      searchDate.setHours(0, 0, 0, 0);

      console.log(`📅 Ngày hiện tại (raw): ${new Date().toISOString()}`);
      console.log(`📅 Ngày tìm kiếm: ${searchDate.toISOString().split('T')[0]}`);

      // 🎯 ƯU TIÊN: TÌM TRONG MONTHLY_WORK_SCHEDULES TRƯỚC
      const currentMonth = searchDate.getMonth() + 1;
      const currentYear = searchDate.getFullYear();
      const currentDay = searchDate.getDate();

      console.log(`🔍 Tìm monthly_work_schedules cho tháng ${currentMonth}/${currentYear}, ngày ${currentDay}`);

      try {
        const monthlyQuery = `
          SELECT id, month, year, schedule_data 
          FROM monthly_work_schedules 
          WHERE month = ? AND year = ?
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        
        const monthlyResult = await this.dataSource.query(monthlyQuery, [currentMonth, currentYear]);

        if (monthlyResult && monthlyResult.length > 0) {
          const monthlySchedule = monthlyResult[0];
          console.log(`✅ Tìm thấy monthly_work_schedules ID: ${monthlySchedule.id}`);

          // Parse schedule_data
          let scheduleData = [];
          if (monthlySchedule.schedule_data) {
            if (typeof monthlySchedule.schedule_data === 'string') {
              scheduleData = JSON.parse(monthlySchedule.schedule_data);
            } else if (Array.isArray(monthlySchedule.schedule_data)) {
              scheduleData = monthlySchedule.schedule_data;
            }
          }

          // Tìm schedule cho ngày hiện tại
          const daySchedule: any = scheduleData.find((day: any) => day.date === currentDay);
          
          if (daySchedule && daySchedule.shifts) {
            console.log(`🎯 Tìm thấy schedule cho ngày ${currentDay}:`, JSON.stringify(daySchedule, null, 2));

            // DEBUG: In ra từng role và mapping
            console.log(`🔍 Kiểm tra mapping cho user ${userId}:`);
            console.log(`  Morning role: ${daySchedule.shifts.morning?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.morning?.role, searchDate)}`);
            console.log(`  Afternoon role: ${daySchedule.shifts.afternoon?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.afternoon?.role, searchDate)}`);
            console.log(`  Evening role: ${daySchedule.shifts.evening?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.evening?.role, searchDate)}`);

            // Kiểm tra user có role nào trong monthly schedule
            if (daySchedule.shifts.morning && (await this.getUserByRole(daySchedule.shifts.morning.role, searchDate)) === userId) {
              const roleName = daySchedule.shifts.morning.employee_name || `Nhân viên ${daySchedule.shifts.morning.role}`;
              console.log(`✅ User ${userId} có role: ${roleName} (morning)`);
              return { role: roleName, roleLetter: daySchedule.shifts.morning.role, scheduleId: monthlySchedule.id };
            }
            
            if (daySchedule.shifts.afternoon && (await this.getUserByRole(daySchedule.shifts.afternoon.role, searchDate)) === userId) {
              const roleName = daySchedule.shifts.afternoon.employee_name || `Nhân viên ${daySchedule.shifts.afternoon.role}`;
              console.log(`✅ User ${userId} có role: ${roleName} (afternoon)`);
              return { role: roleName, roleLetter: daySchedule.shifts.afternoon.role, scheduleId: monthlySchedule.id };
            }
            
            if (daySchedule.shifts.evening && (await this.getUserByRole(daySchedule.shifts.evening.role, searchDate)) === userId) {
              const roleName = daySchedule.shifts.evening.employee_name || `Nhân viên ${daySchedule.shifts.evening.role}`;
              console.log(`✅ User ${userId} có role: ${roleName} (evening)`);
              return { role: roleName, roleLetter: daySchedule.shifts.evening.role, scheduleId: monthlySchedule.id };
            }

            // User không có ca nào trong ngày này
            console.log(`😴 User ${userId} nghỉ ngày ${currentDay} theo monthly_work_schedules`);
            return { role: 'Nghỉ', scheduleId: monthlySchedule.id };
          }
        }
      } catch (error) {
        console.error(`❌ Lỗi khi query monthly_work_schedules:`, error);
      }

      // Nếu không có monthly_work_schedules, trả về chưa được phân công
      console.log(`❌ Không tìm thấy dữ liệu trong monthly_work_schedules`);
      return { role: 'Chưa được phân công', scheduleId: null };

    } catch (error) {
      console.error(`❌ Lỗi khi lấy vai trò user ${userId}:`, error);
      return { role: 'Chưa được phân công', scheduleId: null };
    }
  }

  // Lấy thông tin ca trực hiện tại của user
  async getUserCurrentShift(userId: number): Promise<{ 
    role: string; 
    shift: string | null; 
    shiftTime: string | null; 
    scheduleId: number | null 
  }> {
    console.log(`🔍 getUserCurrentShift: Lấy ca trực hiện tại cho user ${userId}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userSchedule = await this.getUserScheduleForDate(userId, today);

    if (!userSchedule.isAssigned) {
      console.log(`❌ User ${userId} chưa được phân công ca làm việc`);
      return { 
        role: userSchedule.role, 
        shift: null, 
        shiftTime: 'Chưa được phân công ca làm việc', 
        scheduleId: userSchedule.scheduleId 
      };
    }

    const currentShift = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);

    if (currentShift) {
      console.log(`✅ User ${userId} đang trong ca: ${currentShift.shiftName}`);
      return {
        role: userSchedule.role,
        shift: currentShift.shiftName,
        shiftTime: currentShift.shiftTime,
        scheduleId: userSchedule.scheduleId
      };
    }

    if (userSchedule.assignedShifts.length > 0) {
      const nextShift = userSchedule.assignedShifts[0];
      console.log(`⏰ User ${userId} được phân công ca: ${nextShift.shiftName} (không đang trong ca)`);
      return {
        role: userSchedule.role,
        shift: nextShift.shiftName,
        shiftTime: nextShift.shiftTime,
        scheduleId: userSchedule.scheduleId
      };
    }

    // User nghỉ ngày hôm nay
    console.log(`😴 User ${userId} nghỉ ngày hôm nay`);
    return {
      role: userSchedule.role,
      shift: 'Nghỉ',
      shiftTime: 'Nghỉ ngày hôm nay',
      scheduleId: userSchedule.scheduleId
    };
  }

  // Thống kê phân công theo tuần/tháng
  async getScheduleStats(startDate: string, endDate: string) {
    const schedules = await this.workScheduleRepository
      .createQueryBuilder('ws')
      .leftJoinAndSelect('ws.employeeA', 'empA')
      .leftJoinAndSelect('ws.employeeB', 'empB')
      .leftJoinAndSelect('ws.employeeC', 'empC')
      .leftJoinAndSelect('ws.employeeD', 'empD')
      .where('ws.activation_date BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })
      .orderBy('ws.activation_date', 'ASC')
      .getMany();

    return {
      totalSchedules: schedules.length,
      schedules
    };
  }

  // Lấy vai trò nhân viên hiện tại (A, B, C, D)
  async getEmployeeRoles(): Promise<any> {
    const activeSchedule = await this.workScheduleRepository.findOne({
      where: { active: true },
      relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
      order: { created_date: 'DESC' }
    });

    if (!activeSchedule) {
      throw new NotFoundException('Không tìm thấy phân công vai trò active nào');
    }

    return {
      employee_a: activeSchedule.employee_a,
      employee_b: activeSchedule.employee_b,
      employee_c: activeSchedule.employee_c,
      employee_d: activeSchedule.employee_d,
      employee_a_name: activeSchedule.employeeA ? `${activeSchedule.employeeA.firstName} ${activeSchedule.employeeA.lastName}` : 'Chưa phân công',
      employee_b_name: activeSchedule.employeeB ? `${activeSchedule.employeeB.firstName} ${activeSchedule.employeeB.lastName}` : 'Chưa phân công',
      employee_c_name: activeSchedule.employeeC ? `${activeSchedule.employeeC.firstName} ${activeSchedule.employeeC.lastName}` : 'Chưa phân công',
      employee_d_name: activeSchedule.employeeD ? `${activeSchedule.employeeD.firstName} ${activeSchedule.employeeD.lastName}` : 'Chưa phân công',
      created_date: activeSchedule.created_date,
      activation_date: activeSchedule.activation_date
    };
  }

  /**
   * Lấy thông tin phân công ca làm việc của user trong ngày cụ thể
   */
  async getUserScheduleForDate(userId: number, date: Date = new Date()): Promise<{
    isAssigned: boolean;
    role: string;
    assignedShifts: Array<{
      shiftType: 'morning' | 'afternoon' | 'evening';
      shiftName: string;
      shiftTime: string;
      isCurrentShift: boolean;
    }>;
    scheduleId: number | null;
  }> {
    try {
      console.log(`📅 WorkScheduleService: Lấy lịch làm việc cho user ${userId} ngày ${date.toISOString().split('T')[0]}`);

      // Xử lý logic ca đêm: nếu hiện tại là 0:00-6:30 và date là ngày hiện tại, thì tìm schedule của ngày hôm trước
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      let targetDate = new Date(date);

      // Nếu đang trong khung giờ ca đêm và date là ngày hiện tại, thì tìm schedule của ngày hôm trước
      if ((currentHour < 6 || (currentHour === 6 && currentMinute < 30)) &&
          date.toDateString() === now.toDateString()) {
        targetDate.setDate(targetDate.getDate() - 1);
        console.log(`🌙 Đang trong ca đêm, tìm schedule của ngày hôm trước: ${targetDate.toISOString().split('T')[0]}`);
      }

      targetDate.setHours(0, 0, 0, 0);

      // 🎯 BƯỚC 1: TÌM MONTHLY_WORK_SCHEDULES TRƯỚC (ƯU TIÊN)
      const currentMonth = targetDate.getMonth() + 1; // getMonth() trả về 0-11
      const currentYear = targetDate.getFullYear();
      const currentDay = targetDate.getDate();

      console.log(`🔍 Tìm monthly_work_schedules cho tháng ${currentMonth}/${currentYear}, ngày ${currentDay}`);

      try {
        // Query trực tiếp vào monthly_work_schedules
        const monthlyQuery = `
          SELECT id, month, year, schedule_data 
          FROM monthly_work_schedules 
          WHERE month = ? AND year = ?
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        
        const monthlyResult = await this.dataSource.query(monthlyQuery, [currentMonth, currentYear]);
        console.log(`📋 Monthly schedule result:`, monthlyResult);

        if (monthlyResult && monthlyResult.length > 0) {
          const monthlySchedule = monthlyResult[0];
          console.log(`✅ Tìm thấy monthly_work_schedules ID: ${monthlySchedule.id}`);

          // Parse schedule_data
          let scheduleData = [];
          if (monthlySchedule.schedule_data) {
            if (typeof monthlySchedule.schedule_data === 'string') {
              scheduleData = JSON.parse(monthlySchedule.schedule_data);
            } else if (Array.isArray(monthlySchedule.schedule_data)) {
              scheduleData = monthlySchedule.schedule_data;
            }
          }

          console.log(`📊 Schedule data length: ${scheduleData.length}`);

          // Tìm schedule cho ngày hiện tại
          const daySchedule: any = scheduleData.find((day: any) => day.date === currentDay);
          
          if (daySchedule && daySchedule.shifts) {
            console.log(`🎯 Tìm thấy schedule cho ngày ${currentDay}:`, daySchedule);

            // Tìm user trong các role của ngày
            let userRole = '';
            let userRoleName = '';
            
            // Kiểm tra user có role nào trong monthly schedule
            if (daySchedule.shifts.morning && (await this.getUserByRole(daySchedule.shifts.morning.role, targetDate)) === userId) {
              userRole = daySchedule.shifts.morning.role;
              userRoleName = daySchedule.shifts.morning.employee_name || `Nhân viên ${userRole}`;
            } else if (daySchedule.shifts.afternoon && (await this.getUserByRole(daySchedule.shifts.afternoon.role, targetDate)) === userId) {
              userRole = daySchedule.shifts.afternoon.role;
              userRoleName = daySchedule.shifts.afternoon.employee_name || `Nhân viên ${userRole}`;
            } else if (daySchedule.shifts.evening && (await this.getUserByRole(daySchedule.shifts.evening.role, targetDate)) === userId) {
              userRole = daySchedule.shifts.evening.role;
              userRoleName = daySchedule.shifts.evening.employee_name || `Nhân viên ${userRole}`;
            }

            if (!userRole) {
              console.log(`😴 User ${userId} nghỉ ngày ${currentDay} theo monthly_work_schedules`);
              return {
                isAssigned: false,
                role: 'Nghỉ',
                assignedShifts: [],
                scheduleId: monthlySchedule.id
              };
            }

            const assignedShifts: Array<{
              shiftType: 'morning' | 'afternoon' | 'evening';
              shiftName: string;
              shiftTime: string;
              isCurrentShift: boolean;
            }> = [];

            const currentHour = now.getHours();

            // Kiểm tra user được assign ca nào trong ngày
            if (daySchedule.shifts.morning && daySchedule.shifts.morning.role === userRole) {
              assignedShifts.push({
                shiftType: 'morning',
                shiftName: 'Ca Sáng',
                shiftTime: '06:00 - 14:00',
                isCurrentShift: currentHour >= 6 && currentHour < 14
              });
              console.log(`🌅 User ${userId} được assign Ca Sáng từ monthly_work_schedules`);
            }

            if (daySchedule.shifts.afternoon && daySchedule.shifts.afternoon.role === userRole) {
              assignedShifts.push({
                shiftType: 'afternoon',
                shiftName: 'Ca Chiều',
                shiftTime: '14:00 - 22:00',
                isCurrentShift: currentHour >= 14 && currentHour < 22
              });
              console.log(`🌇 User ${userId} được assign Ca Chiều từ monthly_work_schedules`);
            }

            if (daySchedule.shifts.evening && daySchedule.shifts.evening.role === userRole) {
              assignedShifts.push({
                shiftType: 'evening',
                shiftName: 'Ca Đêm',
                shiftTime: '22:00 - 06:00',
                isCurrentShift: currentHour >= 22 || currentHour < 6
              });
              console.log(`🌙 User ${userId} được assign Ca Đêm từ monthly_work_schedules`);
            }

            return {
              isAssigned: true,
              role: userRoleName,
              assignedShifts,
              scheduleId: monthlySchedule.id
            };
          } else {
            console.log(`😴 Không có schedule cho ngày ${currentDay} trong monthly_work_schedules`);
          }
        } else {
          console.log(`❌ Không có monthly_work_schedules cho tháng ${currentMonth}/${currentYear}`);
        }
      } catch (error) {
        console.error(`❌ Lỗi khi query monthly_work_schedules:`, error);
      }

      // 🎯 BƯỚC 2: NẾU KHÔNG CÓ MONTHLY_WORK_SCHEDULES, TRẢ VỀ CHƯA ĐƯỢC PHÂN CÔNG
      console.log(`❌ Không tìm thấy dữ liệu trong monthly_work_schedules → Chưa được phân công ca làm việc`);
      return {
        isAssigned: false,
        role: 'Chưa được phân công ca làm việc',
        assignedShifts: [],
        scheduleId: null
      };

    } catch (error) {
      console.error(`❌ Lỗi getUserScheduleForDate:`, error);
      return {
        isAssigned: false,
        role: 'Lỗi hệ thống',
        assignedShifts: [],
        scheduleId: null
      };
    }
  }

  /**
   * Kiểm tra user có được phân công ca cụ thể trong ngày không
   */
  async isUserAssignedToShift(
    userId: number, 
    shiftType: 'morning' | 'afternoon' | 'evening',
    date: Date = new Date()
  ): Promise<boolean> {
    const schedule = await this.getUserScheduleForDate(userId, date);
    
    if (!schedule.isAssigned) {
      return false;
    }

    return schedule.assignedShifts.some(shift => shift.shiftType === shiftType);
  }

  // Helper method để map role sang userId từ database
  private async getUserByRole(role: string, searchDate: Date): Promise<number | null> {
    try {
      // Lấy mapping role → user ID từ work_schedule table
      const searchDateStr = searchDate.toISOString().split('T')[0];
      
      console.log(`🔍 DEBUG getUserByRole: Tìm work_schedule cho ngày ${searchDateStr}`);
      
      // DEBUG: Kiểm tra tất cả work_schedule trong database
      const allSchedules = await this.workScheduleRepository.find({
        order: { created_date: 'DESC' }
      });
      console.log(`📊 DEBUG: Tất cả work_schedule trong DB:`, allSchedules.map(s => ({
        id: s.id,
        activation_date: s.activation_date,
        employee_a: s.employee_a,
        employee_b: s.employee_b,
        employee_c: s.employee_c,
        employee_d: s.employee_d,
        active: s.active
      })));
      
      const schedule = await this.workScheduleRepository
        .createQueryBuilder('schedule')
        .where('DATE(schedule.activation_date) = :searchDate', { searchDate: searchDateStr })
        .orderBy('schedule.created_date', 'DESC')
        .getOne();

      if (!schedule) {
        console.log(`❌ Không tìm thấy work_schedule cho ngày ${searchDateStr}`);
        console.log(`💡 Thử lấy work_schedule gần nhất thay thế:`);
        
        // Lấy work_schedule gần nhất nếu không tìm thấy cho ngày cụ thể
        const latestSchedule = await this.workScheduleRepository
          .createQueryBuilder('schedule')
          .where('schedule.active = :active', { active: true })
          .orderBy('schedule.created_date', 'DESC')
          .getOne();
          
        if (latestSchedule) {
          console.log(`✅ Sử dụng work_schedule gần nhất ID ${latestSchedule.id}, activation_date: ${latestSchedule.activation_date}`);
          
          const roleMapping = {
            'A': latestSchedule.employee_a,
            'B': latestSchedule.employee_b,
            'C': latestSchedule.employee_c,
            'D': latestSchedule.employee_d
          };

          const userId = roleMapping[role] || null;
          console.log(`🔄 getUserByRole: role="${role}" → userId=${userId} (from latest work_schedule ID ${latestSchedule.id})`);
          return userId;
        }
        
        return null;
      }

      const roleMapping = {
        'A': schedule.employee_a,
        'B': schedule.employee_b,
        'C': schedule.employee_c,
        'D': schedule.employee_d
      };

      const userId = roleMapping[role] || null;
      console.log(`🔄 getUserByRole: role="${role}" → userId=${userId} (from work_schedule ID ${schedule.id})`);
      return userId;
    } catch (error) {
      console.error(`❌ Lỗi khi lấy mapping role ${role}:`, error);
      return null;
    }
  }

  /**
   * DEBUG: Xóa tất cả work_schedule
   */
  async clearAllWorkSchedules(): Promise<void> {
    console.log('🗑️ Xóa tất cả records trong work_schedule');
    await this.workScheduleRepository.clear();
  }
}