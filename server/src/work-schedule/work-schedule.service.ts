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
} 