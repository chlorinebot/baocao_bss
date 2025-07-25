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
exports.NemsmReportsController = void 0;
const common_1 = require("@nestjs/common");
const nemsm_reports_service_1 = require("./nemsm-reports.service");
let NemsmReportsController = class NemsmReportsController {
    nemsmReportsService;
    constructor(nemsmReportsService) {
        this.nemsmReportsService = nemsmReportsService;
    }
    async createNemsmReports(body) {
        try {
            const { reportId, nemsmData } = body;
            const nemsmReports = nemsmData.map(data => ({
                id_report_id: reportId,
                id_nemsm: data.serverId,
                cpu: data.cpu,
                memory: data.memory,
                disk_space_used: data.disk,
                network_traffic: data.network,
                netstat: data.netstat,
                notes: data.notes
            }));
            const savedReports = await this.nemsmReportsService.createMultipleNemsmReports(nemsmReports);
            return {
                success: true,
                message: 'Dữ liệu NEMSM đã được lưu thành công',
                data: savedReports
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu NEMSM:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu NEMSM',
                error: error.message
            };
        }
    }
    async createSingleNemsmReport(body) {
        try {
            const savedReport = await this.nemsmReportsService.createNemsmReport(body);
            return {
                success: true,
                message: 'Dữ liệu NEMSM đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu NEMSM:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu NEMSM',
                error: error.message
            };
        }
    }
    async getAllNemsmReports() {
        try {
            const reports = await this.nemsmReportsService.getAllNemsmReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu NEMSM reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu NEMSM reports',
                error: error.message
            };
        }
    }
    async getNemsmReportsByReportId(reportId) {
        try {
            const reports = await this.nemsmReportsService.getNemsmReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu NEMSM reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu NEMSM reports',
                error: error.message
            };
        }
    }
};
exports.NemsmReportsController = NemsmReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NemsmReportsController.prototype, "createNemsmReports", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NemsmReportsController.prototype, "createSingleNemsmReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NemsmReportsController.prototype, "getAllNemsmReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NemsmReportsController.prototype, "getNemsmReportsByReportId", null);
exports.NemsmReportsController = NemsmReportsController = __decorate([
    (0, common_1.Controller)('nemsm-reports'),
    __metadata("design:paramtypes", [nemsm_reports_service_1.NemsmReportsService])
], NemsmReportsController);
//# sourceMappingURL=nemsm-reports.controller.js.map