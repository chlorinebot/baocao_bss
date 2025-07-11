import { IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class NodeExporterDto {
  @IsString()
  serverName: string;

  @IsString()
  ip: string;

  @IsOptional()
  cpu?: boolean;

  @IsOptional()
  memory?: boolean;

  @IsOptional()
  disk?: boolean;

  @IsOptional()
  network?: boolean;

  @IsOptional()
  netstat?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class PatroniDto {
  @IsOptional()
  primaryNode?: boolean;

  @IsOptional()
  walReplayPaused?: boolean;

  @IsOptional()
  replicasReceivedWal?: boolean;

  @IsOptional()
  primaryWalLocation?: boolean;

  @IsOptional()
  replicasReplayedWal?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransactionDto {
  @IsOptional()
  monitored?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class HeartbeatDto {
  @IsOptional()
  heartbeat86?: boolean;

  @IsOptional()
  heartbeat87?: boolean;

  @IsOptional()
  heartbeat88?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AlertsDto {
  @IsOptional()
  warning?: boolean;

  @IsOptional()
  critical?: boolean;

  @IsOptional()
  info?: boolean;

  @IsOptional()
  infoBackup?: boolean;

  @IsOptional()
  warningDisk?: boolean;

  @IsOptional()
  other?: boolean;

  @IsOptional()
  @IsString()
  note1?: string;

  @IsOptional()
  @IsString()
  note2?: string;
}

export class CreateReportDto {
  @IsString()
  date: string;

  @IsOptional()
  @IsArray()
  nodeExporter?: NodeExporterDto[];

  @IsOptional()
  @IsArray()
  patroni?: PatroniDto[];

  @IsOptional()
  @IsArray()
  transactions?: TransactionDto[];

  @IsOptional()
  @IsArray()
  heartbeat?: HeartbeatDto[];

  @IsOptional()
  @IsObject()
  alerts?: AlertsDto;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
} 