import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function displayLogo() {
  console.clear();
  
  // Màu sắc terminal
  const red = '\x1b[31m';
  const green = '\x1b[32m';
  const cyan = '\x1b[36m';
  const blue = '\x1b[34m';
  const magenta = '\x1b[35m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  // Logo text đơn giản và đẹp
  console.log(`${green}${bold}
  ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  ║                                                                                                           ║
  ║    ${green}██╗  ██╗██╗███╗   ███╗████████╗██╗   ██╗ █████╗ ███╗   ██╗${reset}${red}${bold}    ██████╗ ███████╗██╗   ██╗${green}${bold}                ║
  ║    ${green}██║ ██╔╝██║████╗ ████║╚══██╔══╝██║   ██║██╔══██╗████╗  ██║${reset}${red}${bold}    ██╔══██╗██╔════╝██║   ██║${green}${bold}                ║
  ║    ${green}█████╔╝ ██║██╔████╔██║   ██║   ██║   ██║███████║██╔██╗ ██║${reset}${red}${bold}    ██║  ██║█████╗  ██║   ██║${green}${bold}                ║
  ║    ${green}██╔═██╗ ██║██║╚██╔╝██║   ██║   ██║   ██║██╔══██║██║╚██╗██║${reset}${red}${bold}    ██║  ██║██╔══╝  ╚██╗ ██╔╝${green}${bold}                ║
  ║    ${green}██║  ██╗██║██║ ╚═╝ ██║   ██║   ╚██████╔╝██║  ██║██║ ╚████║${reset}${red}${bold}    ██████╔╝███████╗ ╚████╔╝${green}${bold}                 ║
  ║    ${green}╚═╝  ╚═╝╚═╝╚═╝     ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝${reset}${red}${bold}    ╚═════╝ ╚══════╝  ╚═══╝${green}${bold}                  ║
  ║                                                                                                           ║
  ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝${reset}
  `);

  console.log(`${cyan}${bold}🚀 Service: Backend API Server${reset}`);
  console.log(`${blue}📅 Ngày khởi động: ${new Date().toLocaleDateString('vi-VN')}${reset}`);
  console.log(`${blue}⏰ Thời gian: ${new Date().toLocaleTimeString('vi-VN')}${reset}`);
  console.log(`${magenta}═══════════════════════════════════════════════════════════════════════════════════════════════════════════${reset}\n`);
}

async function testDatabaseConnection(): Promise<boolean> {
  try {
    const dataSource = new DataSource({
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
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL/MariaDB:', error.message);
    return false;
  }
}


async function waitForDatabase(): Promise<void> {
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
  // Hiển thị logo trước khi khởi động
  await displayLogo();
  
  console.log('🚀 Đang khởi động server...');
  
  // Kiểm tra kết nối database trước
  await waitForDatabase();
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: false, // Tắt tất cả NestJS logs
    });
    
    // Enable CORS if needed
    app.enableCors({
      origin: true, // Cho phép tất cả origins
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
    console.log(`💼 Work Assignment API: http://localhost:${port}/work-schedule`);
    console.log('📝 Server sẵn sàng xử lý requests...');
    
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error.message);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('💥 Lỗi nghiêm trọng:', error);
  process.exit(1);
});
