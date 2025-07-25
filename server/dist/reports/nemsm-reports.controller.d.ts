import { NemsmReportsService, CreateNemsmReportDto } from './nemsm-reports.service';
interface CreateNemsmReportsRequestDto {
    reportId: number;
    nemsmData: {
        serverId: number;
        cpu: boolean;
        memory: boolean;
        disk: boolean;
        network: boolean;
        netstat: boolean;
        notes?: string;
    }[];
}
export declare class NemsmReportsController {
    private readonly nemsmReportsService;
    constructor(nemsmReportsService: NemsmReportsService);
    createNemsmReports(body: CreateNemsmReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/nemsm-report.entity").NemsmReport[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSingleNemsmReport(body: CreateNemsmReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/nemsm-report.entity").NemsmReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllNemsmReports(): Promise<{
        success: boolean;
        data: import("../entities/nemsm-report.entity").NemsmReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getNemsmReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/nemsm-report.entity").NemsmReport[];
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
