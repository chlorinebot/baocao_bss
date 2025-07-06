import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

async function checkTableStructure() {
  console.log('🔍 Kiểm tra cấu trúc bảng nemsm...');
  
  try {
    const dataSource = new DataSource({
      type: 'mariadb',
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bc_bss',
    });
    
    await dataSource.initialize();
    console.log('✅ Đã kết nối database thành công');

    // Kiểm tra cấu trúc bảng
    const result = await dataSource.query('DESCRIBE nemsm');
    console.log('📋 Cấu trúc bảng nemsm:');
    console.table(result);

    // Kiểm tra các khóa của bảng
    const keys = await dataSource.query('SHOW KEYS FROM nemsm');
    console.log('🔑 Các khóa của bảng nemsm:');
    console.table(keys);

    // Kiểm tra auto_increment
    const autoIncrement = await dataSource.query('SHOW TABLE STATUS LIKE "nemsm"');
    console.log('🔄 Thông tin auto_increment:');
    console.table(autoIncrement);

    await dataSource.destroy();
    console.log('🔌 Đã đóng kết nối database');
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra cấu trúc bảng:', error);
  }
}

checkTableStructure(); 