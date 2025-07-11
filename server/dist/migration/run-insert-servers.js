"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const fs = require("fs");
const path = require("path");
async function insertServersData() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        console.log('🔌 Đang kết nối database...');
        await dataSource.initialize();
        console.log('✅ Đã kết nối database thành công');
        const sqlFilePath = path.join(__dirname, 'insert-servers-data.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        const sqlStatements = sqlContent
            .split(';')
            .filter(statement => statement.trim() !== '' && !statement.trim().startsWith('--'));
        console.log('📝 Thực hiện các câu lệnh SQL...');
        for (const statement of sqlStatements) {
            const trimmedStatement = statement.trim();
            if (trimmedStatement) {
                console.log(`Executing: ${trimmedStatement.substring(0, 50)}...`);
                await dataSource.query(trimmedStatement);
            }
        }
        const servers = await dataSource.query('SELECT * FROM nemsm ORDER BY id');
        console.log('✅ Dữ liệu servers đã được thêm thành công:');
        console.table(servers);
        console.log(`📊 Tổng cộng: ${servers.length} servers`);
    }
    catch (error) {
        console.error('❌ Lỗi khi thêm dữ liệu servers:', error);
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('🔌 Đã đóng kết nối database');
        }
    }
}
insertServersData();
//# sourceMappingURL=run-insert-servers.js.map