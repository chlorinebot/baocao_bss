import { Report } from '../../entities/report.entity';
import { NemsmReport } from '../../entities/nemsm-report.entity';
import { PatroniReport } from '../../entities/patroni-report.entity';
import { DatabaseReport } from '../../entities/database-report.entity';
import { HeartbeatReport } from '../../entities/heartbeat-report.entity';
import { WarningReport } from '../../entities/warning-report.entity';
export interface ReportResults {
    nemsmReports: NemsmReport[];
    patroniReports: PatroniReport[];
    databaseReports: DatabaseReport[];
    heartbeatReports: HeartbeatReport[];
    warningReports: WarningReport[];
}
export interface CreateReportResponse {
    success: boolean;
    message: string;
    data: {
        report: Report;
        details: ReportResults;
    };
}
export interface FindAllResponse {
    success: boolean;
    data: {
        reports: Report[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    };
}
export interface FindOneResponse {
    success: boolean;
    data: Report;
}
