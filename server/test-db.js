const { DataSource } = require('typeorm');

async function testDatabase() {
  console.log('🔄 Đang test kết nối database...');
  
  const dataSource = new DataSource({
    type: 'mariadb',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '',
    database: 'bc_bss',
    ssl: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Kết nối database thành công!');
    
    // Test query
    const result = await dataSource.query('SELECT COUNT(*) as count FROM users');
    console.log('📊 Số lượng users:', result[0].count);
    
    await dataSource.destroy();
    console.log('✅ Test hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('🔍 Chi tiết lỗi:', error.code);
  }
}

testDatabase(); 