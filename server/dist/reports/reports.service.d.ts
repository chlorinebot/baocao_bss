import { Repository } from 'typeorm';
import { Report } from './report.entity';
export declare class ReportsService {
    private readonly reportRepository;
    constructor(reportRepository: Repository<Report>);
    createReport(id_user: number, content: string): Promise<Report>;
    getAllReports(): Promise<Report[]>;
}
