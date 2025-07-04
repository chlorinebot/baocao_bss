import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ length: 50, unique: true })
  role_name: string;

  @Column({ length: 255, nullable: true })
  description: string;
} 