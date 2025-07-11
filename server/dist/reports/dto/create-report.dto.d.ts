export declare class NodeExporterDto {
    cpu: boolean;
    memory: boolean;
    disk: boolean;
    network: boolean;
    netstat: boolean;
    note?: string;
}
export declare class PatroniDto {
    primaryNode: boolean;
    walReplayPaused: boolean;
    replicasReceivedWal: boolean;
    primaryWalLocation: boolean;
    replicasReplayedWal: boolean;
    note?: string;
}
export declare class TransactionDto {
    monitored: boolean;
    note?: string;
}
export declare class HeartbeatDto {
    heartbeat86: boolean;
    heartbeat87: boolean;
    heartbeat88: boolean;
    note?: string;
}
export declare class AlertDto {
    warning: boolean;
    critical: boolean;
    info: boolean;
    infoBackup: boolean;
    warningDisk: boolean;
    other: boolean;
    note1?: string;
    note2?: string;
}
export declare class CreateReportDto {
    nodeExporter: NodeExporterDto[];
    patroni: PatroniDto[];
    transactions: TransactionDto[];
    heartbeat: HeartbeatDto[];
    alerts: AlertDto;
}
