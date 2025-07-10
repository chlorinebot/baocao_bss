import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(createReportDto: CreateReportDto, req: any): Promise<any>;
    findAll(userId?: string): any;
    findByType(type: string): any;
    findByStatus(status: string): any;
    findOne(id: string): any;
    update(id: string, updateReportDto: UpdateReportDto): any;
    approve(id: string, req: any): any;
    reject(id: string, req: any): any;
    remove(id: string): any;
}
