import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity('alert_reports')
export class AlertReport {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'id_report_id', type: 'int', nullable: false })
  id_report_id: number;

  @Column({ name: 'note_alert_1', type: 'text', nullable: true })
  note_alert_1: string;

  @Column({ name: 'note_alert_2', type: 'text', nullable: true })
  note_alert_2: string;

  // Relationship
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;
} 