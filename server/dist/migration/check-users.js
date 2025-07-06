"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const bcrypt = require("bcrypt");
async function checkUsers() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        await dataSource.initialize();
        console.log('✅ Đã kết nối database thành công');
        const tables = await dataSource.query("SHOW TABLES LIKE 'users'");
        if (tables.length === 0) {
            console.log('❌ Bảng users không tồn tại');
            return;
        }
        console.log('📋 Cấu trúc bảng users:');
        const structure = await dataSource.query('DESCRIBE users');
        console.table(structure);
        const users = await dataSource.query('SELECT id, username, email, firstName, lastName, role_id, isActive FROM users');
        console.log('👥 Danh sách users hiện có:');
        console.table(users);
        const adminUser = await dataSource.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (adminUser.length === 0) {
            console.log('🔧 Tạo user admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await dataSource.query(`
        INSERT INTO users (username, email, password, firstName, lastName, role_id, isActive, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, ['admin', 'admin@example.com', hashedPassword, 'Admin', 'User', 1, true]);
            console.log('✅ Đã tạo user admin thành công');
            console.log('👤 Thông tin đăng nhập:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        }
        else {
            console.log('✅ User admin đã tồn tại');
            console.log('👤 Thông tin user admin:');
            console.table(adminUser);
            const isPasswordValid = await bcrypt.compare('admin123', adminUser[0].password);
            console.log(`🔐 Mật khẩu admin123 ${isPasswordValid ? 'ĐÚNG' : 'SAI'}`);
            if (!isPasswordValid) {
                console.log('🔧 Cập nhật mật khẩu admin...');
                const newHashedPassword = await bcrypt.hash('admin123', 10);
                await dataSource.query('UPDATE users SET password = ? WHERE username = ?', [newHashedPassword, 'admin']);
                console.log('✅ Đã cập nhật mật khẩu admin thành công');
            }
        }
        await dataSource.destroy();
    }
    catch (error) {
        console.error('❌ Lỗi khi kiểm tra users:', error);
    }
}
checkUsers();
//# sourceMappingURL=check-users.js.map