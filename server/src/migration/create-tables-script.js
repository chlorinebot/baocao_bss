const { Client } = require('pg');

// Config database
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'bssdcm',
  user: 'postgres',
  password: '123456',
});

async function createAllTables() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công');

    // Kiểm tra bảng hiện có
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_reports'
    `);
    
    console.log('📋 Bảng báo cáo hiện có:', checkTables.rows.map(r => r.table_name));

    // Tạo từng bảng
    const tables = [
      {
        name: 'nemsm_reports',
        sql: `CREATE TABLE IF NOT EXISTS nemsm_reports (
          ID SERIAL PRIMARY KEY,
          ID_NEmSM INTEGER,
          CPU TEXT,
          Memory TEXT,
          Disk_space_user TEXT,
          Network_traffic TEXT,
          Netstat TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
        )`
      },
      {
        name: 'patroni_reports',
        sql: `CREATE TABLE IF NOT EXISTS patroni_reports (
          ID SERIAL PRIMARY KEY,
          PatroniLeader TEXT,
          Patroni_Primary_Node_10_2_45_86 TEXT,
          WAL_Replay_Paused TEXT,
          Replicas_Received_WAL_Location TEXT,
          Primary_WAL_Location TEXT,
          Replicas_Replayed_WAL_Location TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
        )`
      },
      {
        name: 'database_reports',
        sql: `CREATE TABLE IF NOT EXISTS database_reports (
          ID SERIAL PRIMARY KEY,
          Transactions_giam_sat TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
        )`
      },
      {
        name: 'heartbeat_reports',
        sql: `CREATE TABLE IF NOT EXISTS heartbeat_reports (
          ID SERIAL PRIMARY KEY,
          Post_heartbeat_10_2_45_86 TEXT,
          Post_heartbeat_10_2_45_87 TEXT,
          Post_heartbeat_10_2_45_88 TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
        )`
      },
      {
        name: 'warning_reports',
        sql: `CREATE TABLE IF NOT EXISTS warning_reports (
          ID SERIAL PRIMARY KEY,
          Warning_Critical TEXT,
          info_backup_database TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
        )`
      }
    ];

    // Tạo từng bảng
    for (const table of tables) {
      try {
        await client.query(table.sql);
        console.log(`✅ Tạo/kiểm tra bảng ${table.name} thành công`);
      } catch (error) {
        console.error(`❌ Lỗi tạo bảng ${table.name}:`, error.message);
      }
    }

    // Tạo index cho performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_nemsm_reports_user_date ON nemsm_reports(by_ID_user, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_patroni_reports_user_date ON patroni_reports(by_ID_user, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_database_reports_user_date ON database_reports(by_ID_user, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_heartbeat_reports_user_date ON heartbeat_reports(by_ID_user, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_warning_reports_user_date ON warning_reports(by_ID_user, created_at)'
    ];

    for (const indexSql of indexes) {
      try {
        await client.query(indexSql);
        console.log('✅ Tạo index thành công');
      } catch (error) {
        console.error('❌ Lỗi tạo index:', error.message);
      }
    }

    // Kiểm tra lại các bảng sau khi tạo
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_reports'
      ORDER BY table_name
    `);
    
    console.log('\n🎉 Hoàn thành! Các bảng báo cáo:');
    finalTables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Lỗi chung:', error);
  } finally {
    await client.end();
    console.log('🔚 Đóng kết nối database');
  }
}

// Chạy script
createAllTables().catch(console.error); 