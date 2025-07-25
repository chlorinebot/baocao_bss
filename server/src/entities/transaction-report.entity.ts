import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity('transaction_reports')
export class TransactionReport {
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

  @Column({ name: 'transaction_monitored', type: 'varchar', length: 10, nullable: true, default: 'false' })
  transaction_monitored: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relationship
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;
} 