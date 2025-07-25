import { Repository } from 'typeorm';
import { TransactionReport } from '../entities/transaction-report.entity';
export interface CreateTransactionReportDto {
    id_report_id: number;
    row_index: number;
    transaction_monitored?: boolean;
    notes?: string;
}
export declare class TransactionReportsService {
    private readonly transactionReportRepository;
    constructor(transactionReportRepository: Repository<TransactionReport>);
    createTransactionReport(data: CreateTransactionReportDto): Promise<TransactionReport>;
    createMultipleTransactionReports(reports: CreateTransactionReportDto[]): Promise<TransactionReport[]>;
    getTransactionReportsByReportId(reportId: number): Promise<TransactionReport[]>;
    getAllTransactionReports(): Promise<TransactionReport[]>;
}
