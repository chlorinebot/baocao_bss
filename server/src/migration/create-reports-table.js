const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'bssdcm',
  user: 'postgres',
  password: '123456',
});

async function createReportsTable() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công');

    // Đọc file SQL
    const sqlPath = path.join(__dirname, 'CreateReportsTable.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Tách các câu lệnh SQL
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Sẽ thực thi ${statements.length} câu lệnh SQL`);

    // Thực thi từng câu lệnh
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ Đang thực thi câu lệnh ${i + 1}/${statements.length}`);
        console.log(`SQL: ${statement.substring(0, 100)}...`);
        
        await client.query(statement);
        console.log(`✅ Hoàn thành câu lệnh ${i + 1}`);
      } catch (error) {
        console.error(`❌ Lỗi ở câu lệnh ${i + 1}:`, error.message);
        console.error(`SQL: ${statement}`);
      }
    }

    // Kiểm tra bảng đã được tạo
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reports'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Cấu trúc bảng reports:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Migration hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error);
  } finally {
    await client.end();
  }
}

createReportsTable().catch(console.error); 