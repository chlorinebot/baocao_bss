import { AlertReportsService, CreateAlertReportDto } from './alert-reports.service';
interface CreateAlertReportsRequestDto {
    reportId: number;
    alertData: {
        note_alert_1?: string;
        note_alert_2?: string;
    };
}
export declare class AlertReportsController {
    private readonly alertReportsService;
    constructor(alertReportsService: AlertReportsService);
    createAlertReport(body: CreateAlertReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/alert-report.entity").AlertReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSingleAlertReport(body: CreateAlertReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/alert-report.entity").AlertReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllAlertReports(): Promise<{
        success: boolean;
        data: import("../entities/alert-report.entity").AlertReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAlertReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/alert-report.entity").AlertReport[];
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
