import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(body: {
        id_user: number;
        content: string;
    }): Promise<import("./report.entity").Report>;
    getAllReports(userId?: string): Promise<import("./report.entity").Report[] | {
        error: string;
    }>;
}
