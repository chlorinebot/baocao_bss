-- ===========================================
-- MONTHLY WORK SCHEDULE SYSTEM (CORRECT VERSION)
-- Hệ thống ca làm việc hàng tháng dựa trên vai trò A,B,C,D từ work_schedule
-- ===========================================

-- 1. TẠO BẢNG MONTHLY_WORK_SCHEDULES (Riêng biệt với work_schedule)
-- ===========================================

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

-- 2. XÓA CÁC PROCEDURE CŨ
-- ===========================================

DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;
DROP PROCEDURE IF EXISTS GetMonthlySchedule;
DROP PROCEDURE IF EXISTS UpdateMonthlySchedule;
DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
DROP PROCEDURE IF EXISTS GetAllMonthlySchedules;
DROP PROCEDURE IF EXISTS GetEmployeeRolesFromWorkSchedule;
DROP FUNCTION IF EXISTS GetEmployeeNameByRole;
DROP VIEW IF EXISTS v_monthly_schedules;
DROP VIEW IF EXISTS v_employee_roles;

-- 3. TẠO FUNCTION VÀ PROCEDURE MỚI
-- ===========================================

-- Function lấy tên nhân viên theo vai trò A,B,C,D
DELIMITER $$

CREATE FUNCTION GetEmployeeNameByRole(p_role CHAR(1)) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_employee_id INT DEFAULT 0;
    DECLARE v_name VARCHAR(100);
    
    -- Lấy ID nhân viên theo vai trò từ work_schedule active
    CASE p_role
        WHEN 'A' THEN 
            SELECT employee_a INTO v_employee_id 
            FROM work_schedule WHERE active = 1 LIMIT 1;
        WHEN 'B' THEN 
            SELECT employee_b INTO v_employee_id 
            FROM work_schedule WHERE active = 1 LIMIT 1;
        WHEN 'C' THEN 
            SELECT employee_c INTO v_employee_id 
            FROM work_schedule WHERE active = 1 LIMIT 1;
        WHEN 'D' THEN 
            SELECT employee_d INTO v_employee_id 
            FROM work_schedule WHERE active = 1 LIMIT 1;
    END CASE;
    
    -- Lấy tên nhân viên
    IF v_employee_id > 0 THEN
        SELECT CONCAT(firstName, ' ', lastName) 
        INTO v_name
        FROM users 
        WHERE id = v_employee_id;
        
        RETURN IFNULL(v_name, 'Không xác định');
    ELSE
        RETURN 'Chưa phân công';
    END IF;
END$$

DELIMITER ;

-- Procedure lấy vai trò nhân viên từ work_schedule
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
        CONCAT(ud.firstName, ' ', ud.lastName) as employee_d_name,
        ws.created_date,
        ws.activation_date
    FROM work_schedule ws
    LEFT JOIN users ua ON ws.employee_a = ua.id
    LEFT JOIN users ub ON ws.employee_b = ub.id
    LEFT JOIN users uc ON ws.employee_c = uc.id
    LEFT JOIN users ud ON ws.employee_d = ud.id
    WHERE ws.active = 1
    LIMIT 1;
END$$

DELIMITER ;

-- Procedure tạo phân công hàng tháng dựa trên vai trò A,B,C,D
DELIMITER $$

