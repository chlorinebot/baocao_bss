-- Tạo bảng reports trung gian
CREATE TABLE IF NOT EXISTS reports (
    ID SERIAL PRIMARY KEY,
    nemsm_report_id INTEGER REFERENCES nemsm_reports(ID),
    patroni_report_id INTEGER REFERENCES patroni_reports(ID),
    database_report_id INTEGER REFERENCES database_reports(ID),
    heartbeat_report_id INTEGER REFERENCES heartbeat_reports(ID),
    warning_report_id INTEGER REFERENCES warning_reports(ID),
    by_ID_user INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nemsm_report FOREIGN KEY (nemsm_report_id) REFERENCES nemsm_reports(ID) ON DELETE SET NULL,
    CONSTRAINT fk_patroni_report FOREIGN KEY (patroni_report_id) REFERENCES patroni_reports(ID) ON DELETE SET NULL,
    CONSTRAINT fk_database_report FOREIGN KEY (database_report_id) REFERENCES database_reports(ID) ON DELETE SET NULL,
    CONSTRAINT fk_heartbeat_report FOREIGN KEY (heartbeat_report_id) REFERENCES heartbeat_reports(ID) ON DELETE SET NULL,
    CONSTRAINT fk_warning_report FOREIGN KEY (warning_report_id) REFERENCES warning_reports(ID) ON DELETE SET NULL
);

-- Tạo index cho hiệu suất
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(by_ID_user, created_at);

-- Thêm comment cho bảng
COMMENT ON TABLE reports IS 'Bảng trung gian liên kết các báo cáo từ 5 bảng riêng biệt';
COMMENT ON COLUMN reports.nemsm_report_id IS 'ID của báo cáo Node Exporter';
COMMENT ON COLUMN reports.patroni_report_id IS 'ID của báo cáo Patroni';
COMMENT ON COLUMN reports.database_report_id IS 'ID của báo cáo Database Transactions';
COMMENT ON COLUMN reports.heartbeat_report_id IS 'ID của báo cáo Heartbeat';
COMMENT ON COLUMN reports.warning_report_id IS 'ID của báo cáo Warning';
COMMENT ON COLUMN reports.by_ID_user IS 'ID của người dùng tạo báo cáo'; 