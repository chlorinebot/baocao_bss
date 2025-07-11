const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'bssdcm',
  user: 'postgres',
  password: '123456',
});

async function createTables() {
  try {
    await client.connect();
    console.log('✅ Kết nối database thành công');

    // Tạo bảng nemsm_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS nemsm_reports (
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
      )
    `);
    console.log('✅ Tạo bảng nemsm_reports');

    // Tạo bảng patroni_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS patroni_reports (
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
      )
    `);
    console.log('✅ Tạo bảng patroni_reports');

    // Tạo bảng database_reports  
    await client.query(`
      CREATE TABLE IF NOT EXISTS database_reports (
          ID SERIAL PRIMARY KEY,
          Transactions_giam_sat TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
      )
    `);
    console.log('✅ Tạo bảng database_reports');

    // Tạo bảng heartbeat_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS heartbeat_reports (
          ID SERIAL PRIMARY KEY,
          Post_heartbeat_10_2_45_86 TEXT,
          Post_heartbeat_10_2_45_87 TEXT,
          Post_heartbeat_10_2_45_88 TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
      )
    `);
    console.log('✅ Tạo bảng heartbeat_reports');

    // Tạo bảng warning_reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS warning_reports (
          ID SERIAL PRIMARY KEY,
          Warning_Critical TEXT,
          info_backup_database TEXT,
          Note TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          by_ID_user INTEGER
      )
    `);
    console.log('✅ Tạo bảng warning_reports');

    // Kiểm tra các bảng đã tạo
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_reports'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Các bảng báo cáo:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    console.log('\n🎉 Tạo bảng thành công!');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await client.end();
  }
}

createTables(); 