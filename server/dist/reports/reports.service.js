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
            console.log(`🔍 Bắt đầu kiểm tra quyền tạo báo cáo cho user ID: ${userId}`);
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
            const currentTime = currentHour * 60 + currentMinute;
            console.log(`⏰ Thời gian hiện tại: ${currentHour}:${currentMinute.toString().padStart(2, '0')} (${currentTime} phút)`);
            let currentShiftInfo = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
            console.log(`🎯 Ca làm việc hiện tại:`, currentShiftInfo);
            if (!currentShiftInfo) {
                console.log('🔄 Không có ca hiện tại, kiểm tra thời gian gia hạn...');
                let canCreateInExtendedTime = false;
                let extendedShiftInfo = undefined;
                for (const shift of userSchedule.assignedShifts) {
                    let shiftEnd;
                    let allowedEndTime;
                    if (shift.shiftType === 'morning') {
                        shiftEnd = 14 * 60;
                        allowedEndTime = shiftEnd + 30;
                        console.log(`📋 Kiểm tra ca sáng: kết thúc ${shiftEnd}, cho phép đến ${allowedEndTime}, hiện tại ${currentTime}`);
                        if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            console.log('✅ Trong thời gian gia hạn ca sáng');
                            break;
                        }
                    }
                    else if (shift.shiftType === 'afternoon') {
                        shiftEnd = 22 * 60;
                        allowedEndTime = shiftEnd + 30;
                        console.log(`📋 Kiểm tra ca chiều: kết thúc ${shiftEnd}, cho phép đến ${allowedEndTime}, hiện tại ${currentTime}`);
                        if (currentTime <= allowedEndTime && currentTime >= shiftEnd) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            console.log('✅ Trong thời gian gia hạn ca chiều');
                            break;
                        }
                    }
                    else if (shift.shiftType === 'evening') {
                        console.log(`📋 Kiểm tra ca đêm: giờ hiện tại ${currentHour}:${currentMinute}`);
                        if (currentHour < 6 || (currentHour === 6 && currentMinute <= 30)) {
                            canCreateInExtendedTime = true;
                            extendedShiftInfo = shift;
                            console.log('✅ Trong thời gian gia hạn ca đêm');
                            break;
                        }
                    }
                }
                if (!canCreateInExtendedTime) {
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
                    console.log(`❌ Ngoài thời gian cho phép. Thời gian hợp lệ: ${allowedTimes}`);
                    return {
                        canCreate: false,
                        reason: `Chỉ được phép tạo báo cáo trong ca làm việc và 30 phút sau ca. Thời gian cho phép: ${allowedTimes}`,
                        currentShift: userSchedule.assignedShifts[0]?.shiftName,
                        shiftTime: userSchedule.assignedShifts[0]?.shiftTime,
                        isWorkingTime: false
                    };
                }
                currentShiftInfo = extendedShiftInfo;
                console.log('⏰ Sử dụng thông tin ca gia hạn:', currentShiftInfo);
            }
            if (!currentShiftInfo) {
                console.log('❌ Không thể xác định ca làm việc hiện tại');
                return {
                    canCreate: false,
                    reason: 'Không thể xác định ca làm việc hiện tại',
                    isWorkingTime: false
                };
            }
            const shiftType = currentShiftInfo.shiftType;
            console.log(`🎯 Kiểm tra báo cáo đã tồn tại cho ca: ${shiftType}`);
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
        }
        catch (error) {
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
    translateShiftType(shiftType) {
        switch (shiftType) {
            case 'morning': return 'sáng';
            case 'afternoon': return 'chiều';
            case 'evening': return 'tối';
            default: return shiftType;
        }
    }
    async createReport(id_user, content) {
        console.log(`🚀 Bắt đầu tạo báo cáo cho user ID: ${id_user}`);
        console.log(`📝 Nội dung báo cáo:`, content?.substring(0, 200) + (content?.length > 200 ? '...' : ''));
        try {
            const permissionCheck = await this.canCreateReport(id_user);
            console.log(`🔐 Kết quả kiểm tra quyền:`, permissionCheck);
            if (!permissionCheck.canCreate) {
                console.log(`❌ Từ chối tạo báo cáo: ${permissionCheck.reason}`);
                throw new common_1.ForbiddenException(permissionCheck.reason);
            }
            const today = new Date();
            const userSchedule = await this.workScheduleService.getUserScheduleForDate(id_user, today);
            const currentShift = userSchedule.assignedShifts.find(shift => shift.isCurrentShift);
            if (!currentShift) {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentTime = currentHour * 60 + currentMinute;
                for (const shift of userSchedule.assignedShifts) {
                    let shiftEnd;
                    let allowedEndTime;
                    if (shift.shiftType === 'morning') {
                        shiftEnd = 14 * 60;
                        allowedEndTime = shiftEnd + 30;
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
                    }
                    else if (shift.shiftType === 'afternoon') {
                        shiftEnd = 22 * 60;
                        allowedEndTime = shiftEnd + 30;
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
                    }
                    else if (shift.shiftType === 'evening') {
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
                throw new common_1.ForbiddenException('Không thể xác định ca làm việc để tạo báo cáo');
            }
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
        }
        catch (error) {
            console.error(`❌ Lỗi khi tạo báo cáo cho user ${id_user}:`, error);
            console.error(`❌ Chi tiết lỗi:`, {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : 'Unknown'
            });
            throw error;
        }
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