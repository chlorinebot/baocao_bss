"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
async function fixServerIdAutoIncrement() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        await dataSource.initialize();
        const result = await dataSource.query('SELECT * FROM nemsm WHERE id = 0');
        if (result && result.length > 0) {
            const serverData = { ...result[0] };
            await dataSource.query('DELETE FROM nemsm WHERE id = 0');
            await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
            await dataSource.query('INSERT INTO nemsm (server_name, ip) VALUES (?, ?)', [serverData.server_name, serverData.ip]);
        }
        else {
            await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
        }
    }
    catch (error) {
        console.error('❌ Lỗi khi sửa auto increment:', error);
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}
fixServerIdAutoIncrement()
    .catch(error => console.error('❌ Script thất bại:', error));
//# sourceMappingURL=fix-server-id.js.map