import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';

@Entity('nemsm')
export class Server {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'int',
    unsigned: true,
  })
  id: number;

  @Column({ name: 'server_name', length: 255, nullable: false })
  server_name: string;

  @Column({ name: 'ip', length: 45, nullable: false })
  ip: string;

  @BeforeInsert()
  ensureIdIsNumber() {
    // Đảm bảo ID là số
    if (this.id === undefined || this.id === null) {
      this.id = 0; // Tạm thời gán 0, sẽ được thay thế bởi auto-increment
    }
  }
} 