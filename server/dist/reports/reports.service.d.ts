import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsService {
    private reportRepository;
    constructor(reportRepository: Repository<Report>);
    createReport(createReportDto: CreateReportDto, userId: number): Promise<Report>;
    findAll(params: {
        userId: number;
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        data: Report[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: number, userId: number): Promise<Report>;
    remove(id: number, userId: number): Promise<void>;
}
