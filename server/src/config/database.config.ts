import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bc_bss',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Vô hiệu hóa tự động tạo bảng
  logging: false, // Tắt logging SQL queries
  ssl: false, // Không sử dụng SSL như yêu cầu
}; 