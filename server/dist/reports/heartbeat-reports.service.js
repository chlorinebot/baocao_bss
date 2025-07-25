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
exports.HeartbeatReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const heartbeat_report_entity_1 = require("../entities/heartbeat-report.entity");
let HeartbeatReportsService = class HeartbeatReportsService {
    heartbeatReportRepository;
    constructor(heartbeatReportRepository) {
        this.heartbeatReportRepository = heartbeatReportRepository;
    }
    async createHeartbeatReport(data) {
        const heartbeatReport = new heartbeat_report_entity_1.HeartbeatReport();
        heartbeatReport.id_report_id = data.id_report_id;
        heartbeatReport.row_index = data.row_index;
        heartbeatReport.heartbeat_86 = data.heartbeat_86 ? 'true' : 'false';
        heartbeatReport.heartbeat_87 = data.heartbeat_87 ? 'true' : 'false';
        heartbeatReport.heartbeat_88 = data.heartbeat_88 ? 'true' : 'false';
        heartbeatReport.notes = data.notes || '';
        return this.heartbeatReportRepository.save(heartbeatReport);
    }
    async createMultipleHeartbeatReports(reports) {
        const heartbeatReports = reports.map(data => {
            const heartbeatReport = new heartbeat_report_entity_1.HeartbeatReport();
            heartbeatReport.id_report_id = data.id_report_id;
            heartbeatReport.row_index = data.row_index;
            heartbeatReport.heartbeat_86 = data.heartbeat_86 ? 'true' : 'false';
            heartbeatReport.heartbeat_87 = data.heartbeat_87 ? 'true' : 'false';
            heartbeatReport.heartbeat_88 = data.heartbeat_88 ? 'true' : 'false';
            heartbeatReport.notes = data.notes || '';
            return heartbeatReport;
        });
        return this.heartbeatReportRepository.save(heartbeatReports);
    }
    async getHeartbeatReportsByReportId(reportId) {
        return this.heartbeatReportRepository.find({
            where: { id_report_id: reportId },
            order: { row_index: 'ASC' }
        });
    }
    async getAllHeartbeatReports() {
        return this.heartbeatReportRepository.find({
            relations: ['report'],
            order: { id: 'DESC' }
        });
    }
};
exports.HeartbeatReportsService = HeartbeatReportsService;
exports.HeartbeatReportsService = HeartbeatReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(heartbeat_report_entity_1.HeartbeatReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HeartbeatReportsService);
//# sourceMappingURL=heartbeat-reports.service.js.map