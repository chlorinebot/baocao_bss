import { DataSource } from 'typeorm';

async function fixAutoIncrement() {
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

    // Tắt foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Xóa tất cả dữ liệu cũ
    await dataSource.query('DELETE FROM nemsm');

    // Thêm AUTO_INCREMENT cho cột ID
    await dataSource.query('ALTER TABLE nemsm MODIFY COLUMN ID int(11) NOT NULL AUTO_INCREMENT');

    // Reset auto increment về 1
    await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');

    // Bật lại foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    // Thêm một record mẫu để test
    const result = await dataSource.query(
      'INSERT INTO nemsm (server_name, IP) VALUES (?, ?)',
      ['Test Server', '192.168.1.100']
    );

    // Kiểm tra kết quả
    const servers = await dataSource.query('SELECT * FROM nemsm');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Lỗi khi sửa AUTO_INCREMENT:', error);
  }
}

fixAutoIncrement(); 