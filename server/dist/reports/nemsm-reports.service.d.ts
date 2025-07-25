import { Repository } from 'typeorm';
import { NemsmReport } from '../entities/nemsm-report.entity';
export interface CreateNemsmReportDto {
    id_report_id: number;
    id_nemsm: number;
    cpu?: boolean;
    memory?: boolean;
    disk_space_used?: boolean;
    network_traffic?: boolean;
    netstat?: boolean;
    notes?: string;
}
export declare class NemsmReportsService {
    private readonly nemsmReportRepository;
    constructor(nemsmReportRepository: Repository<NemsmReport>);
    createNemsmReport(data: CreateNemsmReportDto): Promise<NemsmReport>;
    createMultipleNemsmReports(reports: CreateNemsmReportDto[]): Promise<NemsmReport[]>;
    getNemsmReportsByReportId(reportId: number): Promise<NemsmReport[]>;
    getAllNemsmReports(): Promise<NemsmReport[]>;
}
