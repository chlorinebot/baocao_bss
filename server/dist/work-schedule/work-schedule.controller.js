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
exports.WorkScheduleController = void 0;
const common_1 = require("@nestjs/common");
const work_schedule_service_1 = require("./work-schedule.service");
let WorkScheduleController = class WorkScheduleController {
    workScheduleService;
    constructor(workScheduleService) {
        this.workScheduleService = workScheduleService;
    }
    async findAll() {
        try {
            const schedules = await this.workScheduleService.findAll();
            return {
                success: true,
                message: 'Lấy danh sách phân công thành công',
                data: schedules
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách phân công',
                error: error.message
            };
        }
    }
    async getEmployeeRoles() {
        try {
            const roles = await this.workScheduleService.getEmployeeRoles();
            return {
                success: true,
                message: 'Lấy vai trò nhân viên thành công',
                data: roles
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy vai trò nhân viên',
                error: error.message
            };
        }
    }
    async findByDate(date) {
        try {
            const schedules = await this.workScheduleService.findByDate(date);
            return {
                success: true,
                message: 'Lấy phân công theo ngày thành công',
                data: schedules
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy phân công theo ngày',
                error: error.message
            };
        }
    }
    async getAvailableEmployees() {
        try {
            const employees = await this.workScheduleService.getAvailableEmployees();
            return {
                success: true,
                message: 'Lấy danh sách nhân viên thành công',
                data: employees
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy danh sách nhân viên',
                error: error.message
            };
        }
    }
    async getUserRole(userId) {
        try {
            const userRole = await this.workScheduleService.getUserRole(userId);
            return {
                success: true,
                message: 'Lấy vai trò phân công thành công',
                data: userRole
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy vai trò phân công',
                error: error.message
            };
        }
    }
    async getUserCurrentShift(userId) {
        try {
            const shiftInfo = await this.workScheduleService.getUserCurrentShift(userId);
            return {
                success: true,
                message: 'Lấy thông tin ca trực thành công',
                data: shiftInfo
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin ca trực',
                error: error.message
            };
        }
    }
    async clearAllWorkSchedules() {
        try {
            console.log('🗑️ DEBUG: Xóa tất cả work_schedule');
            await this.workScheduleService.clearAllWorkSchedules();
            return {
                success: true,
                message: 'Đã xóa tất cả work_schedule'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi xóa work_schedule',
                error: error.message
            };
        }
    }
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getScheduleStats(startDate, endDate) {
        try {
            const stats = await this.workScheduleService.getScheduleStats(startDate, endDate);
            return {
                success: true,
                message: 'Lấy thống kê phân công thành công',
                data: stats
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy thống kê phân công',
                error: error.message
            };
        }
    }
    async findOne(id) {
        try {
            const schedule = await this.workScheduleService.findOne(id);
            return {
                success: true,
                message: 'Lấy thông tin phân công thành công',
                data: schedule
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi lấy thông tin phân công',
                error: error.message
            };
        }
    }
    async create(createWorkScheduleDto) {
        try {
            const schedule = await this.workScheduleService.create(createWorkScheduleDto);
            return {
                success: true,
                message: 'Tạo phân công thành công',
                data: schedule
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi tạo phân công',
                error: error.message
            };
        }
    }
    async update(id, updateWorkScheduleDto) {
        try {
            const schedule = await this.workScheduleService.update(id, updateWorkScheduleDto);
            return {
                success: true,
                message: 'Cập nhật phân công thành công',
                data: schedule
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi cập nhật phân công',
                error: error.message
            };
        }
    }
    async remove(id) {
        try {
            await this.workScheduleService.remove(id);
            return {
                success: true,
                message: 'Xóa phân công thành công'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Lỗi khi xóa phân công',
                error: error.message
            };
        }
    }
};
exports.WorkScheduleController = WorkScheduleController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('roles'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "getEmployeeRoles", null);
__decorate([
    (0, common_1.Get)('date/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)('employees/available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "getAvailableEmployees", null);
__decorate([
    (0, common_1.Get)('user/:userId/role'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "getUserRole", null);
__decorate([
    (0, common_1.Get)('user/:userId/current-shift'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "getUserCurrentShift", null);
__decorate([
    (0, common_1.Delete)('debug/clear-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "clearAllWorkSchedules", null);
__decorate([
    (0, common_1.Get)('debug/check-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "debugCheckDatabase", null);
__decorate([
    (0, common_1.Post)('debug/create-yesterday-schedule'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "createYesterdaySchedule", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "getScheduleStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WorkScheduleController.prototype, "remove", null);
exports.WorkScheduleController = WorkScheduleController = __decorate([
    (0, common_1.Controller)('work-schedule'),
    __metadata("design:paramtypes", [work_schedule_service_1.WorkScheduleService])
], WorkScheduleController);
//# sourceMappingURL=work-schedule.controller.js.map