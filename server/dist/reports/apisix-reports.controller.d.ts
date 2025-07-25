import { ApisixReportsService, CreateApisixReportDto } from './apisix-reports.service';
interface CreateApisixReportsRequestDto {
    reportId: number;
    apisixData: {
        note_request?: string;
        note_upstream?: string;
    };
}
export declare class ApisixReportsController {
    private readonly apisixReportsService;
    constructor(apisixReportsService: ApisixReportsService);
    createApisixReport(body: CreateApisixReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/apisix-report.entity").ApisixReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSingleApisixReport(body: CreateApisixReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/apisix-report.entity").ApisixReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllApisixReports(): Promise<{
        success: boolean;
        data: import("../entities/apisix-report.entity").ApisixReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getApisixReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/apisix-report.entity").ApisixReport[];
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
