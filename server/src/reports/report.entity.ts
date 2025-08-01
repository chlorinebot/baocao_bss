import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  id_user: number;

  @Column({ type: 'text', nullable: true, default: null })
  content: string;

  @Column({ 
    type: 'enum', 
    enum: ['morning', 'afternoon', 'evening'], 
    nullable: true,
    comment: 'Loại ca làm việc khi tạo báo cáo' 
  })
  shift_type: 'morning' | 'afternoon' | 'evening';

  @Column({ 
    type: 'date', 
    nullable: true,
    comment: 'Ngày của ca làm việc' 
  })
  shift_date: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
} 