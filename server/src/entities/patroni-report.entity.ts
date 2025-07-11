import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('patroni_reports')
export class PatroniReport {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'PatroniLeader', type: 'text', nullable: true })
  PatroniLeader: string;

  @Column({ name: 'Patroni_Primary_Node_10_2_45_86', type: 'text', nullable: true })
  Patroni_Primary_Node_10_2_45_86: string;

  @Column({ name: 'WAL_Replay_Paused', type: 'text', nullable: true })
  WAL_Replay_Paused: string;

  @Column({ name: 'Replicas_Received_WAL_Location', type: 'text', nullable: true })
  Replicas_Received_WAL_Location: string;

  @Column({ name: 'Primary_WAL_Location', type: 'text', nullable: true })
  Primary_WAL_Location: string;

  @Column({ name: 'Replicas_Replayed_WAL_Location', type: 'text', nullable: true })
  Replicas_Replayed_WAL_Location: string;

  @Column({ name: 'Note', type: 'text', nullable: true })
  Note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'by_ID_user', type: 'int', nullable: true })
  by_ID_user: number;
} 