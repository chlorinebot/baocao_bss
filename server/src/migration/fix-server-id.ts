import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * Script để sửa lỗi ID không tự động tăng trong bảng nemsm
 * Chạy script này để đảm bảo ID tự động tăng từ 1
 */
async function fixServerIdAutoIncrement() {
  // Tạo kết nối database
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    // Kết nối database
    await dataSource.initialize();

    // Kiểm tra xem có server nào với ID = 0 không
    const result = await dataSource.query('SELECT * FROM nemsm WHERE id = 0');
    
    if (result && result.length > 0) {
      // Lưu lại thông tin server
      const serverData = { ...result[0] };
      
      // Xóa server có ID = 0
      await dataSource.query('DELETE FROM nemsm WHERE id = 0');
      
      // Reset auto increment về 1
      await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
      
      // Tạo lại server với ID tự động tăng
      await dataSource.query(
        'INSERT INTO nemsm (server_name, ip) VALUES (?, ?)',
        [serverData.server_name, serverData.ip]
      );
    } else {
      // Đảm bảo auto increment được set đúng
      await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
    }

  } catch (error) {
    console.error('❌ Lỗi khi sửa auto increment:', error);
  } finally {
    // Đóng kết nối
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Chạy script
fixServerIdAutoIncrement()
  .catch(error => console.error('❌ Script thất bại:', error)); 