import { Repository } from 'typeorm';
import { ApisixReport } from '../entities/apisix-report.entity';
export interface CreateApisixReportDto {
    id_report_id: number;
    note_request?: string;
    note_upstream?: string;
}
export declare class ApisixReportsService {
    private readonly apisixReportRepository;
    constructor(apisixReportRepository: Repository<ApisixReport>);
    createApisixReport(data: CreateApisixReportDto): Promise<ApisixReport>;
    getApisixReportsByReportId(reportId: number): Promise<ApisixReport[]>;
    getAllApisixReports(): Promise<ApisixReport[]>;
}
