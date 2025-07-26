-- ===========================================
-- COMPLETE MONTHLY WORK SCHEDULE SYSTEM
-- Hệ thống quản lý ca làm việc hàng tháng đầy đủ
-- ===========================================

-- 1. TẠO BẢNG CƠ SỞ DỮ LIỆU
-- ===========================================

-- Tạo bảng ca làm việc hàng tháng (MariaDB compatible)
CREATE TABLE IF NOT EXISTS monthly_work_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2030),
    schedule_data TEXT NOT NULL COMMENT 'Dữ liệu phân công ca làm việc theo ngày (JSON format)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Tạo unique constraint để đảm bảo chỉ có 1 phân công cho mỗi tháng/năm
    UNIQUE KEY unique_month_year (month, year),
    
    -- Foreign key reference đến bảng users
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index để tăng hiệu suất truy vấn
    INDEX idx_month_year (month, year),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Tạo bảng log để theo dõi thay đổi phân công
CREATE TABLE IF NOT EXISTS monthly_schedule_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    old_data TEXT COMMENT 'Dữ liệu cũ trước khi thay đổi (JSON format)',
    new_data TEXT COMMENT 'Dữ liệu mới sau khi thay đổi (JSON format)',
    changed_by INT NOT NULL,
    change_reason VARCHAR(255) COMMENT 'Lý do thay đổi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES monthly_work_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- Thêm comment cho các bảng
ALTER TABLE monthly_work_schedules COMMENT = 'Bảng lưu trữ phân công ca làm việc hàng tháng';
ALTER TABLE monthly_schedule_logs COMMENT = 'Bảng log theo dõi thay đổi phân công ca làm việc';

-- 2. XÓA CÁC PROCEDURE/FUNCTION CŨ NẾU TỒN TẠI
-- ===========================================

DROP PROCEDURE IF EXISTS GenerateMonthlySchedule;
DROP PROCEDURE IF EXISTS CreateSampleSchedule;
DROP PROCEDURE IF EXISTS GetMonthlySchedule;
DROP PROCEDURE IF EXISTS UpdateMonthlySchedule;
DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
DROP FUNCTION IF EXISTS GetEmployeeName;
DROP TRIGGER IF EXISTS monthly_schedule_update_log;
DROP TRIGGER IF EXISTS monthly_schedule_delete_log;
DROP VIEW IF EXISTS v_monthly_schedules;

-- 3. TẠO CÁC FUNCTION VÀ PROCEDURE
-- ===========================================

-- Function để lấy tên nhân viên
DELIMITER $$

CREATE FUNCTION GetEmployeeName(p_employee_id INT) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_name VARCHAR(100);
    
    SELECT CONCAT(firstName, ' ', lastName) 
    INTO v_name
    FROM users 
    WHERE id = p_employee_id AND role_id = 2;
    
    RETURN IFNULL(v_name, 'Không xác định');
END$$

DELIMITER ;

-- Procedure tạo phân công tự động
DELIMITER $$

