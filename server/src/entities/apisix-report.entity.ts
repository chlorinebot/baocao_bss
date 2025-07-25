import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity('apisix_reports')
export class ApisixReport {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'id_report_id', type: 'int', nullable: false })
  id_report_id: number;

  @Column({ name: 'note_request', type: 'text', nullable: true })
  note_request: string;

  @Column({ name: 'note_upstream', type: 'text', nullable: true })
  note_upstream: string;

  // Relationship
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;
} 