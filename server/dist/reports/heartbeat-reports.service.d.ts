import { Repository } from 'typeorm';
import { HeartbeatReport } from '../entities/heartbeat-report.entity';
export interface CreateHeartbeatReportDto {
    id_report_id: number;
    row_index: number;
    heartbeat_86?: boolean;
    heartbeat_87?: boolean;
    heartbeat_88?: boolean;
    notes?: string;
}
export declare class HeartbeatReportsService {
    private readonly heartbeatReportRepository;
    constructor(heartbeatReportRepository: Repository<HeartbeatReport>);
    createHeartbeatReport(data: CreateHeartbeatReportDto): Promise<HeartbeatReport>;
    createMultipleHeartbeatReports(reports: CreateHeartbeatReportDto[]): Promise<HeartbeatReport[]>;
    getHeartbeatReportsByReportId(reportId: number): Promise<HeartbeatReport[]>;
    getAllHeartbeatReports(): Promise<HeartbeatReport[]>;
}
