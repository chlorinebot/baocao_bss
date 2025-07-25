import { Report } from '../reports/report.entity';
export declare class TransactionReport {
    id: number;
    id_report_id: number;
    row_index: number;
    transaction_monitored: string;
    notes: string;
    report: Report;
}
