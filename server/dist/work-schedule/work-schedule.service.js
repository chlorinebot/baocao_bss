"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const work_schedule_entity_1 = require("../entities/work-schedule.entity");
const user_entity_1 = require("../entities/user.entity");
let WorkScheduleService = class WorkScheduleService {
    workScheduleRepository;
    userRepository;
    constructor(workScheduleRepository, userRepository) {
        this.workScheduleRepository = workScheduleRepository;
        this.userRepository = userRepository;
    }
    async findAll() {
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
    async findOne(id) {
        const workSchedule = await this.workScheduleRepository.findOne({
            where: { id },
            relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD']
        });
        if (!workSchedule) {
            throw new common_1.NotFoundException(`Không tìm thấy phân công với ID ${id}`);
        }
        return workSchedule;
    }
    async findByDate(date) {
        return this.workScheduleRepository.find({
            where: { activation_date: new Date(date) },
            relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
            order: { created_date: 'DESC' }
        });
    }
    async create(createWorkScheduleDto) {
        const { employee_a, employee_b, employee_c, employee_d } = createWorkScheduleDto;
        const employeeIds = [employee_a, employee_b, employee_c, employee_d].filter(id => id > 0);
        const uniqueEmployeeIds = [...new Set(employeeIds)];
        if (employeeIds.length !== uniqueEmployeeIds.length) {
            throw new common_1.BadRequestException('Không thể phân công cùng một nhân viên vào nhiều vị trí');
        }
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
                throw new common_1.NotFoundException(`Không tìm thấy nhân viên với ID ${empId}`);
            }
            if (employee.role_id === 1) {
                throw new common_1.BadRequestException('Không thể phân công cho tài khoản admin');
            }
        }
        const existingSchedule = await this.workScheduleRepository.findOne({
            where: {
                activation_date: new Date()
            }
        });
        if (existingSchedule) {
            throw new common_1.BadRequestException(`Đã có phân công vào ngày ${existingSchedule.activation_date}`);
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
    async update(id, updateWorkScheduleDto) {
        const workSchedule = await this.findOne(id);
        const { employee_a, employee_b, employee_c, employee_d } = updateWorkScheduleDto;
        const finalEmployeeA = employee_a !== undefined ? employee_a : workSchedule.employee_a;
        const finalEmployeeB = employee_b !== undefined ? employee_b : workSchedule.employee_b;
        const finalEmployeeC = employee_c !== undefined ? employee_c : workSchedule.employee_c;
        const finalEmployeeD = employee_d !== undefined ? employee_d : workSchedule.employee_d;
        const employeeIds = [finalEmployeeA, finalEmployeeB, finalEmployeeC, finalEmployeeD].filter(id => id > 0);
        const uniqueEmployeeIds = [...new Set(employeeIds)];
        if (employeeIds.length !== uniqueEmployeeIds.length) {
            throw new common_1.BadRequestException('Không thể phân công cùng một nhân viên vào nhiều vị trí');
        }
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
                    throw new common_1.NotFoundException(`Không tìm thấy nhân viên với ID ${empId}`);
                }
                if (employee.role_id === 1) {
                    throw new common_1.BadRequestException('Không thể phân công cho tài khoản admin');
                }
            }
        }
        Object.assign(workSchedule, updateWorkScheduleDto);
        return this.workScheduleRepository.save(workSchedule);
    }
    async remove(id) {
        const workSchedule = await this.findOne(id);
        await this.workScheduleRepository.remove(workSchedule);
    }
    async getAvailableEmployees() {
        return this.userRepository.find({
            where: { role_id: 2, isActive: true },
            order: { firstName: 'ASC' }
        });
    }
    async getUserRole(userId) {
        try {
            const currentSchedule = await this.workScheduleRepository.findOne({
                where: { active: true },
                order: { created_date: 'DESC' }
            });
            if (!currentSchedule) {
                return { role: 'Chưa được phân công', scheduleId: null };
            }
            let role = 'Chưa được phân công';
            if (currentSchedule.employee_a === userId) {
                role = 'Nhân viên A';
            }
            else if (currentSchedule.employee_b === userId) {
                role = 'Nhân viên B';
            }
            else if (currentSchedule.employee_c === userId) {
                role = 'Nhân viên C';
            }
            else if (currentSchedule.employee_d === userId) {
                role = 'Nhân viên D';
            }
            return { role, scheduleId: currentSchedule.id };
        }
        catch (error) {
            console.error('Lỗi khi lấy vai trò user:', error);
            return { role: 'Chưa được phân công', scheduleId: null };
        }
    }
    async getUserCurrentShift(userId) {
        try {
            const userRole = await this.getUserRole(userId);
            if (userRole.role === 'Chưa được phân công') {
                return {
                    role: userRole.role,
                    shift: null,
                    shiftTime: null,
                    scheduleId: null
                };
            }
            const now = new Date();
            const currentHour = now.getHours();
            let shift = '';
            let shiftTime = '';
            if (currentHour >= 6 && currentHour < 14) {
                shift = 'Ca Sáng';
                shiftTime = '06:00 - 14:00';
            }
            else if (currentHour >= 14 && currentHour < 22) {
                shift = 'Ca Chiều';
                shiftTime = '14:00 - 22:00';
            }
            else {
                shift = 'Ca Đêm';
                shiftTime = '22:00 - 06:00';
            }
            return {
                role: userRole.role,
                shift: shift,
                shiftTime: shiftTime,
                scheduleId: userRole.scheduleId
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy ca trực hiện tại:', error);
            return {
                role: 'Chưa được phân công',
                shift: null,
                shiftTime: null,
                scheduleId: null
            };
        }
    }
    async getScheduleStats(startDate, endDate) {
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
    async getEmployeeRoles() {
        const activeSchedule = await this.workScheduleRepository.findOne({
            where: { active: true },
            relations: ['employeeA', 'employeeB', 'employeeC', 'employeeD'],
            order: { created_date: 'DESC' }
        });
        if (!activeSchedule) {
            throw new common_1.NotFoundException('Không tìm thấy phân công vai trò active nào');
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
    async getUserScheduleForDate(userId, date = new Date()) {
        try {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
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
            let role = 'Chưa được phân công';
            let rolePosition = null;
            if (schedule.employee_a === userId) {
                role = 'Nhân viên A';
                rolePosition = 'A';
            }
            else if (schedule.employee_b === userId) {
                role = 'Nhân viên B';
                rolePosition = 'B';
            }
            else if (schedule.employee_c === userId) {
                role = 'Nhân viên C';
                rolePosition = 'C';
            }
            else if (schedule.employee_d === userId) {
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
            const assignedShifts = [];
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
                    assignedShifts.push({
                        shiftType: 'morning',
                        shiftName: 'Ca Sáng',
                        shiftTime: '06:00 - 14:00',
                        isCurrentShift: currentHour >= 6 && currentHour < 14
                    }, {
                        shiftType: 'afternoon',
                        shiftName: 'Ca Chiều',
                        shiftTime: '14:00 - 22:00',
                        isCurrentShift: currentHour >= 14 && currentHour < 22
                    }, {
                        shiftType: 'evening',
                        shiftName: 'Ca Đêm',
                        shiftTime: '22:00 - 06:00',
                        isCurrentShift: currentHour >= 22 || currentHour < 6
                    });
                    break;
            }
            return {
                isAssigned: true,
                role,
                assignedShifts,
                scheduleId: schedule.id
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy lịch phân công theo ngày:', error);
            return {
                isAssigned: false,
                role: 'Lỗi hệ thống',
                assignedShifts: [],
                scheduleId: null
            };
        }
    }
    async isUserAssignedToShift(userId, shiftType, date = new Date()) {
        const schedule = await this.getUserScheduleForDate(userId, date);
        if (!schedule.isAssigned) {
            return false;
        }
        return schedule.assignedShifts.some(shift => shift.shiftType === shiftType);
    }
};
exports.WorkScheduleService = WorkScheduleService;
exports.WorkScheduleService = WorkScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_schedule_entity_1.WorkSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WorkScheduleService);
//# sourceMappingURL=work-schedule.service.js.map