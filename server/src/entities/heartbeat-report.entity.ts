import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('heartbeat_reports')
export class HeartbeatReport {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ name: 'Post_heartbeat_10_2_45_86', type: 'text', nullable: true })
  Post_heartbeat_10_2_45_86: string;

  @Column({ name: 'Post_heartbeat_10_2_45_87', type: 'text', nullable: true })
  Post_heartbeat_10_2_45_87: string;

  @Column({ name: 'Post_heartbeat_10_2_45_88', type: 'text', nullable: true })
  Post_heartbeat_10_2_45_88: string;

  @Column({ name: 'Note', type: 'text', nullable: true })
  Note: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @Column({ name: 'by_ID_user', type: 'int', nullable: true })
  by_ID_user: number;
} 