CREATE PROCEDURE GenerateMonthlySchedule(
    IN p_month INT,
    IN p_year INT,
    IN p_employee_ids TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_days_in_month INT;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_employee_count INT;
    DECLARE v_current_employee_index INT DEFAULT 0;
    DECLARE v_schedule_data TEXT DEFAULT '';
    DECLARE v_employee_id_morning INT;
    DECLARE v_employee_id_afternoon INT;
    DECLARE v_employee_id_evening INT;
    DECLARE v_temp_json TEXT;
    DECLARE v_first_day BOOLEAN DEFAULT TRUE;
    DECLARE v_employee_name_morning VARCHAR(100);
    DECLARE v_employee_name_afternoon VARCHAR(100);
    DECLARE v_employee_name_evening VARCHAR(100);
    
    -- Kiểm tra xem đã có phân công cho tháng này chưa
    IF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phân công cho tháng này đã tồn tại';
    END IF;
    
    -- Tính số ngày trong tháng
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
    
    -- Đếm số nhân viên
    SET v_employee_count = (CHAR_LENGTH(p_employee_ids) - CHAR_LENGTH(REPLACE(p_employee_ids, ',', '')) + 1);
    
    -- Kiểm tra input
    IF v_employee_count = 0 OR p_employee_ids = '' OR p_employee_ids IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Danh sách nhân viên không được trống';
    END IF;
    
    -- Bắt đầu tạo JSON array
    SET v_schedule_data = '[';
    
    WHILE v_current_day <= v_days_in_month DO
        -- Lấy employee_id cho 3 ca trong ngày (luân phiên)
        SET v_employee_id_morning = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', (v_current_employee_index % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        SET v_employee_id_afternoon = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', ((v_current_employee_index + 1) % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        SET v_employee_id_evening = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', ((v_current_employee_index + 2) % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        
        -- Lấy tên nhân viên
        SET v_employee_name_morning = GetEmployeeName(v_employee_id_morning);
        SET v_employee_name_afternoon = GetEmployeeName(v_employee_id_afternoon);
        SET v_employee_name_evening = GetEmployeeName(v_employee_id_evening);
        
        -- Tạo JSON cho ngày hiện tại với 3 ca khác nhau
        SET v_temp_json = CONCAT(
            '{"date":', v_current_day, 
            ',"shifts":{',
            '"morning":{"employee_id":', IFNULL(v_employee_id_morning, 'null'), ',"employee_name":"', IFNULL(v_employee_name_morning, ''), '"},',
            '"afternoon":{"employee_id":', IFNULL(v_employee_id_afternoon, 'null'), ',"employee_name":"', IFNULL(v_employee_name_afternoon, ''), '"},',
            '"evening":{"employee_id":', IFNULL(v_employee_id_evening, 'null'), ',"employee_name":"', IFNULL(v_employee_name_evening, ''), '"}',
            '}}'
        );
        
        -- Thêm dấu phẩy nếu không phải ngày đầu tiên
        IF NOT v_first_day THEN
            SET v_schedule_data = CONCAT(v_schedule_data, ',');
        END IF;
        
        SET v_schedule_data = CONCAT(v_schedule_data, v_temp_json);
        SET v_first_day = FALSE;
        
        -- Chuyển sang ngày tiếp theo (mỗi ngày nhân viên luân phiên 1 ca)
        SET v_current_day = v_current_day + 1;
        SET v_current_employee_index = (v_current_employee_index + 1) % v_employee_count;
    END WHILE;
    
    -- Đóng JSON array
    SET v_schedule_data = CONCAT(v_schedule_data, ']');
    
    -- Lưu vào database
    INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
    VALUES (p_month, p_year, v_schedule_data, p_created_by);
    
    -- Log tạo phân công
    INSERT INTO monthly_schedule_logs (schedule_id, action_type, new_data, changed_by, change_reason)
    VALUES (LAST_INSERT_ID(), 'CREATE', v_schedule_data, p_created_by, 'Tạo phân công tự động');
    
    -- Trả về thông báo thành công
    SELECT CONCAT('Đã tạo phân công cho tháng ', p_month, '/', p_year, ' với ', v_days_in_month, ' ngày và ', v_employee_count, ' nhân viên') as message,
           LAST_INSERT_ID() as schedule_id;
    
END$$

DELIMITER ;

-- Procedure lấy phân công theo tháng/năm
DELIMITER $$

CREATE PROCEDURE GetMonthlySchedule(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT 
        ms.id,
        ms.month,
        ms.year,
        ms.schedule_data,
        ms.created_at,
        ms.updated_at,
        CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
        u.id as created_by_id
    FROM monthly_work_schedules ms
    LEFT JOIN users u ON ms.created_by = u.id
    WHERE ms.month = p_month AND ms.year = p_year;
END$$

DELIMITER ;

-- Procedure cập nhật phân công
DELIMITER $$

CREATE PROCEDURE UpdateMonthlySchedule(
    IN p_schedule_id INT,
    IN p_schedule_data TEXT,
    IN p_updated_by INT
)
BEGIN
    DECLARE v_old_data TEXT;
    
    -- Lấy dữ liệu cũ
    SELECT schedule_data INTO v_old_data 
    FROM monthly_work_schedules 
    WHERE id = p_schedule_id;
    
    -- Cập nhật dữ liệu
    UPDATE monthly_work_schedules 
    SET schedule_data = p_schedule_data, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_schedule_id;
    
    -- Kiểm tra có được cập nhật không
    IF ROW_COUNT() > 0 THEN
        SELECT CONCAT('Đã cập nhật phân công ID: ', p_schedule_id) as message;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy phân công để cập nhật';
    END IF;
END$$

DELIMITER ;

-- Procedure xóa phân công
DELIMITER $$

CREATE PROCEDURE DeleteMonthlySchedule(
    IN p_schedule_id INT,
    IN p_deleted_by INT
)
BEGIN
    DECLARE v_month INT;
    DECLARE v_year INT;
    
    -- Lấy thông tin tháng/năm
    SELECT month, year INTO v_month, v_year
    FROM monthly_work_schedules 
    WHERE id = p_schedule_id;
    
    -- Xóa phân công
    DELETE FROM monthly_work_schedules WHERE id = p_schedule_id;
    
    -- Kiểm tra có được xóa không
    IF ROW_COUNT() > 0 THEN
        SELECT CONCAT('Đã xóa phân công tháng ', v_month, '/', v_year) as message;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy phân công để xóa';
    END IF;
END$$

DELIMITER ;

-- Procedure lấy tất cả phân công
DELIMITER $$

CREATE PROCEDURE GetAllMonthlySchedules()
BEGIN
    SELECT 
        ms.id,
        ms.month,
        ms.year,
        CONCAT('Tháng ', ms.month, '/', ms.year) as period_name,
        ms.created_at,
        ms.updated_at,
        CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
        -- Đếm số ngày trong phân công
        (CHAR_LENGTH(ms.schedule_data) - CHAR_LENGTH(REPLACE(ms.schedule_data, '"date":', ''))) as day_count
    FROM monthly_work_schedules ms
    LEFT JOIN users u ON ms.created_by = u.id
    ORDER BY ms.year DESC, ms.month DESC;
END$$

DELIMITER ;

-- Procedure lấy danh sách nhân viên có thể phân công
DELIMITER $$

CREATE PROCEDURE GetAvailableEmployees()
BEGIN
    SELECT 
        id,
        username,
        CONCAT(firstName, ' ', lastName) as full_name,
        firstName,
        lastName,
        email,
        isActive
    FROM users 
    WHERE role_id = 2 AND isActive = 1
    ORDER BY firstName, lastName;
END$$

DELIMITER ;

-- 4. TẠO TRIGGER
-- ===========================================

DELIMITER $$

CREATE TRIGGER monthly_schedule_update_log
AFTER UPDATE ON monthly_work_schedules
FOR EACH ROW
BEGIN
    INSERT INTO monthly_schedule_logs (
        schedule_id, 
        action_type, 
        old_data, 
        new_data, 
        changed_by,
        change_reason
    ) VALUES (
        NEW.id,
        'UPDATE',
        OLD.schedule_data,
        NEW.schedule_data,
        NEW.created_by,
        'Cập nhật phân công ca làm việc'
    );
END$$

CREATE TRIGGER monthly_schedule_delete_log
BEFORE DELETE ON monthly_work_schedules
FOR EACH ROW
BEGIN
    INSERT INTO monthly_schedule_logs (
        schedule_id, 
        action_type, 
        old_data, 
        new_data, 
        changed_by,
        change_reason
    ) VALUES (
        OLD.id,
        'DELETE',
        CONCAT('{"month":', OLD.month, ',"year":', OLD.year, ',"schedule_data":', OLD.schedule_data, '}'),
        NULL,
        OLD.created_by,
        'Xóa phân công ca làm việc'
    );
END$$

DELIMITER ;

-- 5. TẠO VIEW
-- ===========================================

CREATE VIEW v_monthly_schedules AS
SELECT 
    ms.id,
    ms.month,
    ms.year,
    CONCAT('Tháng ', ms.month, '/', ms.year) as period_name,
    ms.schedule_data,
    ms.created_at,
    ms.updated_at,
    CONCAT(u.firstName, ' ', u.lastName) as created_by_name,
    u.id as created_by_id,
    -- Thêm thông tin thống kê
    (CHAR_LENGTH(ms.schedule_data) - CHAR_LENGTH(REPLACE(ms.schedule_data, '"date":', ''))) as total_days,
    CASE 
        WHEN ms.month = MONTH(CURDATE()) AND ms.year = YEAR(CURDATE()) THEN 'Tháng hiện tại'
        WHEN ms.year = YEAR(CURDATE()) THEN 'Cùng năm'
        ELSE 'Năm khác'
    END as period_status
FROM monthly_work_schedules ms
LEFT JOIN users u ON ms.created_by = u.id
ORDER BY ms.year DESC, ms.month DESC;

-- 6. QUERIES KIỂM TRA VÀ TEST
-- ===========================================

-- Kiểm tra cấu trúc bảng
DESCRIBE monthly_work_schedules;
DESCRIBE monthly_schedule_logs;

-- Kiểm tra procedures đã tạo
SHOW PROCEDURE STATUS WHERE Name LIKE '%Monthly%';

-- Kiểm tra functions đã tạo
SHOW FUNCTION STATUS WHERE Name LIKE '%Employee%';

-- Kiểm tra triggers
SHOW TRIGGERS LIKE 'monthly_%';

-- Kiểm tra view
SHOW CREATE VIEW v_monthly_schedules;

-- 7. SAMPLE DATA VÀ TEST
-- ===========================================

-- Lấy danh sách nhân viên có thể phân công
CALL GetAvailableEmployees();

-- Tạo phân công mẫu cho tháng hiện tại (chỉ chạy nếu có nhân viên với ID 2,3,4,5)
-- CALL GenerateMonthlySchedule(MONTH(CURDATE()), YEAR(CURDATE()), '2,3,4,5', 1);

-- Lấy tất cả phân công
CALL GetAllMonthlySchedules();

-- Lấy phân công của tháng hiện tại
-- CALL GetMonthlySchedule(MONTH(CURDATE()), YEAR(CURDATE()));

-- Xem view
SELECT * FROM v_monthly_schedules;

-- Xem logs
SELECT * FROM monthly_schedule_logs ORDER BY created_at DESC LIMIT 10;

-- 8. QUERIES QUẢN LÝ CHO ADMIN
-- ===========================================

-- Query tạo phân công mới
/*
CALL GenerateMonthlySchedule(
    12,  -- tháng
    2024, -- năm  
    '2,3,4,5', -- danh sách ID nhân viên (cách nhau bởi dấu phẩy)
    1  -- ID của admin tạo
);
*/

-- Query lấy phân công theo tháng/năm
/*
CALL GetMonthlySchedule(12, 2024);
*/

-- Query cập nhật phân công
/*
CALL UpdateMonthlySchedule(
    1, -- ID của phân công
    '[{"date":1,"shifts":{"morning":{"employee_id":2,"employee_name":"Nguyen Van A"}}}]', -- JSON data mới
    1  -- ID của admin cập nhật
);
*/

-- Query xóa phân công
/*
CALL DeleteMonthlySchedule(1, 1);
*/

-- Query thống kê
SELECT 
    COUNT(*) as total_schedules,
    COUNT(DISTINCT year) as total_years,
    MIN(CONCAT(year, '-', LPAD(month, 2, '0'))) as earliest_schedule,
    MAX(CONCAT(year, '-', LPAD(month, 2, '0'))) as latest_schedule
FROM monthly_work_schedules;

-- Query kiểm tra trùng lặp tháng/năm
SELECT month, year, COUNT(*) as duplicate_count
FROM monthly_work_schedules
GROUP BY month, year
HAVING COUNT(*) > 1;

-- ===========================================
-- KẾT THÚC SCRIPT
-- ===========================================

SELECT 'Monthly Work Schedule System đã được cài đặt thành công!' as status; 