import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('work_schedule')
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', comment: 'ID của nhân viên A' })
  employee_a: number;

  @Column({ type: 'int', comment: 'ID của nhân viên B' })
  employee_b: number;

  @Column({ type: 'int', comment: 'ID của nhân viên C' })
  employee_c: number;

  @Column({ type: 'int', comment: 'ID của nhân viên D' })
  employee_d: number;

  @Column({ type: 'boolean', default: true, comment: 'Trạng thái hoạt động' })
  active: boolean;

  @CreateDateColumn({ 
    type: 'datetime', 
    comment: 'Ngày giờ tạo phân công',
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_date: Date;

  @UpdateDateColumn({ 
    type: 'datetime', 
    comment: 'Ngày giờ cập nhật cuối cùng',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updated_date: Date;

  @Column({ 
    type: 'date', 
    comment: 'Ngày phân công có hiệu lực',
    default: () => 'CURDATE()'
  })
  activation_date: Date;

  // Quan hệ với User entities
  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_a', referencedColumnName: 'id' })
  employeeA: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_b', referencedColumnName: 'id' })
  employeeB: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_c', referencedColumnName: 'id' })
  employeeC: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_d', referencedColumnName: 'id' })
  employeeD: User;
} 