import { PatroniReportsService, CreatePatroniReportDto } from './patroni-reports.service';
interface CreatePatroniReportsRequestDto {
    reportId: number;
    patroniData: {
        rowIndex: number;
        primary_node: boolean;
        wal_replay_paused: boolean;
        replicas_received_wal: boolean;
        primary_wal_location: boolean;
        replicas_replayed_wal: boolean;
        notes?: string;
    }[];
}
export declare class PatroniReportsController {
    private readonly patroniReportsService;
    constructor(patroniReportsService: PatroniReportsService);
    createPatroniReports(body: CreatePatroniReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/patroni-report.entity").PatroniReport[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSinglePatroniReport(body: CreatePatroniReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/patroni-report.entity").PatroniReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllPatroniReports(): Promise<{
        success: boolean;
        data: import("../entities/patroni-report.entity").PatroniReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getPatroniReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/patroni-report.entity").PatroniReport[];
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
