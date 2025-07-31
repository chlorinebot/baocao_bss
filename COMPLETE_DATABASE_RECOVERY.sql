-- ==================================================================
-- SCRIPT KHÔI PHỤC HOÀN CHỈNH DATABASE BSS MANAGEMENT SYSTEM
-- Phiên bản: 2025 - Tương thích với MariaDB
-- Mục đích: Khôi phục toàn bộ database sau khi bị hỏng
-- ==================================================================

-- Tạo database nếu chưa tồn tại
-- CREATE DATABASE IF NOT EXISTS bc_bss 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE bc_bss;

-- ==================================================================
-- PHẦN 1: XÓA TẤT CẢ CÁC ĐỐI TƯỢNG CŨ (NẾU CÓ)
-- ==================================================================

-- Xóa các stored procedures cũ
-- DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;
-- DROP PROCEDURE IF EXISTS GetMonthlySchedule;
-- DROP PROCEDURE IF EXISTS UpdateMonthlySchedule;
-- DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
-- DROP PROCEDURE IF EXISTS GetAllMonthlySchedules;
-- DROP PROCEDURE IF EXISTS GetEmployeeRolesFromWorkSchedule;

-- Xóa các functions cũ
-- DROP FUNCTION IF EXISTS GetEmployeeNameByRole;

-- Xóa các bảng theo thứ tự phụ thuộc (foreign key)
-- DROP TABLE IF EXISTS monthly_schedule_logs;
-- DROP TABLE IF EXISTS monthly_work_schedules;
-- DROP TABLE IF EXISTS nemsm_reports;
-- DROP TABLE IF EXISTS heartbeat_reports;
-- DROP TABLE IF EXISTS patroni_reports;
-- DROP TABLE IF EXISTS transaction_reports;
-- DROP TABLE IF EXISTS alert_reports;
-- DROP TABLE IF EXISTS apisix_reports;
-- DROP TABLE IF EXISTS reports;
-- DROP TABLE IF EXISTS work_schedule;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS roles;
-- DROP TABLE IF EXISTS nemsm;

-- ==================================================================
-- PHẦN 2: TẠO CÁC BẢNG CHÍNH
-- ==================================================================

-- 2.1 Bảng roles (Vai trò người dùng)
CREATE TABLE roles (
  role_id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mặc định cho roles
INSERT INTO roles (role_id, role_name, description) VALUES 
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'user', 'Người dùng thường');

-- 2.2 Bảng users (Người dùng)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) DEFAULT NULL,
  lastName VARCHAR(255) DEFAULT NULL,
  birthday DATE DEFAULT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  role_id INT DEFAULT 2 COMMENT 'Foreign key to roles table: 1=admin, 2=user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo user admin mặc định
INSERT INTO users (username, email, password, firstName, lastName, role_id, isActive) VALUES 
('admin', 'admin@bss.local', '$2b$10$pcwh5EAfmhpS8St9G1/ASudq9vqM.xRbxpujwXm6lCu332LAGZuVC', 'Admin', 'System', 1, TRUE); -- Mật khẩu là tuan1903

