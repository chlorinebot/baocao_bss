import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'json', nullable: true })
  nodeExporter: any[];

  @Column({ type: 'json', nullable: true })
  patroni: any[];

  @Column({ type: 'json', nullable: true })
  transactions: any[];

  @Column({ type: 'json', nullable: true })
  heartbeat: any[];

  @Column({ type: 'json', nullable: true })
  alerts: any;

  @Column({ type: 'text', nullable: true })
  additionalNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 