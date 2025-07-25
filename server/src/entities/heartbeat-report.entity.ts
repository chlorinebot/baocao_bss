import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity('heartbeat_reports')
export class HeartbeatReport {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'id_report_id', type: 'int', nullable: false })
  id_report_id: number;

  @Column({ name: 'row_index', type: 'int', nullable: false })
  row_index: number;

  @Column({ name: 'heartbeat_86', type: 'varchar', length: 10, nullable: true, default: 'false' })
  heartbeat_86: string;

  @Column({ name: 'heartbeat_87', type: 'varchar', length: 10, nullable: true, default: 'false' })
  heartbeat_87: string;

  @Column({ name: 'heartbeat_88', type: 'varchar', length: 10, nullable: true, default: 'false' })
  heartbeat_88: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relationship
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;
} 