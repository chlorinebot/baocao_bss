import { IsOptional, IsString, IsArray, IsObject, IsBoolean, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class NodeExporterDto {
  @IsBoolean()
  cpu: boolean;

  @IsBoolean()
  memory: boolean;

  @IsBoolean()
  disk: boolean;

  @IsBoolean()
  network: boolean;

  @IsBoolean()
  netstat: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class PatroniDto {
  @IsBoolean()
  primaryNode: boolean;

  @IsBoolean()
  walReplayPaused: boolean;

  @IsBoolean()
  replicasReceivedWal: boolean;

  @IsBoolean()
  primaryWalLocation: boolean;

  @IsBoolean()
  replicasReplayedWal: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TransactionDto {
  @IsBoolean()
  monitored: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class HeartbeatDto {
  @IsBoolean()
  heartbeat86: boolean;

  @IsBoolean()
  heartbeat87: boolean;

  @IsBoolean()
  heartbeat88: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AlertDto {
  @IsBoolean()
  warning: boolean;

  @IsBoolean()
  critical: boolean;

  @IsBoolean()
  info: boolean;

  @IsBoolean()
  infoBackup: boolean;

  @IsBoolean()
  warningDisk: boolean;

  @IsBoolean()
  other: boolean;

  @IsOptional()
  @IsString()
  note1?: string;

  @IsOptional()
  @IsString()
  note2?: string;
}

export class CreateReportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => NodeExporterDto)
  nodeExporter: NodeExporterDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PatroniDto)
  patroni: PatroniDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TransactionDto)
  transactions: TransactionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => HeartbeatDto)
  heartbeat: HeartbeatDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => AlertDto)
  alerts: AlertDto;
} 