-- Migration: Tạo 5 bảng báo cáo riêng biệt
-- Tạo bảng báo cáo NEMSM (Node Exporter)
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
);

-- Tạo bảng báo cáo Patroni
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
);

-- Tạo bảng báo cáo Database Transactions
CREATE TABLE IF NOT EXISTS database_reports (
    ID SERIAL PRIMARY KEY,
    Transactions_giam_sat TEXT,
    Note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    by_ID_user INTEGER
);

-- Tạo bảng báo cáo Heartbeat
CREATE TABLE IF NOT EXISTS heartbeat_reports (
    ID SERIAL PRIMARY KEY,
    Post_heartbeat_10_2_45_86 TEXT,
    Post_heartbeat_10_2_45_87 TEXT,
    Post_heartbeat_10_2_45_88 TEXT,
    Note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    by_ID_user INTEGER
);

-- Tạo bảng báo cáo Warning
CREATE TABLE IF NOT EXISTS warning_reports (
    ID SERIAL PRIMARY KEY,
    Warning_Critical TEXT,
    info_backup_database TEXT,
    Note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    by_ID_user INTEGER
);

-- Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_nemsm_reports_user_date ON nemsm_reports(by_ID_user, created_at);
CREATE INDEX IF NOT EXISTS idx_patroni_reports_user_date ON patroni_reports(by_ID_user, created_at);
CREATE INDEX IF NOT EXISTS idx_database_reports_user_date ON database_reports(by_ID_user, created_at);
CREATE INDEX IF NOT EXISTS idx_heartbeat_reports_user_date ON heartbeat_reports(by_ID_user, created_at);
CREATE INDEX IF NOT EXISTS idx_warning_reports_user_date ON warning_reports(by_ID_user, created_at);

-- Thêm foreign key constraints nếu cần
-- ALTER TABLE nemsm_reports ADD CONSTRAINT fk_nemsm_user FOREIGN KEY (by_ID_user) REFERENCES users(ID);
-- ALTER TABLE patroni_reports ADD CONSTRAINT fk_patroni_user FOREIGN KEY (by_ID_user) REFERENCES users(ID);
-- ALTER TABLE database_reports ADD CONSTRAINT fk_database_user FOREIGN KEY (by_ID_user) REFERENCES users(ID);
-- ALTER TABLE heartbeat_reports ADD CONSTRAINT fk_heartbeat_user FOREIGN KEY (by_ID_user) REFERENCES users(ID);
-- ALTER TABLE warning_reports ADD CONSTRAINT fk_warning_user FOREIGN KEY (by_ID_user) REFERENCES users(ID); 