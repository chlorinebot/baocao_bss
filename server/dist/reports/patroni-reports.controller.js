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
exports.PatroniReportsController = void 0;
const common_1 = require("@nestjs/common");
const patroni_reports_service_1 = require("./patroni-reports.service");
let PatroniReportsController = class PatroniReportsController {
    patroniReportsService;
    constructor(patroniReportsService) {
        this.patroniReportsService = patroniReportsService;
    }
    async createPatroniReports(body) {
        try {
            const { reportId, patroniData } = body;
            const patroniReports = patroniData.map(data => ({
                id_report_id: reportId,
                row_index: data.rowIndex,
                primary_node: data.primary_node,
                wal_replay_paused: data.wal_replay_paused,
                replicas_received_wal: data.replicas_received_wal,
                primary_wal_location: data.primary_wal_location,
                replicas_replayed_wal: data.replicas_replayed_wal,
                notes: data.notes
            }));
            const savedReports = await this.patroniReportsService.createMultiplePatroniReports(patroniReports);
            return {
                success: true,
                message: 'Dữ liệu PostgreSQL Patroni đã được lưu thành công',
                data: savedReports
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu PostgreSQL Patroni:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreSQL Patroni',
                error: error.message
            };
        }
    }
    async createSinglePatroniReport(body) {
        try {
            const savedReport = await this.patroniReportsService.createPatroniReport(body);
            return {
                success: true,
                message: 'Dữ liệu PostgreSQL Patroni đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu PostgreSQL Patroni:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu PostgreSQL Patroni',
                error: error.message
            };
        }
    }
    async getAllPatroniReports() {
        try {
            const reports = await this.patroniReportsService.getAllPatroniReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu PostgreSQL Patroni reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreSQL Patroni reports',
                error: error.message
            };
        }
    }
    async getPatroniReportsByReportId(reportId) {
        try {
            const reports = await this.patroniReportsService.getPatroniReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu PostgreSQL Patroni reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu PostgreSQL Patroni reports',
                error: error.message
            };
        }
    }
};
exports.PatroniReportsController = PatroniReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatroniReportsController.prototype, "createPatroniReports", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatroniReportsController.prototype, "createSinglePatroniReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PatroniReportsController.prototype, "getAllPatroniReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PatroniReportsController.prototype, "getPatroniReportsByReportId", null);
exports.PatroniReportsController = PatroniReportsController = __decorate([
    (0, common_1.Controller)('patroni-reports'),
    __metadata("design:paramtypes", [patroni_reports_service_1.PatroniReportsService])
], PatroniReportsController);
//# sourceMappingURL=patroni-reports.controller.js.map