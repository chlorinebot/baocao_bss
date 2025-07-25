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
exports.ApisixReportsController = void 0;
const common_1 = require("@nestjs/common");
const apisix_reports_service_1 = require("./apisix-reports.service");
let ApisixReportsController = class ApisixReportsController {
    apisixReportsService;
    constructor(apisixReportsService) {
        this.apisixReportsService = apisixReportsService;
    }
    async createApisixReport(body) {
        try {
            const { reportId, apisixData } = body;
            const apisixReport = {
                id_report_id: reportId,
                note_request: apisixData.note_request,
                note_upstream: apisixData.note_upstream
            };
            const savedReport = await this.apisixReportsService.createApisixReport(apisixReport);
            return {
                success: true,
                message: 'Dữ liệu Apache APISIX đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Apache APISIX:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Apache APISIX',
                error: error.message
            };
        }
    }
    async createSingleApisixReport(body) {
        try {
            const savedReport = await this.apisixReportsService.createApisixReport(body);
            return {
                success: true,
                message: 'Dữ liệu Apache APISIX đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Apache APISIX:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Apache APISIX',
                error: error.message
            };
        }
    }
    async getAllApisixReports() {
        try {
            const reports = await this.apisixReportsService.getAllApisixReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Apache APISIX reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Apache APISIX reports',
                error: error.message
            };
        }
    }
    async getApisixReportsByReportId(reportId) {
        try {
            const reports = await this.apisixReportsService.getApisixReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Apache APISIX reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Apache APISIX reports',
                error: error.message
            };
        }
    }
};
exports.ApisixReportsController = ApisixReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApisixReportsController.prototype, "createApisixReport", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApisixReportsController.prototype, "createSingleApisixReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApisixReportsController.prototype, "getAllApisixReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ApisixReportsController.prototype, "getApisixReportsByReportId", null);
exports.ApisixReportsController = ApisixReportsController = __decorate([
    (0, common_1.Controller)('apisix-reports'),
    __metadata("design:paramtypes", [apisix_reports_service_1.ApisixReportsService])
], ApisixReportsController);
//# sourceMappingURL=apisix-reports.controller.js.map