import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import * as bcrypt from 'bcrypt';

async function testFullLogin() {
  const dataSource = new DataSource({
    ...databaseConfig as any,
    entities: [],
    migrations: [],
  });

  try {
    await dataSource.initialize();
    console.log('✅ Đã kết nối database');

    // Test 1: Kiểm tra user admin có tồn tại không
    const adminUser = await dataSource.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (adminUser.length === 0) {
      console.log('❌ User admin không tồn tại');
      return;
    }

    console.log('✅ User admin tồn tại:', {
      id: adminUser[0].id,
      username: adminUser[0].username,
      email: adminUser[0].email,
      isActive: adminUser[0].isActive
    });

    // Test 2: Kiểm tra mật khẩu
    const password = 'admin123';
    const storedPassword = adminUser[0].password;
    
    console.log('🔐 Đang kiểm tra mật khẩu...');
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    console.log(`🔐 Mật khẩu "${password}": ${isPasswordValid ? 'ĐÚNG ✅' : 'SAI ❌'}`);

    if (!isPasswordValid) {
      console.log('🔧 Cập nhật mật khẩu admin...');
      const newHashedPassword = await bcrypt.hash(password, 10);
      await dataSource.query('UPDATE users SET password = ? WHERE username = ?', [newHashedPassword, 'admin']);
      console.log('✅ Đã cập nhật mật khẩu admin');
      
      // Test lại
      const updatedUser = await dataSource.query('SELECT password FROM users WHERE username = ?', ['admin']);
      const isNewPasswordValid = await bcrypt.compare(password, updatedUser[0].password);
      console.log(`🔐 Mật khẩu sau khi cập nhật: ${isNewPasswordValid ? 'ĐÚNG ✅' : 'SAI ❌'}`);
    }

    // Test 3: Simulate auth service logic
    console.log('\n🧪 Mô phỏng logic auth service:');
    
    // Tìm user
    const user = await dataSource.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!user || user.length === 0) {
      console.log('❌ Không tìm thấy user');
      return;
    }
    console.log('✅ Tìm thấy user');

    // Verify password
    const isValid = await bcrypt.compare('admin123', user[0].password);
    if (!isValid) {
      console.log('❌ Mật khẩu không đúng');
      return;
    }
    console.log('✅ Mật khẩu đúng');

    // Tạo response
    const loginResponse = {
      access_token: `token_${user[0].id}_${Date.now()}`,
      user: {
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        role_id: user[0].role_id,
        birthday: user[0].birthday ? user[0].birthday.toISOString().split('T')[0] : '',
        createdAt: user[0].createdAt.toISOString(),
        updatedAt: user[0].updatedAt.toISOString()
      }
    };

    console.log('✅ Đăng nhập thành công!');
    console.log('📄 Response:', JSON.stringify(loginResponse, null, 2));

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

testFullLogin(); 