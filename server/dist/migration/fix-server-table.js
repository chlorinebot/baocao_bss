"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
const fs = require("fs");
const path = require("path");
async function fixServerTable() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        await dataSource.initialize();
        const sqlFilePath = path.join(__dirname, 'fix-server-table.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        const sqlStatements = sqlContent
            .split(';')
            .filter(statement => statement.trim() !== '');
        for (const statement of sqlStatements) {
            await dataSource.query(statement);
        }
        const servers = await dataSource.query('SELECT * FROM nemsm');
    }
    catch (error) {
        console.error('❌ Lỗi khi sửa bảng nemsm:', error);
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}
fixServerTable()
    .catch(error => console.error('❌ Script thất bại:', error));
//# sourceMappingURL=fix-server-table.js.map