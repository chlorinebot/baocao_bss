import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Report } from '../reports/report.entity';
import { Server } from './server.entity';

@Entity('nemsm_reports')
export class NemsmReport {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'id_report_id', type: 'int', nullable: false })
  id_report_id: number;

  @Column({ name: 'id_nemsm', type: 'int', nullable: false })
  id_nemsm: number;

  @Column({ name: 'cpu', type: 'varchar', length: 10, nullable: true, default: 'false' })
  cpu: string;

  @Column({ name: 'memory', type: 'varchar', length: 10, nullable: true, default: 'false' })
  memory: string;

  @Column({ name: 'disk_space_used', type: 'varchar', length: 10, nullable: true, default: 'false' })
  disk_space_used: string;

  @Column({ name: 'network_traffic', type: 'varchar', length: 10, nullable: true, default: 'false' })
  network_traffic: string;

  @Column({ name: 'netstat', type: 'varchar', length: 10, nullable: true, default: 'false' })
  netstat: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => Report)
  @JoinColumn({ name: 'id_report_id' })
  report: Report;

  @ManyToOne(() => Server)
  @JoinColumn({ name: 'id_nemsm' })
  server: Server;
} 