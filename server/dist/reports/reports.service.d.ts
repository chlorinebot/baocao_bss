import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
export declare class ReportsService {
    private readonly reportRepository;
    constructor(reportRepository: Repository<Report>);
    create(createReportDto: CreateReportDto, userId: number): Promise<Report>;
    findAll(userId?: number): Promise<Report[]>;
    findOne(id: number): Promise<Report>;
    update(id: number, updateReportDto: UpdateReportDto): Promise<Report>;
    remove(id: number): Promise<void>;
    findByType(type: string): Promise<Report[]>;
    findByStatus(status: string): Promise<Report[]>;
    approve(id: number, approvedBy: number): Promise<Report>;
    reject(id: number, approvedBy: number): Promise<Report>;
}
