"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const bcrypt = require("bcrypt");
async function resetAdminPassword() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        await dataSource.initialize();
        console.log('✅ Đã kết nối database');
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await dataSource.query('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
        console.log('✅ Đã cập nhật mật khẩu admin');
        console.log('👤 Thông tin đăng nhập:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        const adminUser = await dataSource.query('SELECT id, username, email FROM users WHERE username = ?', ['admin']);
        console.log('📋 User admin:', adminUser[0]);
        const storedPassword = await dataSource.query('SELECT password FROM users WHERE username = ?', ['admin']);
        const isValid = await bcrypt.compare(newPassword, storedPassword[0].password);
        console.log(`🔐 Mật khẩu test: ${isValid ? 'ĐÚNG' : 'SAI'}`);
        await dataSource.destroy();
    }
    catch (error) {
        console.error('❌ Lỗi:', error);
    }
}
resetAdminPassword();
//# sourceMappingURL=reset-admin-password.js.map