CREATE PROCEDURE GenerateMonthlyScheduleFromRoles(
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT,
    IN p_starting_role CHAR(1) DEFAULT 'A'
)
BEGIN
    DECLARE v_days_in_month INT;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_employee_a INT DEFAULT 0;
    DECLARE v_employee_b INT DEFAULT 0;
    DECLARE v_employee_c INT DEFAULT 0;
    DECLARE v_employee_d INT DEFAULT 0;
    DECLARE v_schedule_data TEXT DEFAULT '';
    DECLARE v_morning_role CHAR(1);
    DECLARE v_afternoon_role CHAR(1);
    DECLARE v_evening_role CHAR(1);
    DECLARE v_temp_json TEXT;
    DECLARE v_first_day BOOLEAN DEFAULT TRUE;
    DECLARE v_morning_name VARCHAR(100);
    DECLARE v_afternoon_name VARCHAR(100);
    DECLARE v_evening_name VARCHAR(100);
    DECLARE v_role_offset INT DEFAULT 0;
    
    -- Kiểm tra xem đã có phân công cho tháng này chưa
    IF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phân công cho tháng này đã tồn tại';
    END IF;
    
    -- Lấy vai trò nhân viên từ work_schedule active
    SELECT employee_a, employee_b, employee_c, employee_d
    INTO v_employee_a, v_employee_b, v_employee_c, v_employee_d
    FROM work_schedule 
    WHERE active = 1
    LIMIT 1;
    
    -- Kiểm tra có phân công vai trò không
    IF v_employee_a = 0 AND v_employee_b = 0 AND v_employee_c = 0 AND v_employee_d = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không có phân công vai trò A,B,C,D nào trong hệ thống';
    END IF;
    
    -- Tính offset dựa trên starting role
    CASE p_starting_role
        WHEN 'A' THEN SET v_role_offset = 0;
        WHEN 'B' THEN SET v_role_offset = 1;
        WHEN 'C' THEN SET v_role_offset = 2;
        WHEN 'D' THEN SET v_role_offset = 3;
        ELSE SET v_role_offset = 0;
    END CASE;
    
    -- Tính số ngày trong tháng
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
    
    -- Bắt đầu tạo JSON array
    SET v_schedule_data = '[';
    
    WHILE v_current_day <= v_days_in_month DO
        -- Xác định vai trò cho từng ca dựa trên ngày và offset
        CASE ((v_current_day - 1 + v_role_offset) % 4)
            WHEN 0 THEN 
                SET v_morning_role = 'A';
                SET v_afternoon_role = 'B';
                SET v_evening_role = 'C';
            WHEN 1 THEN 
                SET v_morning_role = 'B';
                SET v_afternoon_role = 'C';
                SET v_evening_role = 'D';
            WHEN 2 THEN 
                SET v_morning_role = 'C';
                SET v_afternoon_role = 'D';
                SET v_evening_role = 'A';
            WHEN 3 THEN 
                SET v_morning_role = 'D';
                SET v_afternoon_role = 'A';
                SET v_evening_role = 'B';
        END CASE;
        
        -- Lấy tên nhân viên theo vai trò
        SET v_morning_name = GetEmployeeNameByRole(v_morning_role);
        SET v_afternoon_name = GetEmployeeNameByRole(v_afternoon_role);
        SET v_evening_name = GetEmployeeNameByRole(v_evening_role);
        
        -- Tạo JSON cho ngày hiện tại với 3 ca khác nhau
        SET v_temp_json = CONCAT(
            '{"date":', v_current_day, 
            ',"shifts":{',
            '"morning":{"role":"', v_morning_role, '","employee_name":"', IFNULL(v_morning_name, ''), '"},',
            '"afternoon":{"role":"', v_afternoon_role, '","employee_name":"', IFNULL(v_afternoon_name, ''), '"},',
            '"evening":{"role":"', v_evening_role, '","employee_name":"', IFNULL(v_evening_name, ''), '"}',
            '}}'
        );
        
        -- Thêm dấu phẩy nếu không phải ngày đầu tiên
        IF NOT v_first_day THEN
            SET v_schedule_data = CONCAT(v_schedule_data, ',');
        END IF;
        
        SET v_schedule_data = CONCAT(v_schedule_data, v_temp_json);
        SET v_first_day = FALSE;
        
        -- Chuyển sang ngày tiếp theo
        SET v_current_day = v_current_day + 1;
    END WHILE;
    
    -- Đóng JSON array
    SET v_schedule_data = CONCAT(v_schedule_data, ']');
    
    -- Lưu vào database
    INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
    VALUES (p_month, p_year, v_schedule_data, p_created_by);
    
    -- Log tạo phân công
    INSERT INTO monthly_schedule_logs (schedule_id, action_type, new_data, changed_by, change_reason)
    VALUES (LAST_INSERT_ID(), 'CREATE', v_schedule_data, p_created_by, CONCAT('Tạo phân công tự động bắt đầu từ vai trò ', p_starting_role));
    
    -- Trả về thông báo thành công
    SELECT CONCAT('Đã tạo phân công cho tháng ', p_month, '/', p_year, ' với ', v_days_in_month, ' ngày bắt đầu từ vai trò ', p_starting_role) as message,
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
        -- Log thay đổi
        INSERT INTO monthly_schedule_logs (schedule_id, action_type, old_data, new_data, changed_by, change_reason)
        VALUES (p_schedule_id, 'UPDATE', v_old_data, p_schedule_data, p_updated_by, 'Cập nhật phân công ca làm việc');
        
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
    DECLARE v_schedule_data TEXT;
    
    -- Lấy thông tin tháng/năm và data
    SELECT month, year, schedule_data INTO v_month, v_year, v_schedule_data
    FROM monthly_work_schedules 
    WHERE id = p_schedule_id;
    
    -- Log trước khi xóa
    INSERT INTO monthly_schedule_logs (schedule_id, action_type, old_data, changed_by, change_reason)
    VALUES (p_schedule_id, 'DELETE', v_schedule_data, p_deleted_by, 'Xóa phân công ca làm việc');
    
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

