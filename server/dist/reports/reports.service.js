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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./report.entity");
const work_schedule_service_1 = require("../work-schedule/work-schedule.service");
let ReportsService = class ReportsService {
    reportRepository;
    workScheduleService;
    constructor(reportRepository, workScheduleService) {
        this.reportRepository = reportRepository;
        this.workScheduleService = workScheduleService;
    }
    async canCreateReport(userId) {
        try {
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
            const currentTime = currentHour * 60 + currentMinute;
            let currentShiftInfo = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
            if (!currentShiftInfo) {
                let canCreateInExtendedTime = false;
                let extendedShiftInfo = undefined;
                for (const shift of userSchedule.assignedShifts) {
                    let shiftEnd;
                    let allowedEndTime;
                    if (shift.shiftType === 'morning') {
                        shiftEnd = 14 * 60;
                        allowedEndTime = shiftEnd + 30;
                        if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            break;
                        }
                    }
                    else if (shift.shiftType === 'afternoon') {
                        shiftEnd = 22 * 60;
                        allowedEndTime = shiftEnd + 30;
                        if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            break;
                        }
                    }
                    else if (shift.shiftType === 'evening') {
                        if (currentHour < 6 || (currentHour === 6 && currentMinute <= 30)) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            break;
                        }
                    }
                }
                if (!canCreateInExtendedTime) {
                    const allowedTimes = userSchedule.assignedShifts.map(shift => {
                        if (shift.shiftType === 'morning') {
                            return '06:00 - 14:30';
                        }
                        else if (shift.shiftType === 'afternoon') {
                            return '14:00 - 22:30';
                        }
                        else {
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
                currentShiftInfo = extendedShiftInfo;
            }
            if (!currentShiftInfo) {
                return {
                    canCreate: false,
                    reason: 'Không thể xác định ca làm việc hiện tại',
                    isWorkingTime: false
                };
            }
            const shiftType = currentShiftInfo.shiftType;
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
        }
        catch (error) {
            console.error('Lỗi khi kiểm tra quyền tạo báo cáo:', error);
            return {
                canCreate: false,
                reason: 'Lỗi hệ thống khi kiểm tra quyền tạo báo cáo',
                isWorkingTime: false
            };
        }
    }
    translateShiftType(shiftType) {
        switch (shiftType) {
            case 'morning': return 'sáng';
            case 'afternoon': return 'chiều';
            case 'evening': return 'tối';
            default: return shiftType;
        }
    }
    getCurrentShiftType() {
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour < 14) {
            return 'morning';
        }
        else if (currentHour >= 14 && currentHour < 22) {
            return 'afternoon';
        }
        else {
            return 'evening';
        }
    }
    async createReport(id_user, content) {
        const permissionCheck = await this.canCreateReport(id_user);
        if (!permissionCheck.canCreate) {
            throw new common_1.ForbiddenException(permissionCheck.reason);
        }
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
    async getAllReports() {
        return this.reportRepository.find({ order: { created_at: 'DESC' } });
    }
    async getReportsByUserId(userId) {
        return this.reportRepository.find({
            where: { id_user: userId },
            order: { created_at: 'DESC' }
        });
    }
    async getReportsByShift(shiftType, date) {
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        work_schedule_service_1.WorkScheduleService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map