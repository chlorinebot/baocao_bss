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
exports.ApisixReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const apisix_report_entity_1 = require("../entities/apisix-report.entity");
let ApisixReportsService = class ApisixReportsService {
    apisixReportRepository;
    constructor(apisixReportRepository) {
        this.apisixReportRepository = apisixReportRepository;
    }
    async createApisixReport(data) {
        const apisixReport = new apisix_report_entity_1.ApisixReport();
        apisixReport.id_report_id = data.id_report_id;
        apisixReport.note_request = data.note_request || '';
        apisixReport.note_upstream = data.note_upstream || '';
        return this.apisixReportRepository.save(apisixReport);
    }
    async getApisixReportsByReportId(reportId) {
        return this.apisixReportRepository.find({
            where: { id_report_id: reportId },
            order: { id: 'ASC' }
        });
    }
    async getAllApisixReports() {
        return this.apisixReportRepository.find({
            relations: ['report'],
            order: { id: 'DESC' }
        });
    }
};
exports.ApisixReportsService = ApisixReportsService;
exports.ApisixReportsService = ApisixReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(apisix_report_entity_1.ApisixReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApisixReportsService);
//# sourceMappingURL=apisix-reports.service.js.map