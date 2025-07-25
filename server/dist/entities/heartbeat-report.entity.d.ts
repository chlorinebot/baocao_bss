import { Report } from '../reports/report.entity';
export declare class HeartbeatReport {
    id: number;
    id_report_id: number;
    row_index: number;
    heartbeat_86: string;
    heartbeat_87: string;
    heartbeat_88: string;
    notes: string;
    report: Report;
}
