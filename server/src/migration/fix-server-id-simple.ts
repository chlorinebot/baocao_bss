import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * Script đơn giản để sửa lỗi ID mà không xóa bảng
 */
async function fixServerIdSimple() {
  // Tạo kết nối database
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    // Kết nối database
    await dataSource.initialize();

    // Tắt foreign key checks tạm thời
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Xóa tất cả dữ liệu hiện tại
    await dataSource.query('DELETE FROM nemsm');

    // Reset auto increment về 1
    await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');

    // Đảm bảo cột ID có cấu hình đúng
    await dataSource.query(`
      ALTER TABLE nemsm 
      MODIFY COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    `);

    // Bật lại foreign key checks
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    // Thêm dữ liệu mẫu
    await dataSource.query(`
      INSERT INTO nemsm (server_name, ip) VALUES ('prod-gateway1', '10.2.157.5')
    `);

  } catch (error) {
    console.error('❌ Lỗi khi sửa ID server:', error);
  } finally {
    // Đóng kết nối
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Chạy script
fixServerIdSimple()
  .catch(error => console.error('❌ Script thất bại:', error)); 