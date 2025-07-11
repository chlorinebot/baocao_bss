import { NemsmReport } from './nemsm-report.entity';
import { PatroniReport } from './patroni-report.entity';
import { DatabaseReport } from './database-report.entity';
import { HeartbeatReport } from './heartbeat-report.entity';
import { WarningReport } from './warning-report.entity';
export declare class Report {
    ID: number;
    nemsm_report_id: number | null;
    patroni_report_id: number | null;
    database_report_id: number | null;
    heartbeat_report_id: number | null;
    warning_report_id: number | null;
    by_ID_user: number;
    created_at: Date;
    nemsmReport: NemsmReport | null;
    patroniReport: PatroniReport | null;
    databaseReport: DatabaseReport | null;
    heartbeatReport: HeartbeatReport | null;
    warningReport: WarningReport | null;
}
