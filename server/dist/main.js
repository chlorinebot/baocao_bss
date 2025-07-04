"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const typeorm_1 = require("typeorm");
async function testDatabaseConnection() {
    try {
        const dataSource = new typeorm_1.DataSource({
            type: 'mariadb',
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 3306,
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bc_bss',
            ssl: false,
        });
        await dataSource.initialize();
        console.log('✅ Kết nối MySQL/MariaDB thành công!');
        console.log(`📊 Database: ${process.env.DB_NAME || 'bc_bss'}`);
        console.log(`🖥️  Host: ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
        await dataSource.destroy();
        return true;
    }
    catch (error) {
        console.error('❌ Lỗi kết nối MySQL/MariaDB:', error.message);
        return false;
    }
}
async function waitForDatabase() {
    let connected = false;
    let attempts = 0;
    while (!connected) {
        attempts++;
        console.log(`🔄 Thử kết nối database lần ${attempts}...`);
        connected = await testDatabaseConnection();
        if (!connected) {
            console.log('⏳ Sẽ thử lại sau 5 giây...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
async function bootstrap() {
    console.log('🚀 Đang khởi động server...');
    await waitForDatabase();
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: false,
        });
        app.enableCors({
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
            credentials: true,
            preflightContinue: false,
            optionsSuccessStatus: 204
        });
        const port = process.env.PORT || 3000;
        await app.listen(port);
        console.log('✅ Server khởi động thành công!');
        console.log(`🌐 Server đang chạy tại: http://localhost:${port}`);
        console.log(`🏥 Health check: http://localhost:${port}/health`);
        console.log(`👥 Users API: http://localhost:${port}/users`);
        console.log('📝 Server sẵn sàng xử lý requests...');
    }
    catch (error) {
        console.error('❌ Lỗi khởi động server:', error.message);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('💥 Lỗi nghiêm trọng:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map