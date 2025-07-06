"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const database_config_1 = require("../config/database.config");
async function fixServerIdSimple() {
    const dataSource = new typeorm_1.DataSource({
        ...database_config_1.databaseConfig,
        entities: [],
        migrations: [],
    });
    try {
        await dataSource.initialize();
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
        await dataSource.query('DELETE FROM nemsm');
        await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
        await dataSource.query(`
      ALTER TABLE nemsm 
      MODIFY COLUMN id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    `);
        await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
        await dataSource.query(`
      INSERT INTO nemsm (server_name, ip) VALUES ('prod-gateway1', '10.2.157.5')
    `);
    }
    catch (error) {
        console.error('❌ Lỗi khi sửa ID server:', error);
    }
    finally {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}
fixServerIdSimple()
    .catch(error => console.error('❌ Script thất bại:', error));
//# sourceMappingURL=fix-server-id-simple.js.map