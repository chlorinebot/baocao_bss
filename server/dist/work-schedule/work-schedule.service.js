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
const typeorm_3 = require("typeorm");
let WorkScheduleService = class WorkScheduleService {
    workScheduleRepository;
    userRepository;
    dataSource;
    constructor(workScheduleRepository, userRepository, dataSource) {
        this.workScheduleRepository = workScheduleRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
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
            console.log(`🔍 getUserRole: Lấy vai trò cho user ${userId}`);
            console.log(`📊 DEBUG: User ID đang request = ${userId}`);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            let searchDate = new Date();
            if (currentHour < 6 || (currentHour === 6 && currentMinute < 30)) {
                searchDate.setDate(searchDate.getDate() - 1);
                console.log(`🌙 Đang trong ca đêm, tìm schedule của ngày hôm trước: ${searchDate.toISOString().split('T')[0]}`);
            }
            searchDate.setHours(0, 0, 0, 0);
            console.log(`📅 Ngày hiện tại (raw): ${new Date().toISOString()}`);
            console.log(`📅 Ngày tìm kiếm: ${searchDate.toISOString().split('T')[0]}`);
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
                    let scheduleData = [];
                    if (monthlySchedule.schedule_data) {
                        if (typeof monthlySchedule.schedule_data === 'string') {
                            scheduleData = JSON.parse(monthlySchedule.schedule_data);
                        }
                        else if (Array.isArray(monthlySchedule.schedule_data)) {
                            scheduleData = monthlySchedule.schedule_data;
                        }
                    }
                    const daySchedule = scheduleData.find((day) => day.date === currentDay);
                    if (daySchedule && daySchedule.shifts) {
                        console.log(`🎯 Tìm thấy schedule cho ngày ${currentDay}:`, JSON.stringify(daySchedule, null, 2));
                        console.log(`🔍 Kiểm tra mapping cho user ${userId}:`);
                        console.log(`  Morning role: ${daySchedule.shifts.morning?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.morning?.role, searchDate)}`);
                        console.log(`  Afternoon role: ${daySchedule.shifts.afternoon?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.afternoon?.role, searchDate)}`);
                        console.log(`  Evening role: ${daySchedule.shifts.evening?.role} → userId: ${await this.getUserByRole(daySchedule.shifts.evening?.role, searchDate)}`);
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
                        console.log(`😴 User ${userId} nghỉ ngày ${currentDay} theo monthly_work_schedules`);
                        return { role: 'Nghỉ', scheduleId: monthlySchedule.id };
                    }
                }
            }
            catch (error) {
                console.error(`❌ Lỗi khi query monthly_work_schedules:`, error);
            }
            console.log(`❌ Không tìm thấy dữ liệu trong monthly_work_schedules`);
            return { role: 'Chưa được phân công', scheduleId: null };
        }
        catch (error) {
            console.error(`❌ Lỗi khi lấy vai trò user ${userId}:`, error);
            return { role: 'Chưa được phân công', scheduleId: null };
        }
    }
    async getUserCurrentShift(userId) {
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
        console.log(`😴 User ${userId} nghỉ ngày hôm nay`);
        return {
            role: userSchedule.role,
            shift: 'Nghỉ',
            shiftTime: 'Nghỉ ngày hôm nay',
            scheduleId: userSchedule.scheduleId
        };
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
            console.log(`📅 WorkScheduleService: Lấy lịch làm việc cho user ${userId} ngày ${date.toISOString().split('T')[0]}`);
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            let targetDate = new Date(date);
            if ((currentHour < 6 || (currentHour === 6 && currentMinute < 30)) &&
                date.toDateString() === now.toDateString()) {
                targetDate.setDate(targetDate.getDate() - 1);
                console.log(`🌙 Đang trong ca đêm, tìm schedule của ngày hôm trước: ${targetDate.toISOString().split('T')[0]}`);
            }
            targetDate.setHours(0, 0, 0, 0);
            const currentMonth = targetDate.getMonth() + 1;
            const currentYear = targetDate.getFullYear();
            const currentDay = targetDate.getDate();
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
                console.log(`📋 Monthly schedule result:`, monthlyResult);
                if (monthlyResult && monthlyResult.length > 0) {
                    const monthlySchedule = monthlyResult[0];
                    console.log(`✅ Tìm thấy monthly_work_schedules ID: ${monthlySchedule.id}`);
                    let scheduleData = [];
                    if (monthlySchedule.schedule_data) {
                        if (typeof monthlySchedule.schedule_data === 'string') {
                            scheduleData = JSON.parse(monthlySchedule.schedule_data);
                        }
                        else if (Array.isArray(monthlySchedule.schedule_data)) {
                            scheduleData = monthlySchedule.schedule_data;
                        }
                    }
                    console.log(`📊 Schedule data length: ${scheduleData.length}`);
                    const daySchedule = scheduleData.find((day) => day.date === currentDay);
                    if (daySchedule && daySchedule.shifts) {
                        console.log(`🎯 Tìm thấy schedule cho ngày ${currentDay}:`, daySchedule);
                        let userRole = '';
                        let userRoleName = '';
                        if (daySchedule.shifts.morning && (await this.getUserByRole(daySchedule.shifts.morning.role, targetDate)) === userId) {
                            userRole = daySchedule.shifts.morning.role;
                            userRoleName = daySchedule.shifts.morning.employee_name || `Nhân viên ${userRole}`;
                        }
                        else if (daySchedule.shifts.afternoon && (await this.getUserByRole(daySchedule.shifts.afternoon.role, targetDate)) === userId) {
                            userRole = daySchedule.shifts.afternoon.role;
                            userRoleName = daySchedule.shifts.afternoon.employee_name || `Nhân viên ${userRole}`;
                        }
                        else if (daySchedule.shifts.evening && (await this.getUserByRole(daySchedule.shifts.evening.role, targetDate)) === userId) {
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
                        const assignedShifts = [];
                        const currentHour = now.getHours();
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
                    }
                    else {
                        console.log(`😴 Không có schedule cho ngày ${currentDay} trong monthly_work_schedules`);
                    }
                }
                else {
                    console.log(`❌ Không có monthly_work_schedules cho tháng ${currentMonth}/${currentYear}`);
                }
            }
            catch (error) {
                console.error(`❌ Lỗi khi query monthly_work_schedules:`, error);
            }
            console.log(`❌ Không tìm thấy dữ liệu trong monthly_work_schedules → Chưa được phân công ca làm việc`);
            return {
                isAssigned: false,
                role: 'Chưa được phân công ca làm việc',
                assignedShifts: [],
                scheduleId: null
            };
        }
        catch (error) {
            console.error(`❌ Lỗi getUserScheduleForDate:`, error);
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
    async getUserByRole(role, searchDate) {
        try {
            const searchDateStr = searchDate.toISOString().split('T')[0];
            console.log(`🔍 DEBUG getUserByRole: Tìm work_schedule cho ngày ${searchDateStr}`);
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
        }
        catch (error) {
            console.error(`❌ Lỗi khi lấy mapping role ${role}:`, error);
            return null;
        }
    }
    async clearAllWorkSchedules() {
        console.log('🗑️ Xóa tất cả records trong work_schedule');
        await this.workScheduleRepository.clear();
    }
};
exports.WorkScheduleService = WorkScheduleService;
exports.WorkScheduleService = WorkScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_schedule_entity_1.WorkSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_3.DataSource])
], WorkScheduleService);
//# sourceMappingURL=work-schedule.service.js.map