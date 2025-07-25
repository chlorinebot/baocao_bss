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
exports.HeartbeatReportsController = void 0;
const common_1 = require("@nestjs/common");
const heartbeat_reports_service_1 = require("./heartbeat-reports.service");
let HeartbeatReportsController = class HeartbeatReportsController {
    heartbeatReportsService;
    constructor(heartbeatReportsService) {
        this.heartbeatReportsService = heartbeatReportsService;
    }
    async createHeartbeatReports(body) {
        try {
            const { reportId, heartbeatData } = body;
            const heartbeatReports = heartbeatData.map(data => ({
                id_report_id: reportId,
                row_index: data.rowIndex,
                heartbeat_86: data.heartbeat_86,
                heartbeat_87: data.heartbeat_87,
                heartbeat_88: data.heartbeat_88,
                notes: data.notes
            }));
            const savedReports = await this.heartbeatReportsService.createMultipleHeartbeatReports(heartbeatReports);
            return {
                success: true,
                message: 'Dữ liệu PostgreHeartbeat đã được lưu thành công',
                data: savedReports
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu PostgreHeartbeat:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreHeartbeat',
                error: error.message
            };
        }
    }
    async createSingleHeartbeatReport(body) {
        try {
            const savedReport = await this.heartbeatReportsService.createHeartbeatReport(body);
            return {
                success: true,
                message: 'Dữ liệu PostgreHeartbeat đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu PostgreHeartbeat:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreHeartbeat',
                error: error.message
            };
        }
    }
    async getAllHeartbeatReports() {
        try {
            const reports = await this.heartbeatReportsService.getAllHeartbeatReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu PostgreHeartbeat reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreHeartbeat reports',
                error: error.message
            };
        }
    }
    async getHeartbeatReportsByReportId(reportId) {
        try {
            const reports = await this.heartbeatReportsService.getHeartbeatReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu PostgreHeartbeat reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreHeartbeat reports',
                error: error.message
            };
        }
    }
};
exports.HeartbeatReportsController = HeartbeatReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HeartbeatReportsController.prototype, "createHeartbeatReports", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HeartbeatReportsController.prototype, "createSingleHeartbeatReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HeartbeatReportsController.prototype, "getAllHeartbeatReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], HeartbeatReportsController.prototype, "getHeartbeatReportsByReportId", null);
exports.HeartbeatReportsController = HeartbeatReportsController = __decorate([
    (0, common_1.Controller)('heartbeat-reports'),
    __metadata("design:paramtypes", [heartbeat_reports_service_1.HeartbeatReportsService])
], HeartbeatReportsController);
//# sourceMappingURL=heartbeat-reports.controller.js.map