import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateReportResponse, FindAllResponse, FindOneResponse } from './interfaces/report.interface';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(createReportDto: CreateReportDto, req: any): Promise<CreateReportResponse>;
    getReports(query: any, req: any): Promise<FindAllResponse>;
    getReport(id: string, req: any): Promise<FindOneResponse>;
}
