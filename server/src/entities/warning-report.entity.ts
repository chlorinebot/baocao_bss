import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('warning_reports')
export class WarningReport {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'Warning_Critical', type: 'text', nullable: true })
  Warning_Critical: string;

  @Column({ name: 'info_backup_database', type: 'text', nullable: true })
  info_backup_database: string;

  @Column({ name: 'Note', type: 'text', nullable: true })
  Note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'by_ID_user', type: 'int', nullable: true })
  by_ID_user: number;
} 