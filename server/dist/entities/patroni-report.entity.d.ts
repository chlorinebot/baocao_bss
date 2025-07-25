import { Report } from '../reports/report.entity';
export declare class PatroniReport {
    id: number;
    id_report_id: number;
    row_index: number;
    primary_node: string;
    wal_replay_paused: string;
    replicas_received_wal: string;
    primary_wal_location: string;
    replicas_replayed_wal: string;
    notes: string;
    report: Report;
}
