import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(createReportDto: CreateReportDto, req: any): Promise<import("./entities/report.entity").Report>;
    getReports(query: any, req: any): Promise<{
        data: import("./entities/report.entity").Report[];
        total: number;
        totalPages: number;
    }>;
    getReport(id: string, req: any): Promise<import("./entities/report.entity").Report>;
}