-- 2.3 Bảng nemsm (Servers)
CREATE TABLE nemsm (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  server_name VARCHAR(255) NOT NULL,
  ip VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho servers
INSERT INTO nemsm (server_name, ip) VALUES 
('Server-01', '10.2.45.86'),
('Server-02', '10.2.45.87'),
('Server-03', '10.2.45.88');

-- 2.4 Bảng work_schedule (Phân công làm việc)
CREATE TABLE work_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_a INT NOT NULL COMMENT 'ID của nhân viên A',
  employee_b INT NOT NULL COMMENT 'ID của nhân viên B',
  employee_c INT NOT NULL COMMENT 'ID của nhân viên C',
  employee_d INT NOT NULL COMMENT 'ID của nhân viên D',
  active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hoạt động',
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo phân công',
  updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày giờ cập nhật cuối cùng',
  activation_date DATE DEFAULT (CURDATE()) COMMENT 'Ngày phân công có hiệu lực',
  FOREIGN KEY (employee_a) REFERENCES users(id),
  FOREIGN KEY (employee_b) REFERENCES users(id),
  FOREIGN KEY (employee_c) REFERENCES users(id),
  FOREIGN KEY (employee_d) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2.5 Bảng reports (Báo cáo chính)
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  content TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================================
-- PHẦN 3: TẠO CÁC BẢNG BÁO CÁO CHI TIẾT
-- ==================================================================

-- 3.1 Bảng nemsm_reports (Báo cáo NEmSM)
CREATE TABLE nemsm_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  id_nemsm INT UNSIGNED NOT NULL,
  cpu VARCHAR(10) DEFAULT 'false',
  memory VARCHAR(10) DEFAULT 'false',
  disk_space_used VARCHAR(10) DEFAULT 'false',
  network_traffic VARCHAR(10) DEFAULT 'false',
  netstat VARCHAR(10) DEFAULT 'false',
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (id_nemsm) REFERENCES nemsm(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.2 Bảng heartbeat_reports (Báo cáo Heartbeat)
CREATE TABLE heartbeat_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  row_index INT NOT NULL,
  heartbeat_86 VARCHAR(10) DEFAULT 'false',
  heartbeat_87 VARCHAR(10) DEFAULT 'false',
  heartbeat_88 VARCHAR(10) DEFAULT 'false',
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.3 Bảng patroni_reports (Báo cáo Patroni)
CREATE TABLE patroni_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  row_index INT NOT NULL,
  primary_node VARCHAR(10) DEFAULT 'false',
  wal_replay_paused VARCHAR(10) DEFAULT 'false',
  replicas_received_wal VARCHAR(10) DEFAULT 'false',
  primary_wal_location VARCHAR(10) DEFAULT 'false',
  replicas_replayed_wal VARCHAR(10) DEFAULT 'false',
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.4 Bảng transaction_reports (Báo cáo Transaction)
CREATE TABLE transaction_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  row_index INT NOT NULL,
  transaction_monitored VARCHAR(10) DEFAULT 'false',
  notes TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.5 Bảng alert_reports (Báo cáo Alert)
CREATE TABLE alert_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  note_alert_1 TEXT DEFAULT NULL,
  note_alert_2 TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3.6 Bảng apisix_reports (Báo cáo APISIX)
CREATE TABLE apisix_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_report_id INT NOT NULL,
  note_request TEXT DEFAULT NULL,
  note_upstream TEXT DEFAULT NULL,
  FOREIGN KEY (id_report_id) REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================================
-- PHẦN 4: TẠO CÁC BẢNG PHÂN CÔNG THÁNG
-- ==================================================================

-- 4.1 Bảng monthly_work_schedules (Phân công làm việc theo tháng)
CREATE TABLE monthly_work_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  schedule_data TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY month_year_unique (month, year),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2 Bảng monthly_schedule_logs (Log thay đổi phân công tháng)
CREATE TABLE monthly_schedule_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  action VARCHAR(10) NOT NULL COMMENT 'CREATE, UPDATE, DELETE',
  old_data TEXT DEFAULT NULL,
  new_data TEXT DEFAULT NULL,
  performed_by INT NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES monthly_work_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================================
-- PHẦN 5: TẠO CÁC STORED FUNCTIONS VÀ PROCEDURES
-- ==================================================================

-- 5.1 Function GetEmployeeNameByRole
DELIMITER $$
CREATE FUNCTION GetEmployeeNameByRole(p_role CHAR(1)) 
RETURNS VARCHAR(100) 
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_employee_name VARCHAR(100) DEFAULT '';
    
    SELECT 
        CASE p_role
            WHEN 'A' THEN CONCAT(ua.firstName, ' ', ua.lastName)
            WHEN 'B' THEN CONCAT(ub.firstName, ' ', ub.lastName)
            WHEN 'C' THEN CONCAT(uc.firstName, ' ', uc.lastName)
            WHEN 'D' THEN CONCAT(ud.firstName, ' ', ud.lastName)
            ELSE NULL
        END INTO v_employee_name
    FROM work_schedule ws
    LEFT JOIN users ua ON ws.employee_a = ua.id
    LEFT JOIN users ub ON ws.employee_b = ub.id
    LEFT JOIN users uc ON ws.employee_c = uc.id
    LEFT JOIN users ud ON ws.employee_d = ud.id
    WHERE ws.active = 1
    ORDER BY ws.created_date DESC
    LIMIT 1;
    
    RETURN IFNULL(v_employee_name, CONCAT('Role ', p_role));
END$$
DELIMITER ;

-- 5.2 Procedure GetEmployeeRolesFromWorkSchedule
DELIMITER $$
CREATE PROCEDURE GetEmployeeRolesFromWorkSchedule()
BEGIN
    SELECT 
        ws.employee_a,
        ws.employee_b,
        ws.employee_c,
        ws.employee_d,
        CONCAT(ua.firstName, ' ', ua.lastName) as employee_a_name,
        CONCAT(ub.firstName, ' ', ub.lastName) as employee_b_name,
        CONCAT(uc.firstName, ' ', uc.lastName) as employee_c_name,
        CONCAT(ud.firstName, ' ', ud.lastName) as employee_d_name
    FROM work_schedule ws
    LEFT JOIN users ua ON ws.employee_a = ua.id
    LEFT JOIN users ub ON ws.employee_b = ub.id
    LEFT JOIN users uc ON ws.employee_c = uc.id
    LEFT JOIN users ud ON ws.employee_d = ud.id
    WHERE ws.active = 1
    ORDER BY ws.created_date DESC
    LIMIT 1;
END$$
DELIMITER ;

-- 5.3 Procedure GenerateMonthlyScheduleFromRoles
DELIMITER $$
CREATE PROCEDURE GenerateMonthlyScheduleFromRoles(
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT,
    IN p_starting_role CHAR(1)
)
BEGIN
    DECLARE v_days_in_month INT;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_schedule_data TEXT DEFAULT '[';
    DECLARE v_role_offset INT DEFAULT 0;
    DECLARE v_morning_role CHAR(1);
    DECLARE v_afternoon_role CHAR(1);
    DECLARE v_evening_role CHAR(1);
    DECLARE v_morning_name VARCHAR(100);
    DECLARE v_afternoon_name VARCHAR(100);
    DECLARE v_evening_name VARCHAR(100);
    DECLARE v_temp_json TEXT;
    DECLARE v_actual_starting_role CHAR(1);
    DECLARE v_error_occurred BOOLEAN DEFAULT FALSE;
    
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error_occurred = TRUE;

    -- Validate inputs
    IF p_month < 1 OR p_month > 12 THEN
        SELECT 'error' as status, 'Tháng không hợp lệ (1-12)' as message, 0 as schedule_id;
    ELSEIF p_year < 2020 OR p_year > 2030 THEN
        SELECT 'error' as status, 'Năm không hợp lệ (2020-2030)' as message, 0 as schedule_id;
    ELSEIF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SELECT 'error' as status, CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại') as message, 0 as schedule_id;
    ELSE
        SET v_actual_starting_role = IFNULL(p_starting_role, 'A');
        SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));

        CASE v_actual_starting_role
            WHEN 'A' THEN SET v_role_offset = 0;
            WHEN 'B' THEN SET v_role_offset = 1;
            WHEN 'C' THEN SET v_role_offset = 2;
            WHEN 'D' THEN SET v_role_offset = 3;
            ELSE SET v_role_offset = 0;
        END CASE;

        WHILE v_current_day <= v_days_in_month DO
            CASE ((v_role_offset - (v_current_day - 1)) % 4 + 4) % 4
                WHEN 0 THEN SET v_morning_role = 'A';
                WHEN 1 THEN SET v_morning_role = 'B';
                WHEN 2 THEN SET v_morning_role = 'C';
                WHEN 3 THEN SET v_morning_role = 'D';
            END CASE;

            CASE ((v_role_offset - (v_current_day - 1) - 1) % 4 + 4) % 4
                WHEN 0 THEN SET v_afternoon_role = 'A';
                WHEN 1 THEN SET v_afternoon_role = 'B';
                WHEN 2 THEN SET v_afternoon_role = 'C';
                WHEN 3 THEN SET v_afternoon_role = 'D';
            END CASE;

            CASE ((v_role_offset - (v_current_day - 1) - 2) % 4 + 4) % 4
                WHEN 0 THEN SET v_evening_role = 'A';
                WHEN 1 THEN SET v_evening_role = 'B';
                WHEN 2 THEN SET v_evening_role = 'C';
                WHEN 3 THEN SET v_evening_role = 'D';
            END CASE;

            SET v_morning_name = GetEmployeeNameByRole(v_morning_role);
            SET v_afternoon_name = GetEmployeeNameByRole(v_afternoon_role);
            SET v_evening_name = GetEmployeeNameByRole(v_evening_role);

            SET v_temp_json = CONCAT(
                '{"date":', v_current_day, 
                ',"shifts":{',
                '"morning":{"role":"', v_morning_role, '","employee_name":"', v_morning_name, '"},',
                '"afternoon":{"role":"', v_afternoon_role, '","employee_name":"', v_afternoon_name, '"},',
                '"evening":{"role":"', v_evening_role, '","employee_name":"', v_evening_name, '"}',
                '}}'
            );

            IF v_current_day > 1 THEN
                SET v_schedule_data = CONCAT(v_schedule_data, ',');
            END IF;

            SET v_schedule_data = CONCAT(v_schedule_data, v_temp_json);
            SET v_current_day = v_current_day + 1;
        END WHILE;

        SET v_schedule_data = CONCAT(v_schedule_data, ']');

        INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
        VALUES (p_month, p_year, v_schedule_data, p_created_by);

        IF v_error_occurred THEN
            SELECT 'error' as status, 'Có lỗi xảy ra khi tạo phân công' as message, 0 as schedule_id;
        ELSE
            SELECT 
                'success' as status,
                CONCAT('Đã tạo phân công tháng ', p_month, '/', p_year, ' với vai trò ', v_actual_starting_role, ' làm ca sáng ngày đầu') as message,
                LAST_INSERT_ID() as schedule_id;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 5.4 Procedure GetMonthlySchedule
