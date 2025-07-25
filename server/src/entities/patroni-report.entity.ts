import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity('patroni_reports')
export class PatroniReport {
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

  @Column({ name: 'primary_node', type: 'varchar', length: 10, nullable: true, default: 'false' })
  primary_node: string;

  @Column({ name: 'wal_replay_paused', type: 'varchar', length: 10, nullable: true, default: 'false' })
  wal_replay_paused: string;

  @Column({ name: 'replicas_received_wal', type: 'varchar', length: 10, nullable: true, default: 'false' })
  replicas_received_wal: string;

  @Column({ name: 'primary_wal_location', type: 'varchar', length: 10, nullable: true, default: 'false' })
  primary_wal_location: string;

  @Column({ name: 'replicas_replayed_wal', type: 'varchar', length: 10, nullable: true, default: 'false' })
  replicas_replayed_wal: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relationship
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;
} 