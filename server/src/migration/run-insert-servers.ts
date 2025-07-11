import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script để thêm dữ liệu servers mẫu vào bảng nemsm
 */
async function insertServersData() {
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    console.log('🔌 Đang kết nối database...');
    await dataSource.initialize();
    console.log('✅ Đã kết nối database thành công');

    // Đọc file SQL
    const sqlFilePath = path.join(__dirname, 'insert-servers-data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Chia các câu lệnh SQL
    const sqlStatements = sqlContent
      .split(';')
      .filter(statement => statement.trim() !== '' && !statement.trim().startsWith('--'));
    
    console.log('📝 Thực hiện các câu lệnh SQL...');
    
    // Thực hiện từng câu lệnh SQL
    for (const statement of sqlStatements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`);
        await dataSource.query(trimmedStatement);
      }
    }

    // Kiểm tra kết quả
    const servers = await dataSource.query('SELECT * FROM nemsm ORDER BY id');
    console.log('✅ Dữ liệu servers đã được thêm thành công:');
    console.table(servers);

    console.log(`📊 Tổng cộng: ${servers.length} servers`);

  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu servers:', error);
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Đã đóng kết nối database');
    }
  }
}

// Chạy script
insertServersData(); 