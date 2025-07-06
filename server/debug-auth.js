const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function debugAuth() {
  console.log('🔍 Debug quá trình đăng nhập...');
  
  try {
    // Kết nối database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'bc_bss'
    });

    console.log('✅ Đã kết nối database');

    // Lấy thông tin user admin
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (rows.length === 0) {
      console.log('❌ Không tìm thấy user admin');
      return;
    }

    const adminUser = rows[0];
    console.log('👤 User admin:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      isActive: adminUser.isActive
    });

    // Test mật khẩu
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log(`🔐 Mật khẩu "${testPassword}": ${isValid ? 'ĐÚNG ✅' : 'SAI ❌'}`);

    if (!isValid) {
      console.log('🔧 Cập nhật mật khẩu...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await connection.execute('UPDATE users SET password = ? WHERE username = ?', [newHash, 'admin']);
      console.log('✅ Đã cập nhật mật khẩu');
    }

    await connection.end();
    console.log('✅ Hoàn tất debug');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

debugAuth(); 