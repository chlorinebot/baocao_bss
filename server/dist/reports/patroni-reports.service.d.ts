import { Repository } from 'typeorm';
import { PatroniReport } from '../entities/patroni-report.entity';
export interface CreatePatroniReportDto {
    id_report_id: number;
    row_index: number;
    primary_node?: boolean;
    wal_replay_paused?: boolean;
    replicas_received_wal?: boolean;
    primary_wal_location?: boolean;
    replicas_replayed_wal?: boolean;
    notes?: string;
}
export declare class PatroniReportsService {
    private readonly patroniReportRepository;
    constructor(patroniReportRepository: Repository<PatroniReport>);
    createPatroniReport(data: CreatePatroniReportDto): Promise<PatroniReport>;
    createMultiplePatroniReports(reports: CreatePatroniReportDto[]): Promise<PatroniReport[]>;
    getPatroniReportsByReportId(reportId: number): Promise<PatroniReport[]>;
    getAllPatroniReports(): Promise<PatroniReport[]>;
}
