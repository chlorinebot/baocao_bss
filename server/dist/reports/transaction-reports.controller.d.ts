import { TransactionReportsService, CreateTransactionReportDto } from './transaction-reports.service';
interface CreateTransactionReportsRequestDto {
    reportId: number;
    transactionData: {
        rowIndex: number;
        transaction_monitored: boolean;
        notes?: string;
    }[];
}
export declare class TransactionReportsController {
    private readonly transactionReportsService;
    constructor(transactionReportsService: TransactionReportsService);
    createTransactionReports(body: CreateTransactionReportsRequestDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/transaction-report.entity").TransactionReport[];
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    createSingleTransactionReport(body: CreateTransactionReportDto): Promise<{
        success: boolean;
        message: string;
        data: import("../entities/transaction-report.entity").TransactionReport;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllTransactionReports(): Promise<{
        success: boolean;
        data: import("../entities/transaction-report.entity").TransactionReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getTransactionReportsByReportId(reportId: number): Promise<{
        success: boolean;
        data: import("../entities/transaction-report.entity").TransactionReport[];
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
}
export {};
