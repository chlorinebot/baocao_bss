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
exports.PatroniReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const patroni_report_entity_1 = require("../entities/patroni-report.entity");
let PatroniReportsService = class PatroniReportsService {
    patroniReportRepository;
    constructor(patroniReportRepository) {
        this.patroniReportRepository = patroniReportRepository;
    }
    async createPatroniReport(data) {
        const patroniReport = new patroni_report_entity_1.PatroniReport();
        patroniReport.id_report_id = data.id_report_id;
        patroniReport.row_index = data.row_index;
        patroniReport.primary_node = data.primary_node ? 'true' : 'false';
        patroniReport.wal_replay_paused = data.wal_replay_paused ? 'true' : 'false';
        patroniReport.replicas_received_wal = data.replicas_received_wal ? 'true' : 'false';
        patroniReport.primary_wal_location = data.primary_wal_location ? 'true' : 'false';
        patroniReport.replicas_replayed_wal = data.replicas_replayed_wal ? 'true' : 'false';
        patroniReport.notes = data.notes || '';
        return this.patroniReportRepository.save(patroniReport);
    }
    async createMultiplePatroniReports(reports) {
        const patroniReports = reports.map(data => {
            const patroniReport = new patroni_report_entity_1.PatroniReport();
            patroniReport.id_report_id = data.id_report_id;
            patroniReport.row_index = data.row_index;
            patroniReport.primary_node = data.primary_node ? 'true' : 'false';
            patroniReport.wal_replay_paused = data.wal_replay_paused ? 'true' : 'false';
            patroniReport.replicas_received_wal = data.replicas_received_wal ? 'true' : 'false';
            patroniReport.primary_wal_location = data.primary_wal_location ? 'true' : 'false';
            patroniReport.replicas_replayed_wal = data.replicas_replayed_wal ? 'true' : 'false';
            patroniReport.notes = data.notes || '';
            return patroniReport;
        });
        return this.patroniReportRepository.save(patroniReports);
    }
    async getPatroniReportsByReportId(reportId) {
        return this.patroniReportRepository.find({
            where: { id_report_id: reportId },
            order: { row_index: 'ASC' }
        });
    }
    async getAllPatroniReports() {
        return this.patroniReportRepository.find({
            relations: ['report'],
            order: { id: 'DESC' }
        });
    }
};
exports.PatroniReportsService = PatroniReportsService;
exports.PatroniReportsService = PatroniReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(patroni_report_entity_1.PatroniReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PatroniReportsService);
//# sourceMappingURL=patroni-reports.service.js.map