import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkSchedule } from '../entities/work-schedule.entity';
import { User } from '../entities/user.entity';

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
  async getUserRole(userId: number): Promise<{ role: string; scheduleId: number | null }> {
    try {
      // Tìm schedule hiện tại đang active
      const currentSchedule = await this.workScheduleRepository.findOne({
        where: { active: true },
        order: { created_date: 'DESC' }
      });

      if (!currentSchedule) {
        return { role: 'Chưa được phân công', scheduleId: null };
      }

      // Kiểm tra user có trong schedule không
      let role = 'Chưa được phân công';
      if (currentSchedule.employee_a === userId) {
        role = 'Nhân viên A';
      } else if (currentSchedule.employee_b === userId) {
        role = 'Nhân viên B';
      } else if (currentSchedule.employee_c === userId) {
        role = 'Nhân viên C';
      } else if (currentSchedule.employee_d === userId) {
        role = 'Nhân viên D';
      }

      return { role, scheduleId: currentSchedule.id };
    } catch (error) {
      console.error('Lỗi khi lấy vai trò user:', error);
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
    try {
      // Lấy vai trò của user
      const userRole = await this.getUserRole(userId);
      
      if (userRole.role === 'Chưa được phân công') {
        return { 
          role: userRole.role, 
          shift: null, 
          shiftTime: null, 
          scheduleId: null 
        };
      }

      // Xác định ca trực dựa trên thời gian hiện tại
      const now = new Date();
      const currentHour = now.getHours();
      
      let shift = '';
      let shiftTime = '';
      
      if (currentHour >= 6 && currentHour < 14) {
        // Ca sáng: 6h - 14h
        shift = 'Ca Sáng';
        shiftTime = '06:00 - 14:00';
      } else if (currentHour >= 14 && currentHour < 22) {
        // Ca chiều: 14h - 22h
        shift = 'Ca Chiều';
        shiftTime = '14:00 - 22:00';
      } else {
        // Ca đêm: 22h - 6h
        shift = 'Ca Đêm';
        shiftTime = '22:00 - 06:00';
      }

      return {
        role: userRole.role,
        shift: shift,
        shiftTime: shiftTime,
        scheduleId: userRole.scheduleId
      };
    } catch (error) {
      console.error('Lỗi khi lấy ca trực hiện tại:', error);
      return { 
        role: 'Chưa được phân công', 
        shift: null, 
        shiftTime: null, 
        scheduleId: null 
      };
    }
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
   * Trả về thông tin chi tiết về ca làm việc được phân công
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
      // Chuẩn hóa ngày để so sánh (chỉ lấy ngày, không lấy giờ)
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Tìm schedule cho ngày cụ thể
      const schedule = await this.workScheduleRepository.findOne({
        where: { 
          activation_date: targetDate
        },
        relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
        order: { created_date: 'DESC' }
      });

      if (!schedule) {
        return {
          isAssigned: false,
          role: 'Chưa được phân công',
          assignedShifts: [],
          scheduleId: null
        };
      }

      // Kiểm tra user có trong schedule không và xác định vai trò
      let role = 'Chưa được phân công';
      let rolePosition: 'A' | 'B' | 'C' | 'D' | null = null;

      if (schedule.employee_a === userId) {
        role = 'Nhân viên A';
        rolePosition = 'A';
      } else if (schedule.employee_b === userId) {
        role = 'Nhân viên B';
        rolePosition = 'B';
      } else if (schedule.employee_c === userId) {
        role = 'Nhân viên C';
        rolePosition = 'C';
      } else if (schedule.employee_d === userId) {
        role = 'Nhân viên D';
        rolePosition = 'D';
      }

      if (!rolePosition) {
        return {
          isAssigned: false,
          role: 'Chưa được phân công',
          assignedShifts: [],
          scheduleId: schedule.id
        };
      }

      // Xác định ca làm việc dựa trên vai trò
      // Logic phân công ca theo vai trò:
      // - Nhân viên A: Ca sáng (06:00 - 14:00)
      // - Nhân viên B: Ca chiều (14:00 - 22:00)  
      // - Nhân viên C: Ca đêm (22:00 - 06:00)
      // - Nhân viên D: Dự phòng/thay thế
      const assignedShifts: Array<{
        shiftType: 'morning' | 'afternoon' | 'evening';
        shiftName: string;
        shiftTime: string;
        isCurrentShift: boolean;
      }> = [];
      const now = new Date();
      const currentHour = now.getHours();

      switch (rolePosition) {
        case 'A':
          assignedShifts.push({
            shiftType: 'morning',
            shiftName: 'Ca Sáng',
            shiftTime: '06:00 - 14:00',
            isCurrentShift: currentHour >= 6 && currentHour < 14
          });
          break;
        case 'B':
          assignedShifts.push({
            shiftType: 'afternoon',
            shiftName: 'Ca Chiều', 
            shiftTime: '14:00 - 22:00',
            isCurrentShift: currentHour >= 14 && currentHour < 22
          });
          break;
        case 'C':
          assignedShifts.push({
            shiftType: 'evening',
            shiftName: 'Ca Đêm',
            shiftTime: '22:00 - 06:00',
            isCurrentShift: currentHour >= 22 || currentHour < 6
          });
          break;
        case 'D':
          // Nhân viên D có thể làm tất cả các ca (dự phòng)
          assignedShifts.push(
            {
              shiftType: 'morning',
              shiftName: 'Ca Sáng',
              shiftTime: '06:00 - 14:00',
              isCurrentShift: currentHour >= 6 && currentHour < 14
            },
            {
              shiftType: 'afternoon',
              shiftName: 'Ca Chiều',
              shiftTime: '14:00 - 22:00', 
              isCurrentShift: currentHour >= 14 && currentHour < 22
            },
            {
              shiftType: 'evening',
              shiftName: 'Ca Đêm',
              shiftTime: '22:00 - 06:00',
              isCurrentShift: currentHour >= 22 || currentHour < 6
            }
          );
          break;
      }

      return {
        isAssigned: true,
        role,
        assignedShifts,
        scheduleId: schedule.id
      };

    } catch (error) {
      console.error('Lỗi khi lấy lịch phân công theo ngày:', error);
      return {
        isAssigned: false,
        role: 'Lỗi hệ thống',
        assignedShifts: [],
        scheduleId: null
      };
    }
  }

  /**
   * Kiểm tra xem user có được phân công ca cụ thể trong ngày không
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

    // Kiểm tra xem có ca được phân công khớp với shiftType không
    return schedule.assignedShifts.some(shift => shift.shiftType === shiftType);
  }
} 