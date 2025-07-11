import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('nemsm_reports')
export class NemsmReport {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'ID_NEmSM', type: 'int', nullable: true })
  ID_NEmSM: number;

  @Column({ name: 'CPU', type: 'text', nullable: true })
  CPU: string;

  @Column({ name: 'Memory', type: 'text', nullable: true })
  Memory: string;

  @Column({ name: 'Disk_space_user', type: 'text', nullable: true })
  Disk_space_user: string;

  @Column({ name: 'Network_traffic', type: 'text', nullable: true })
  Network_traffic: string;

  @Column({ name: 'Netstat', type: 'text', nullable: true })
  Netstat: string;

  @Column({ name: 'Note', type: 'text', nullable: true })
  Note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'by_ID_user', type: 'int', nullable: true })
  by_ID_user: number;
} 