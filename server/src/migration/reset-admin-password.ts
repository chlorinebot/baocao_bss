import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import * as bcrypt from 'bcrypt';

async function resetAdminPassword() {
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Đã kết nối database');

    // Hash mật khẩu mới
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu cho user admin
    const result = await dataSource.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    console.log('✅ Đã cập nhật mật khẩu admin');
    console.log('👤 Thông tin đăng nhập:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    // Kiểm tra lại
    const adminUser = await dataSource.query('SELECT id, username, email FROM users WHERE username = ?', ['admin']);
    console.log('📋 User admin:', adminUser[0]);
    
    // Test verify password
    const storedPassword = await dataSource.query('SELECT password FROM users WHERE username = ?', ['admin']);
    const isValid = await bcrypt.compare(newPassword, storedPassword[0].password);
    console.log(`🔐 Mật khẩu test: ${isValid ? 'ĐÚNG' : 'SAI'}`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

resetAdminPassword(); 