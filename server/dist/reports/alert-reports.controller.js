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
exports.AlertReportsController = void 0;
const common_1 = require("@nestjs/common");
const alert_reports_service_1 = require("./alert-reports.service");
let AlertReportsController = class AlertReportsController {
    alertReportsService;
    constructor(alertReportsService) {
        this.alertReportsService = alertReportsService;
    }
    async createAlertReport(body) {
        try {
            const { reportId, alertData } = body;
            const alertReport = {
                id_report_id: reportId,
                note_alert_1: alertData.note_alert_1,
                note_alert_2: alertData.note_alert_2
            };
            const savedReport = await this.alertReportsService.createAlertReport(alertReport);
            return {
                success: true,
                message: 'Dữ liệu Cảnh báo đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Cảnh báo:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Cảnh báo',
                error: error.message
            };
        }
    }
    async createSingleAlertReport(body) {
        try {
            const savedReport = await this.alertReportsService.createAlertReport(body);
            return {
                success: true,
                message: 'Dữ liệu Cảnh báo đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Cảnh báo:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Cảnh báo',
                error: error.message
            };
        }
    }
    async getAllAlertReports() {
        try {
            const reports = await this.alertReportsService.getAllAlertReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Cảnh báo reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Cảnh báo reports',
                error: error.message
            };
        }
    }
    async getAlertReportsByReportId(reportId) {
        try {
            const reports = await this.alertReportsService.getAlertReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Cảnh báo reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Cảnh báo reports',
                error: error.message
            };
        }
    }
};
exports.AlertReportsController = AlertReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertReportsController.prototype, "createAlertReport", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AlertReportsController.prototype, "createSingleAlertReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertReportsController.prototype, "getAllAlertReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AlertReportsController.prototype, "getAlertReportsByReportId", null);
exports.AlertReportsController = AlertReportsController = __decorate([
    (0, common_1.Controller)('alert-reports'),
    __metadata("design:paramtypes", [alert_reports_service_1.AlertReportsService])
], AlertReportsController);
//# sourceMappingURL=alert-reports.controller.js.map