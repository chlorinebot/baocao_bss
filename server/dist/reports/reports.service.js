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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("./entities/report.entity");
let ReportsService = class ReportsService {
    reportRepository;
    constructor(reportRepository) {
        this.reportRepository = reportRepository;
    }
    async createReport(createReportDto, userId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const existingReport = await this.reportRepository.findOne({
                where: {
                    userId,
                    date: today,
                },
            });
            if (existingReport) {
                throw new common_1.BadRequestException('Đã có báo cáo cho ngày hôm nay');
            }
            const report = this.reportRepository.create({
                ...createReportDto,
                userId,
                date: today,
                createdAt: new Date(),
            });
            return await this.reportRepository.save(report);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Không thể tạo báo cáo');
        }
    }
    async findAll(params) {
        const { userId, page, limit, startDate, endDate } = params;
        const whereCondition = { userId };
        if (startDate && endDate) {
            whereCondition.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        else if (startDate) {
            whereCondition.date = (0, typeorm_2.Between)(startDate, new Date().toISOString().split('T')[0]);
        }
        const [data, total] = await this.reportRepository.findAndCount({
            where: whereCondition,
            order: { date: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id, userId) {
        const report = await this.reportRepository.findOne({
            where: { id, userId },
        });
        if (!report) {
            throw new common_1.NotFoundException('Không tìm thấy báo cáo');
        }
        return report;
    }
    async remove(id, userId) {
        const report = await this.findOne(id, userId);
        await this.reportRepository.remove(report);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map