DELIMITER $$
CREATE PROCEDURE GetMonthlySchedule(IN p_month INT, IN p_year INT)
BEGIN
    SELECT * FROM monthly_work_schedules 
    WHERE month = p_month AND year = p_year 
    LIMIT 1;
END$$
DELIMITER ;

-- 5.5 Procedure UpdateMonthlySchedule
DELIMITER $$
CREATE PROCEDURE UpdateMonthlySchedule(
    IN p_id INT, 
    IN p_schedule_data TEXT, 
    IN p_updated_by INT
)
BEGIN
    UPDATE monthly_work_schedules 
    SET 
        schedule_data = p_schedule_data,
        updated_at = NOW()
    WHERE id = p_id;
    
    SELECT 'Updated successfully' as message;
END$$
DELIMITER ;

-- 5.6 Procedure DeleteMonthlySchedule
DELIMITER $$
CREATE PROCEDURE DeleteMonthlySchedule(IN p_id INT, IN p_deleted_by INT)
BEGIN
    DELETE FROM monthly_work_schedules WHERE id = p_id;
    SELECT 'Deleted successfully' as message;
END$$
DELIMITER ;

-- 5.7 Procedure GetAllMonthlySchedules
DELIMITER $$
CREATE PROCEDURE GetAllMonthlySchedules()
BEGIN
    SELECT 
        id,
        month,
        year,
        schedule_data,
        created_by,
        created_at,
        updated_at
    FROM monthly_work_schedules 
    ORDER BY year DESC, month DESC;
