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
exports.NemsmReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nemsm_report_entity_1 = require("../entities/nemsm-report.entity");
let NemsmReportsService = class NemsmReportsService {
    nemsmReportRepository;
    constructor(nemsmReportRepository) {
        this.nemsmReportRepository = nemsmReportRepository;
    }
    async createNemsmReport(data) {
        const nemsmReport = new nemsm_report_entity_1.NemsmReport();
        nemsmReport.id_report_id = data.id_report_id;
        nemsmReport.id_nemsm = data.id_nemsm;
        nemsmReport.cpu = data.cpu ? 'true' : 'false';
        nemsmReport.memory = data.memory ? 'true' : 'false';
        nemsmReport.disk_space_used = data.disk_space_used ? 'true' : 'false';
        nemsmReport.network_traffic = data.network_traffic ? 'true' : 'false';
        nemsmReport.netstat = data.netstat ? 'true' : 'false';
        nemsmReport.notes = data.notes || '';
        return this.nemsmReportRepository.save(nemsmReport);
    }
    async createMultipleNemsmReports(reports) {
        const nemsmReports = reports.map(data => {
            const nemsmReport = new nemsm_report_entity_1.NemsmReport();
            nemsmReport.id_report_id = data.id_report_id;
            nemsmReport.id_nemsm = data.id_nemsm;
            nemsmReport.cpu = data.cpu ? 'true' : 'false';
            nemsmReport.memory = data.memory ? 'true' : 'false';
            nemsmReport.disk_space_used = data.disk_space_used ? 'true' : 'false';
            nemsmReport.network_traffic = data.network_traffic ? 'true' : 'false';
            nemsmReport.netstat = data.netstat ? 'true' : 'false';
            nemsmReport.notes = data.notes || '';
            return nemsmReport;
        });
        return this.nemsmReportRepository.save(nemsmReports);
    }
    async getNemsmReportsByReportId(reportId) {
        return this.nemsmReportRepository.find({
            where: { id_report_id: reportId },
            relations: ['server'],
            order: { id: 'ASC' }
        });
    }
    async getAllNemsmReports() {
        return this.nemsmReportRepository.find({
            relations: ['report', 'server'],
            order: { id: 'DESC' }
        });
    }
};
exports.NemsmReportsService = NemsmReportsService;
exports.NemsmReportsService = NemsmReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(nemsm_report_entity_1.NemsmReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NemsmReportsService);
//# sourceMappingURL=nemsm-reports.service.js.map