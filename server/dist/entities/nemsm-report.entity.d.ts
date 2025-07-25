import { Report } from '../reports/report.entity';
import { Server } from './server.entity';
export declare class NemsmReport {
    id: number;
    id_report_id: number;
    id_nemsm: number;
    cpu: string;
    memory: string;
    disk_space_used: string;
    network_traffic: string;
    netstat: string;
    notes: string;
    report: Report;
    server: Server;
}
