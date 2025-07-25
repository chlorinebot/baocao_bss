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
exports.TransactionReportsController = void 0;
const common_1 = require("@nestjs/common");
const transaction_reports_service_1 = require("./transaction-reports.service");
let TransactionReportsController = class TransactionReportsController {
    transactionReportsService;
    constructor(transactionReportsService) {
        this.transactionReportsService = transactionReportsService;
    }
    async createTransactionReports(body) {
        try {
            const { reportId, transactionData } = body;
            const transactionReports = transactionData.map(data => ({
                id_report_id: reportId,
                row_index: data.rowIndex,
                transaction_monitored: data.transaction_monitored,
                notes: data.notes
            }));
            const savedReports = await this.transactionReportsService.createMultipleTransactionReports(transactionReports);
            return {
                success: true,
                message: 'Dữ liệu Database Transactions đã được lưu thành công',
                data: savedReports
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Database Transactions:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Database Transactions',
                error: error.message
            };
        }
    }
    async createSingleTransactionReport(body) {
        try {
            const savedReport = await this.transactionReportsService.createTransactionReport(body);
            return {
                success: true,
                message: 'Dữ liệu Database Transactions đã được lưu thành công',
                data: savedReport
            };
        }
        catch (error) {
            console.error('Lỗi khi lưu dữ liệu Database Transactions:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lưu dữ liệu Database Transactions',
                error: error.message
            };
        }
    }
    async getAllTransactionReports() {
        try {
            const reports = await this.transactionReportsService.getAllTransactionReports();
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Database Transactions reports:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Database Transactions reports',
                error: error.message
            };
        }
    }
    async getTransactionReportsByReportId(reportId) {
        try {
            const reports = await this.transactionReportsService.getTransactionReportsByReportId(reportId);
            return {
                success: true,
                data: reports
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy dữ liệu Database Transactions reports theo report ID:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy dữ liệu Database Transactions reports',
                error: error.message
            };
        }
    }
};
exports.TransactionReportsController = TransactionReportsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionReportsController.prototype, "createTransactionReports", null);
__decorate([
    (0, common_1.Post)('single'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransactionReportsController.prototype, "createSingleTransactionReport", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TransactionReportsController.prototype, "getAllTransactionReports", null);
__decorate([
    (0, common_1.Get)('by-report/:reportId'),
    __param(0, (0, common_1.Param)('reportId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TransactionReportsController.prototype, "getTransactionReportsByReportId", null);
exports.TransactionReportsController = TransactionReportsController = __decorate([
    (0, common_1.Controller)('transaction-reports'),
    __metadata("design:paramtypes", [transaction_reports_service_1.TransactionReportsService])
], TransactionReportsController);
//# sourceMappingURL=transaction-reports.controller.js.map