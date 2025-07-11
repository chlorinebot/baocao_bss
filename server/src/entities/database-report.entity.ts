import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('database_reports')
export class DatabaseReport {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'Transactions_giam_sat', type: 'text', nullable: true })
  Transactions_giam_sat: string;

  @Column({ name: 'Note', type: 'text', nullable: true })
  Note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'by_ID_user', type: 'int', nullable: true })
  by_ID_user: number;
} 