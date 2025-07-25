import { Repository } from 'typeorm';
import { AlertReport } from '../entities/alert-report.entity';
export interface CreateAlertReportDto {
    id_report_id: number;
    note_alert_1?: string;
    note_alert_2?: string;
}
export declare class AlertReportsService {
    private readonly alertReportRepository;
    constructor(alertReportRepository: Repository<AlertReport>);
    createAlertReport(data: CreateAlertReportDto): Promise<AlertReport>;
    getAlertReportsByReportId(reportId: number): Promise<AlertReport[]>;
    getAllAlertReports(): Promise<AlertReport[]>;
}
