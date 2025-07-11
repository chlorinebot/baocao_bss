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
const patroni_report_entity_1 = require("../entities/patroni-report.entity");
const heartbeat_report_entity_1 = require("../entities/heartbeat-report.entity");
const database_report_entity_1 = require("../entities/database-report.entity");
const warning_report_entity_1 = require("../entities/warning-report.entity");
const nemsm_report_entity_1 = require("../entities/nemsm-report.entity");
const report_entity_1 = require("../entities/report.entity");
let ReportsService = class ReportsService {
    reportRepository;
    patroniReportRepository;
    heartbeatReportRepository;
    databaseReportRepository;
    warningReportRepository;
    nemsmReportRepository;
    constructor(reportRepository, patroniReportRepository, heartbeatReportRepository, databaseReportRepository, warningReportRepository, nemsmReportRepository) {
        this.reportRepository = reportRepository;
        this.patroniReportRepository = patroniReportRepository;
        this.heartbeatReportRepository = heartbeatReportRepository;
        this.databaseReportRepository = databaseReportRepository;
        this.warningReportRepository = warningReportRepository;
        this.nemsmReportRepository = nemsmReportRepository;
    }
    async createReport(createReportDto, userId) {
        try {
            const results = {
                nemsmReports: [],
                patroniReports: [],
                databaseReports: [],
                heartbeatReports: [],
                warningReports: []
            };
            for (const [index, nodeData] of createReportDto.nodeExporter.entries()) {
                if (this.hasNodeExporterData(nodeData)) {
                    const nemsmReport = this.nemsmReportRepository.create({
                        ID_NEmSM: index + 1,
                        CPU: nodeData.cpu ? 'checked' : null,
                        Memory: nodeData.memory ? 'checked' : null,
                        Disk_space_user: nodeData.disk ? 'checked' : null,
                        Network_traffic: nodeData.network ? 'checked' : null,
                        Netstat: nodeData.netstat ? 'checked' : null,
                        Note: nodeData.note?.trim() || null,
                        by_ID_user: userId
                    });
                    const saved = await this.nemsmReportRepository.save(nemsmReport);
                    results.nemsmReports.push(saved);
                }
            }
            for (const [index, patroniData] of createReportDto.patroni.entries()) {
                if (this.hasPatroniData(patroniData)) {
                    const patroniReport = this.patroniReportRepository.create({
                        PatroniLeader: patroniData.primaryNode ? 'checked' : null,
                        Patroni_Primary_Node_10_2_45_86: patroniData.primaryNode ? 'checked' : null,
                        WAL_Replay_Paused: patroniData.walReplayPaused ? 'checked' : null,
                        Replicas_Received_WAL_Location: patroniData.replicasReceivedWal ? 'checked' : null,
                        Primary_WAL_Location: patroniData.primaryWalLocation ? 'checked' : null,
                        Replicas_Replayed_WAL_Location: patroniData.replicasReplayedWal ? 'checked' : null,
                        Note: patroniData.note?.trim() || null,
                        by_ID_user: userId
                    });
                    const saved = await this.patroniReportRepository.save(patroniReport);
                    results.patroniReports.push(saved);
                }
            }
            for (const [index, transactionData] of createReportDto.transactions.entries()) {
                if (this.hasTransactionData(transactionData)) {
                    const databaseReport = this.databaseReportRepository.create({
                        Transactions_giam_sat: transactionData.monitored ? 'checked' : null,
                        Note: transactionData.note?.trim() || null,
                        by_ID_user: userId
                    });
                    const saved = await this.databaseReportRepository.save(databaseReport);
                    results.databaseReports.push(saved);
                }
            }
            for (const [index, heartbeatData] of createReportDto.heartbeat.entries()) {
                if (this.hasHeartbeatData(heartbeatData)) {
                    const heartbeatReport = this.heartbeatReportRepository.create({
                        Post_heartbeat_10_2_45_86: heartbeatData.heartbeat86 ? 'checked' : null,
                        Post_heartbeat_10_2_45_87: heartbeatData.heartbeat87 ? 'checked' : null,
                        Post_heartbeat_10_2_45_88: heartbeatData.heartbeat88 ? 'checked' : null,
                        Note: heartbeatData.note?.trim() || null,
                        by_ID_user: userId
                    });
                    const saved = await this.heartbeatReportRepository.save(heartbeatReport);
                    results.heartbeatReports.push(saved);
                }
            }
            if (this.hasWarningData(createReportDto.alerts)) {
                const warningReport = this.warningReportRepository.create({
                    Warning_Critical: this.formatAlertTypes(createReportDto.alerts),
                    info_backup_database: createReportDto.alerts.infoBackup ? 'checked' : null,
                    Note: this.formatAlertNotes(createReportDto.alerts),
                    by_ID_user: userId
                });
                const saved = await this.warningReportRepository.save(warningReport);
                results.warningReports.push(saved);
            }
            const report = this.reportRepository.create({
                by_ID_user: userId,
                nemsm_report_id: results.nemsmReports[0]?.ID || null,
                patroni_report_id: results.patroniReports[0]?.ID || null,
                database_report_id: results.databaseReports[0]?.ID || null,
                heartbeat_report_id: results.heartbeatReports[0]?.ID || null,
                warning_report_id: results.warningReports[0]?.ID || null
            });
            const savedReport = await this.reportRepository.save(report);
            return {
                success: true,
                message: 'Báo cáo đã được lưu thành công',
                data: {
                    report: savedReport,
                    details: results
                }
            };
        }
        catch (error) {
            console.error('Lỗi khi tạo báo cáo:', error);
            throw new common_1.BadRequestException('Không thể lưu báo cáo: ' + error.message);
        }
    }
    hasNodeExporterData(data) {
        return Boolean(data.cpu || data.memory || data.disk ||
            data.network || data.netstat || data.note?.trim());
    }
    hasPatroniData(data) {
        return Boolean(data.primaryNode || data.walReplayPaused ||
            data.replicasReceivedWal || data.primaryWalLocation ||
            data.replicasReplayedWal || data.note?.trim());
    }
    hasTransactionData(data) {
        return Boolean(data.monitored || data.note?.trim());
    }
    hasHeartbeatData(data) {
        return Boolean(data.heartbeat86 || data.heartbeat87 ||
            data.heartbeat88 || data.note?.trim());
    }
    hasWarningData(data) {
        return Boolean(data.warning || data.critical || data.info ||
            data.infoBackup || data.warningDisk || data.other ||
            data.note1?.trim() || data.note2?.trim());
    }
    formatAlertTypes(alerts) {
        const types = [];
        if (alerts.warning)
            types.push('Warning');
        if (alerts.critical)
            types.push('Critical');
        if (alerts.info)
            types.push('Info');
        if (alerts.warningDisk)
            types.push('Warning Disk');
        if (alerts.other)
            types.push('Other');
        return types.length > 0 ? types.join(', ') : '';
    }
    formatAlertNotes(alerts) {
        const notes = [];
        if (alerts.note1?.trim())
            notes.push(alerts.note1.trim());
        if (alerts.note2?.trim())
            notes.push(alerts.note2.trim());
        return notes.length > 0 ? notes.join(' | ') : '';
    }
    async findAll(options = {}) {
        const { userId, page = 1, limit = 10, startDate, endDate } = options;
        try {
            const queryBuilder = this.reportRepository.createQueryBuilder('report')
                .leftJoinAndSelect('report.nemsmReport', 'nemsmReport')
                .leftJoinAndSelect('report.patroniReport', 'patroniReport')
                .leftJoinAndSelect('report.databaseReport', 'databaseReport')
                .leftJoinAndSelect('report.heartbeatReport', 'heartbeatReport')
                .leftJoinAndSelect('report.warningReport', 'warningReport')
                .where('report.by_ID_user = :userId', { userId })
                .orderBy('report.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (startDate) {
                queryBuilder.andWhere('report.created_at >= :startDate', { startDate });
            }
            if (endDate) {
                queryBuilder.andWhere('report.created_at <= :endDate', { endDate });
            }
            const [reports, total] = await queryBuilder.getManyAndCount();
            return {
                success: true,
                data: {
                    reports,
                    pagination: {
                        page,
                        limit,
                        total
                    }
                }
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy danh sách báo cáo:', error);
            throw new common_1.BadRequestException('Không thể lấy danh sách báo cáo');
        }
    }
    async findOne(id, userId) {
        try {
            const report = await this.reportRepository.findOne({
                where: { ID: id, by_ID_user: userId },
                relations: [
                    'nemsmReport',
                    'patroniReport',
                    'databaseReport',
                    'heartbeatReport',
                    'warningReport'
                ]
            });
            if (!report) {
                throw new common_1.BadRequestException('Không tìm thấy báo cáo');
            }
            return {
                success: true,
                data: report
            };
        }
        catch (error) {
            console.error('Lỗi khi lấy chi tiết báo cáo:', error);
            throw new common_1.BadRequestException('Không thể lấy chi tiết báo cáo');
        }
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __param(1, (0, typeorm_1.InjectRepository)(patroni_report_entity_1.PatroniReport)),
    __param(2, (0, typeorm_1.InjectRepository)(heartbeat_report_entity_1.HeartbeatReport)),
    __param(3, (0, typeorm_1.InjectRepository)(database_report_entity_1.DatabaseReport)),
    __param(4, (0, typeorm_1.InjectRepository)(warning_report_entity_1.WarningReport)),
    __param(5, (0, typeorm_1.InjectRepository)(nemsm_report_entity_1.NemsmReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map