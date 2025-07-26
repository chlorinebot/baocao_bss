-- Complete MariaDB Setup for Monthly Work Schedule
USE bc_bss;

-- Drop existing objects first
DROP FUNCTION IF EXISTS GetEmployeeNameByRole;
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;
DROP PROCEDURE IF EXISTS GetMonthlySchedule;
DROP PROCEDURE IF EXISTS UpdateMonthlySchedule;
DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
DROP PROCEDURE IF EXISTS GetAllMonthlySchedules;
DROP PROCEDURE IF EXISTS GetEmployeeRolesFromWorkSchedule;

-- 0. Create monthly_work_schedules table if not exists
CREATE TABLE IF NOT EXISTS monthly_work_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  schedule_data TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY month_year_unique (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 0.1 Create monthly_schedule_logs table if not exists
CREATE TABLE IF NOT EXISTS monthly_schedule_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  action VARCHAR(10) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_data TEXT NULL,
  new_data TEXT NULL,
  performed_by INT NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES monthly_work_schedules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 1. Create GetEmployeeNameByRole function
DELIMITER $$
CREATE FUNCTION GetEmployeeNameByRole(p_role CHAR(1)) 
RETURNS VARCHAR(100) 
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_employee_name VARCHAR(100) DEFAULT '';
    
    -- Get the active work schedule and fetch employee name based on role
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

-- 2. Create GetEmployeeRolesFromWorkSchedule procedure
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

-- 3. Create GenerateMonthlyScheduleFromRoles procedure (MariaDB compatible)
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
    
    -- Simple error handler for MariaDB
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET v_error_occurred = TRUE;

    -- Validate inputs
    IF p_month < 1 OR p_month > 12 THEN
        SELECT 'error' as status, 'Tháng không hợp lệ (1-12)' as message, 0 as schedule_id;
    ELSEIF p_year < 2020 OR p_year > 2030 THEN
        SELECT 'error' as status, 'Năm không hợp lệ (2020-2030)' as message, 0 as schedule_id;
    ELSEIF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SELECT 'error' as status, CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại') as message, 0 as schedule_id;
    ELSE
        -- Set default value for starting role if null
        SET v_actual_starting_role = IFNULL(p_starting_role, 'A');

        -- Calculate days in month - CHÍNH XÁC SỐ NGÀY TRONG THÁNG
        SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));

        -- Calculate role offset based on starting role
        CASE v_actual_starting_role
            WHEN 'A' THEN SET v_role_offset = 0;
            WHEN 'B' THEN SET v_role_offset = 1;
            WHEN 'C' THEN SET v_role_offset = 2;
            WHEN 'D' THEN SET v_role_offset = 3;
            ELSE SET v_role_offset = 0;
        END CASE;

        -- Generate schedule for each day - PHÂN CÔNG CHO TẤT CẢ CÁC NGÀY TRONG THÁNG
        WHILE v_current_day <= v_days_in_month DO
            -- Calculate roles for current day using REVERSE rotation logic
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

            -- Get employee names for each role
            SET v_morning_name = GetEmployeeNameByRole(v_morning_role);
            SET v_afternoon_name = GetEmployeeNameByRole(v_afternoon_role);
            SET v_evening_name = GetEmployeeNameByRole(v_evening_role);

            -- Create JSON for current day
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

        -- Insert into database
        INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
        VALUES (p_month, p_year, v_schedule_data, p_created_by);

        -- Check for errors
        IF v_error_occurred THEN
            SELECT 'error' as status, 'Có lỗi xảy ra khi tạo phân công' as message, 0 as schedule_id;
        ELSE
            -- Return success
            SELECT 
                'success' as status,
                CONCAT('Đã tạo phân công tháng ', p_month, '/', p_year, ' với vai trò ', v_actual_starting_role, ' làm ca sáng ngày đầu') as message,
                LAST_INSERT_ID() as schedule_id;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 4. Create GetMonthlySchedule procedure
DELIMITER $$
CREATE PROCEDURE GetMonthlySchedule(IN p_month INT, IN p_year INT)
BEGIN
    SELECT * FROM monthly_work_schedules 
    WHERE month = p_month AND year = p_year 
    LIMIT 1;
END$$
DELIMITER ;

-- 5. Create UpdateMonthlySchedule procedure
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

-- 6. Create DeleteMonthlySchedule procedure
DELIMITER $$
CREATE PROCEDURE DeleteMonthlySchedule(IN p_id INT, IN p_deleted_by INT)
BEGIN
    DELETE FROM monthly_work_schedules WHERE id = p_id;
    SELECT 'Deleted successfully' as message;
END$$
DELIMITER ;

-- 7. Create GetAllMonthlySchedules procedure
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

-- Test script
SELECT 'All procedures and functions created successfully!' as result;

-- Test the GetEmployeeNameByRole function
SELECT GetEmployeeNameByRole('A') as test_role_a;

-- Show created procedures
SHOW PROCEDURE STATUS WHERE Db = 'bc_bss' AND Name LIKE '%Monthly%'; 