-- 4. TẠO VIEW ĐỂ DỄ TRUY VẤN
-- ===========================================

-- View cho phân công hàng tháng với thông tin vai trò
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

-- View cho vai trò nhân viên hiện tại
CREATE VIEW v_employee_roles AS
SELECT 
    ws.id,
    ws.employee_a,
    ws.employee_b, 
    ws.employee_c,
    ws.employee_d,
    CONCAT(ua.firstName, ' ', ua.lastName) as employee_a_name,
    CONCAT(ub.firstName, ' ', ub.lastName) as employee_b_name,
    CONCAT(uc.firstName, ' ', uc.lastName) as employee_c_name,
    CONCAT(ud.firstName, ' ', ud.lastName) as employee_d_name,
    ws.active,
    ws.created_date,
    ws.updated_date,
    ws.activation_date
FROM work_schedule ws
LEFT JOIN users ua ON ws.employee_a = ua.id
LEFT JOIN users ub ON ws.employee_b = ub.id
LEFT JOIN users uc ON ws.employee_c = uc.id
LEFT JOIN users ud ON ws.employee_d = ud.id
WHERE ws.active = 1;

-- 5. QUERIES KIỂM TRA VÀ TEST
-- ===========================================

-- Kiểm tra cấu trúc bảng
DESCRIBE monthly_work_schedules;
DESCRIBE monthly_schedule_logs;

-- Kiểm tra procedures đã tạo
SHOW PROCEDURE STATUS WHERE Name LIKE '%Monthly%';

-- Kiểm tra functions đã tạo
SHOW FUNCTION STATUS WHERE Name LIKE '%Employee%';

-- Kiểm tra views
SHOW CREATE VIEW v_monthly_schedules;
SHOW CREATE VIEW v_employee_roles;

-- 6. TEST VÀ SAMPLE DATA
-- ===========================================

-- Lấy vai trò nhân viên hiện tại
CALL GetEmployeeRolesFromWorkSchedule();

-- Xem vai trò qua view
SELECT * FROM v_employee_roles;

-- Tạo phân công mẫu cho tháng hiện tại
-- CALL GenerateMonthlyScheduleFromRoles(MONTH(CURDATE()), YEAR(CURDATE()), 1);

-- Lấy tất cả phân công
CALL GetAllMonthlySchedules();

-- Xem view
SELECT * FROM v_monthly_schedules;

-- Xem logs
SELECT * FROM monthly_schedule_logs ORDER BY created_at DESC LIMIT 10;

-- 7. QUERIES QUẢN LÝ CHO ADMIN
-- ===========================================

-- Query tạo phân công mới dựa trên vai trò A,B,C,D
/*
CALL GenerateMonthlyScheduleFromRoles(
    12,  -- tháng
    2024, -- năm  
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
    '[{"date":1,"shifts":{"morning":{"role":"A","employee_name":"Nguyen Van A"}}}]', -- JSON data mới
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

-- ===========================================
-- KẾT THÚC SCRIPT
-- ===========================================

SELECT 'Monthly Work Schedule System (Correct Version) đã được cài đặt thành công!' as status; 