import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    canCreateReport(userId: string): Promise<{
        canCreate: boolean;
        reason?: string;
        currentShift?: string;
        shiftTime?: string;
        isWorkingTime?: boolean;
    } | {
        error: string;
    }>;
    createReport(body: {
        id_user: number;
        content: string;
    }): Promise<import("./report.entity").Report>;
    getAllReports(userId?: string): Promise<import("./report.entity").Report[] | {
        error: string;
    }>;
    getReportsByShift(shiftType: 'morning' | 'afternoon' | 'evening', date?: string): Promise<import("./report.entity").Report[]>;
}
