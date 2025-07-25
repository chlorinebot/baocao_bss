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
exports.TransactionReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_report_entity_1 = require("../entities/transaction-report.entity");
let TransactionReportsService = class TransactionReportsService {
    transactionReportRepository;
    constructor(transactionReportRepository) {
        this.transactionReportRepository = transactionReportRepository;
    }
    async createTransactionReport(data) {
        const transactionReport = new transaction_report_entity_1.TransactionReport();
        transactionReport.id_report_id = data.id_report_id;
        transactionReport.row_index = data.row_index;
        transactionReport.transaction_monitored = data.transaction_monitored ? 'true' : 'false';
        transactionReport.notes = data.notes || '';
        return this.transactionReportRepository.save(transactionReport);
    }
    async createMultipleTransactionReports(reports) {
        const transactionReports = reports.map(data => {
            const transactionReport = new transaction_report_entity_1.TransactionReport();
            transactionReport.id_report_id = data.id_report_id;
            transactionReport.row_index = data.row_index;
            transactionReport.transaction_monitored = data.transaction_monitored ? 'true' : 'false';
            transactionReport.notes = data.notes || '';
            return transactionReport;
        });
        return this.transactionReportRepository.save(transactionReports);
    }
    async getTransactionReportsByReportId(reportId) {
        return this.transactionReportRepository.find({
            where: { id_report_id: reportId },
            order: { row_index: 'ASC' }
        });
    }
    async getAllTransactionReports() {
        return this.transactionReportRepository.find({
            relations: ['report'],
            order: { id: 'DESC' }
        });
    }
};
exports.TransactionReportsService = TransactionReportsService;
exports.TransactionReportsService = TransactionReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_report_entity_1.TransactionReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionReportsService);
//# sourceMappingURL=transaction-reports.service.js.map