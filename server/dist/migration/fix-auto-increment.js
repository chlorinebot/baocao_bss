"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
async function fixAutoIncrement() {
    try {
        const dataSource = new typeorm_1.DataSource({
            type: 'mariadb',
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bc_bss',
        });
        await dataSource.initialize();
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
        await dataSource.query('DELETE FROM nemsm');
        await dataSource.query('ALTER TABLE nemsm MODIFY COLUMN ID int(11) NOT NULL AUTO_INCREMENT');
        await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
        const result = await dataSource.query('INSERT INTO nemsm (server_name, IP) VALUES (?, ?)', ['Test Server', '192.168.1.100']);
        const servers = await dataSource.query('SELECT * FROM nemsm');
        await dataSource.destroy();
    }
    catch (error) {
        console.error('❌ Lỗi khi sửa AUTO_INCREMENT:', error);
    }
}
fixAutoIncrement();
//# sourceMappingURL=fix-auto-increment.js.map