END$$
DELIMITER ;

-- ==================================================================
-- PHẦN 6: TẠO INDEX VÀ TỐI ƯU HÓA
-- ==================================================================

-- Index cho bảng users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Index cho bảng reports
CREATE INDEX idx_reports_user_id ON reports(id_user);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Index cho các bảng reports
CREATE INDEX idx_nemsm_reports_report_id ON nemsm_reports(id_report_id);
CREATE INDEX idx_heartbeat_reports_report_id ON heartbeat_reports(id_report_id);
CREATE INDEX idx_patroni_reports_report_id ON patroni_reports(id_report_id);
CREATE INDEX idx_transaction_reports_report_id ON transaction_reports(id_report_id);
CREATE INDEX idx_alert_reports_report_id ON alert_reports(id_report_id);
CREATE INDEX idx_apisix_reports_report_id ON apisix_reports(id_report_id);

-- Index cho work_schedule
CREATE INDEX idx_work_schedule_active ON work_schedule(active);
CREATE INDEX idx_work_schedule_created_date ON work_schedule(created_date);

-- Index cho monthly_work_schedules
CREATE INDEX idx_monthly_schedules_month_year ON monthly_work_schedules(month, year);
CREATE INDEX idx_monthly_schedules_created_by ON monthly_work_schedules(created_by);

