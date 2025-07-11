import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { PatroniReport } from '../entities/patroni-report.entity';
import { HeartbeatReport } from '../entities/heartbeat-report.entity';
import { DatabaseReport } from '../entities/database-report.entity';
import { WarningReport } from '../entities/warning-report.entity';
import { NemsmReport } from '../entities/nemsm-report.entity';
import { Report } from '../entities/report.entity';
import { CreateReportResponse, FindAllResponse, FindOneResponse } from './interfaces/report.interface';
export declare class ReportsService {
    private reportRepository;
    private patroniReportRepository;
    private heartbeatReportRepository;
    private databaseReportRepository;
    private warningReportRepository;
    private nemsmReportRepository;
    constructor(reportRepository: Repository<Report>, patroniReportRepository: Repository<PatroniReport>, heartbeatReportRepository: Repository<HeartbeatReport>, databaseReportRepository: Repository<DatabaseReport>, warningReportRepository: Repository<WarningReport>, nemsmReportRepository: Repository<NemsmReport>);
    createReport(createReportDto: CreateReportDto, userId: number): Promise<CreateReportResponse>;
    private hasNodeExporterData;
    private hasPatroniData;
    private hasTransactionData;
    private hasHeartbeatData;
    private hasWarningData;
    private formatAlertTypes;
    private formatAlertNotes;
    findAll(options?: any): Promise<FindAllResponse>;
    findOne(id: number, userId: number): Promise<FindOneResponse>;
}
