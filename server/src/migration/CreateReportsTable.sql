-- Migration: Create Reports Table
-- Tạo bảng báo cáo ca trực

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    node_exporter JSONB DEFAULT NULL,
    patroni JSONB DEFAULT NULL,
    transactions JSONB DEFAULT NULL,
    heartbeat JSONB DEFAULT NULL,
    alerts JSONB DEFAULT NULL,
    additional_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);
CREATE INDEX IF NOT EXISTS idx_reports_user_date ON reports(user_id, date);

-- Tạo constraint để đảm bảo mỗi user chỉ có một báo cáo mỗi ngày
ALTER TABLE reports 
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comment các cột
COMMENT ON TABLE reports IS 'Bảng lưu trữ báo cáo ca trực hàng ngày';
COMMENT ON COLUMN reports.id IS 'ID báo cáo';
COMMENT ON COLUMN reports.user_id IS 'ID người dùng tạo báo cáo';
COMMENT ON COLUMN reports.date IS 'Ngày báo cáo';
COMMENT ON COLUMN reports.node_exporter IS 'Dữ liệu kiểm tra Node Exporter (JSON)';
COMMENT ON COLUMN reports.patroni IS 'Dữ liệu kiểm tra PostgreSQL Patroni (JSON)';
COMMENT ON COLUMN reports.transactions IS 'Dữ liệu kiểm tra Database Transactions (JSON)';
COMMENT ON COLUMN reports.heartbeat IS 'Dữ liệu kiểm tra PostgreHeartbeat (JSON)';
COMMENT ON COLUMN reports.alerts IS 'Dữ liệu cảnh báo (JSON)';
COMMENT ON COLUMN reports.additional_notes IS 'Ghi chú bổ sung';
COMMENT ON COLUMN reports.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN reports.updated_at IS 'Thời gian cập nhật cuối'; 