-- ==================================================================
-- PHẦN 7: THÊM DỮ LIỆU MẪU CƠ BẢN
-- ==================================================================

-- Thêm một số users mẫu
INSERT INTO users (username, email, password, firstName, lastName, role_id, isActive) VALUES 
('user1', 'user1@bss.local', '$2b$10$8Y8Z9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g', 'Nguyễn', 'Văn A', 2, TRUE),
('user2', 'user2@bss.local', '$2b$10$8Y8Z9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g', 'Trần', 'Thị B', 2, TRUE),
('user3', 'user3@bss.local', '$2b$10$8Y8Z9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g', 'Lê', 'Văn C', 2, TRUE),
('user4', 'user4@bss.local', '$2b$10$8Y8Z9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g9E1CJ1g', 'Phạm', 'Thị D', 2, TRUE);

-- Thêm work_schedule mẫu (giả sử user id từ 2-5)
INSERT INTO work_schedule (employee_a, employee_b, employee_c, employee_d, active) VALUES 
(2, 3, 4, 5, TRUE);

-- ==================================================================
-- PHẦN 8: KIỂM TRA VÀ XÁC NHẬN
-- ==================================================================

-- Kiểm tra tất cả các bảng đã được tạo
SELECT 'Kiểm tra danh sách bảng:' as info;
SHOW TABLES;

-- Kiểm tra các stored procedures
SELECT 'Kiểm tra các stored procedures:' as info;
SHOW PROCEDURE STATUS WHERE Db = 'bc_bss';

-- Kiểm tra các functions
SELECT 'Kiểm tra các functions:' as info;
SHOW FUNCTION STATUS WHERE Db = 'bc_bss';

-- Test function GetEmployeeNameByRole
SELECT 'Test function GetEmployeeNameByRole:' as info;
SELECT GetEmployeeNameByRole('A') as test_role_a;

-- Đếm số lượng bảng đã tạo
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'bc_bss';

-- Thông báo hoàn thành
SELECT '========================================' as separator;
SELECT 'KHÔI PHỤC DATABASE HOÀN TẤT!' as status;
SELECT 'Tổng số bảng được tạo:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'bc_bss';
SELECT 'Database sẵn sàng sử dụng!' as final_status;
SELECT '========================================' as separator; 