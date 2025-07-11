import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'bssdcm',
  user: 'postgres',
  password: '123456',
});

async function runMigration() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công');

    // Đọc SQL migration
    const sqlPath = path.join(__dirname, 'CreateSeparateReportsTables.sql');
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

    // Kiểm tra các bảng đã được tạo
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_reports'
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    console.log('\n📊 Các bảng báo cáo hiện có:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Migration hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error);
  } finally {
    await client.end();
  }
}

runMigration(); 