import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script để sửa lỗi bảng nemsm
 * Chạy script này để tạo lại bảng với cấu hình đúng
 */
async function fixServerTable() {
  // Tạo kết nối database
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    // Kết nối database
    await dataSource.initialize();

    // Đọc file SQL
    const sqlFilePath = path.join(__dirname, 'fix-server-table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Chia các câu lệnh SQL
    const sqlStatements = sqlContent
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Thực hiện từng câu lệnh SQL
    for (const statement of sqlStatements) {
      await dataSource.query(statement);
    }

    // Kiểm tra kết quả
    const servers = await dataSource.query('SELECT * FROM nemsm');

  } catch (error) {
    console.error('❌ Lỗi khi sửa bảng nemsm:', error);
  } finally {
    // Đóng kết nối
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Chạy script
fixServerTable()
  .catch(error => console.error('❌ Script thất bại:', error)); 