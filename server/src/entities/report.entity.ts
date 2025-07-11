import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NemsmReport } from './nemsm-report.entity';
import { PatroniReport } from './patroni-report.entity';
import { DatabaseReport } from './database-report.entity';
import { HeartbeatReport } from './heartbeat-report.entity';
import { WarningReport } from './warning-report.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'nemsm_report_id', nullable: true, type: 'int' })
  nemsm_report_id: number | null;

  @Column({ name: 'patroni_report_id', nullable: true, type: 'int' })
  patroni_report_id: number | null;

  @Column({ name: 'database_report_id', nullable: true, type: 'int' })
  database_report_id: number | null;

  @Column({ name: 'heartbeat_report_id', nullable: true, type: 'int' })
  heartbeat_report_id: number | null;

  @Column({ name: 'warning_report_id', nullable: true, type: 'int' })
  warning_report_id: number | null;

  @Column({ name: 'by_ID_user', type: 'int' })
  by_ID_user: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => NemsmReport, { nullable: true })
  @JoinColumn({ name: 'nemsm_report_id' })
  nemsmReport: NemsmReport | null;

  @ManyToOne(() => PatroniReport, { nullable: true })
  @JoinColumn({ name: 'patroni_report_id' })
  patroniReport: PatroniReport | null;

  @ManyToOne(() => DatabaseReport, { nullable: true })
  @JoinColumn({ name: 'database_report_id' })
  databaseReport: DatabaseReport | null;

  @ManyToOne(() => HeartbeatReport, { nullable: true })
  @JoinColumn({ name: 'heartbeat_report_id' })
  heartbeatReport: HeartbeatReport | null;

  @ManyToOne(() => WarningReport, { nullable: true })
  @JoinColumn({ name: 'warning_report_id' })
  warningReport: WarningReport | null;
} 