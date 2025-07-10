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
const report_entity_1 = require("../entities/report.entity");
let ReportsService = class ReportsService {
    reportRepository;
    constructor(reportRepository) {
        this.reportRepository = reportRepository;
    }
    async create(createReportDto, userId) {
        try {
            console.log('Creating report in service with data:', {
                dto: createReportDto,
                userId
            });
            const reportData = {
                ...createReportDto,
                createdBy: userId,
                reportDate: new Date(createReportDto.reportDate),
                isActive: true,
                status: createReportDto.status ?? 'draft',
                generalNote: createReportDto.generalNote ?? null
            };
            console.log('Prepared report data:', reportData);
            const report = this.reportRepository.create(reportData);
            console.log('Created report entity:', report);
            const savedReport = await this.reportRepository.save(report);
            console.log('Saved report:', savedReport);
            const finalReport = await this.findOne(savedReport.id);
            console.log('Final report with relations:', finalReport);
            return finalReport;
        }
        catch (error) {
            console.error('Detailed error in create service:', {
                error: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }
    async findAll(userId) {
        const queryBuilder = this.reportRepository.createQueryBuilder('report')
            .leftJoinAndSelect('report.creator', 'creator')
            .leftJoinAndSelect('report.approver', 'approver')
            .where('report.isActive = :isActive', { isActive: true })
            .orderBy('report.createdAt', 'DESC');
        if (userId) {
            queryBuilder.andWhere('report.createdBy = :userId', { userId });
        }
        return await queryBuilder.getMany();
    }
    async findOne(id) {
        const report = await this.reportRepository.findOne({
            where: { id, isActive: true },
            relations: ['creator', 'approver'],
        });
        if (!report) {
            throw new common_1.NotFoundException(`Báo cáo với ID ${id} không tồn tại`);
        }
        return report;
    }
    async update(id, updateReportDto) {
        const report = await this.findOne(id);
        const updateData = { ...updateReportDto };
        if (updateReportDto.reportDate) {
            updateData.reportDate = new Date(updateReportDto.reportDate);
        }
        if (updateReportDto.status === 'approved' && updateReportDto.approvedBy) {
            updateData.approvedAt = new Date();
        }
        await this.reportRepository.update(id, updateData);
        return await this.findOne(id);
    }
    async remove(id) {
        const report = await this.findOne(id);
        await this.reportRepository.update(id, { isActive: false });
    }
    async findByType(type) {
        return await this.reportRepository.find({
            where: { type, isActive: true },
            relations: ['creator', 'approver'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return await this.reportRepository.find({
            where: { status, isActive: true },
            relations: ['creator', 'approver'],
            order: { createdAt: 'DESC' },
        });
    }
    async approve(id, approvedBy) {
        return await this.update(id, {
            status: 'approved',
            approvedBy
        });
    }
    async reject(id, approvedBy) {
        return await this.update(id, {
            status: 'rejected',
            approvedBy
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map