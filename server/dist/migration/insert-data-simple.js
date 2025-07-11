"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
async function insertData() {
    const dataSource = new typeorm_1.DataSource({
        type: 'mariadb',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bc_bss',
    });
    try {
        await dataSource.initialize();
        console.log('✅ Connected to database');
        await dataSource.query('DELETE FROM nemsm');
        await dataSource.query('ALTER TABLE nemsm AUTO_INCREMENT = 1');
        console.log('🗑️ Cleared old data');
        const servers = [
            ['Prod-gateway1', '10.2.157.5'],
            ['Prod-gateway2', '10.2.157.6'],
            ['Appsrv-pro1', '10.2.45.79'],
            ['Appsrv-pro2', '10.2.45.80'],
            ['Prod-minio-01', '10.2.45.81'],
            ['Prod-minio-02', '10.2.45.82'],
            ['Prod-minio-03', '10.2.45.83'],
            ['Prod-minio-04', '10.2.45.84'],
            ['p-node1', '10.2.45.86'],
            ['p-node2', '10.2.45.87'],
            ['p-node3', '10.2.45.88']
        ];
        for (const [name, ip] of servers) {
            await dataSource.query('INSERT INTO nemsm (server_name, ip) VALUES (?, ?)', [name, ip]);
        }
        console.log('📝 Inserted server data');
        const result = await dataSource.query('SELECT * FROM nemsm ORDER BY id');
        console.log('📋 Servers in database:');
        console.table(result);
        await dataSource.destroy();
        console.log('🔌 Disconnected from database');
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
}
insertData();
//# sourceMappingURL=insert-data-simple.js.map