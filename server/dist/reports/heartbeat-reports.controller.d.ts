import { HeartbeatReportsService, CreateHeartbeatReportDto } from './heartbeat-reports.service';
interface CreateHeartbeatReportsRequestDto {
    reportId: number;
    heartbeatData: {
        rowIndex: number;
        heartbeat_86: boolean;
        heartbeat_87: boolean;
        heartbeat_88: boolean;
        notes?: string;
    }[];
}
export declare class HeartbeatReportsController {
    private readonly heartbeatReportsService;
    constructor(heartbeatReportsService: HeartbeatReportsService);
    createHeartbeatReports(body: CreateHeartbeatReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/heartbeat-report.entity").HeartbeatReport[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSingleHeartbeatReport(body: CreateHeartbeatReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/heartbeat-report.entity").HeartbeatReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllHeartbeatReports(): Promise<{
        success: boolean;
        data: import("../entities/heartbeat-report.entity").HeartbeatReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getHeartbeatReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/heartbeat-report.entity").HeartbeatReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
export {};
