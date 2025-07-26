-- Script để sửa vấn đề phân công tháng không đủ ngày
USE bc_bss;

-- 1. Xóa dữ liệu phân công cũ (nếu muốn)
DELETE FROM monthly_work_schedules;

-- 2. Kiểm tra bảng đã tồn tại chưa
SHOW TABLES LIKE 'monthly_work_schedules';

-- 3. Tạo bảng nếu chưa tồn tại
DROP TABLE IF EXISTS monthly_work_schedules;
CREATE TABLE monthly_work_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  month INT NOT NULL,
  year INT NOT NULL,
  schedule_data TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY month_year_unique (month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Kiểm tra function GetEmployeeNameByRole
DROP FUNCTION IF EXISTS GetEmployeeNameByRole;

DELIMITER $$
CREATE FUNCTION GetEmployeeNameByRole(p_role CHAR(1)) 
RETURNS VARCHAR(100) 
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_employee_name VARCHAR(100);
    DECLARE v_employee_id INT;
    
    -- Get the active work schedule
    SELECT 
        CASE p_role
            WHEN 'A' THEN employee_a
            WHEN 'B' THEN employee_b
            WHEN 'C' THEN employee_c
            WHEN 'D' THEN employee_d
            ELSE NULL
        END INTO v_employee_id
    FROM work_schedule
    WHERE active = 1
    ORDER BY created_date DESC
    LIMIT 1;
    
    -- Get employee name if ID exists
    IF v_employee_id IS NOT NULL THEN
        SELECT CONCAT(firstName, ' ', lastName) INTO v_employee_name
        FROM users
        WHERE id = v_employee_id;
    END IF;
    
    -- Return name or default
    IF v_employee_name IS NULL THEN
        RETURN CONCAT('Role ', p_role);
    ELSE
        RETURN v_employee_name;
    END IF;
END$$
DELIMITER ;

-- 5. Xóa procedure cũ
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;

-- 6. Tạo procedure mới với phân công đủ ngày trong tháng - ĐƠN GIẢN HÓA
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
    DECLARE v_schedule_exists INT DEFAULT 0;
    DECLARE v_cycle_day INT;
    
    -- Kiểm tra tháng và năm
    IF p_month < 1 OR p_month > 12 THEN
        SELECT 'error' as status, 'Tháng không hợp lệ (1-12)' as message, 0 as schedule_id;
    ELSE
        IF p_year < 2020 OR p_year > 2030 THEN
            SELECT 'error' as status, 'Năm không hợp lệ (2020-2030)' as message, 0 as schedule_id;
        ELSE
            -- Kiểm tra phân công đã tồn tại chưa
            SELECT COUNT(*) INTO v_schedule_exists FROM monthly_work_schedules 
            WHERE month = p_month AND year = p_year;
            
            IF v_schedule_exists > 0 THEN
                SELECT 'error' as status, 
                       CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại') as message, 
                       0 as schedule_id;
            ELSE
                -- Xác định vai trò bắt đầu
                SET v_actual_starting_role = IFNULL(p_starting_role, 'A');
                
                -- Tính số ngày trong tháng
                SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
                
                -- Debug - In ra số ngày trong tháng
                SELECT CONCAT('Tháng ', p_month, '/', p_year, ' có ', v_days_in_month, ' ngày') AS debug_info;
                
                -- Tính offset dựa trên vai trò bắt đầu
                CASE v_actual_starting_role
                    WHEN 'A' THEN SET v_role_offset = 0;
                    WHEN 'B' THEN SET v_role_offset = 1;
                    WHEN 'C' THEN SET v_role_offset = 2;
                    WHEN 'D' THEN SET v_role_offset = 3;
                    ELSE SET v_role_offset = 0;
                END CASE;
                
                -- Tạo phân công cho từng ngày
                WHILE v_current_day <= v_days_in_month DO
                    -- Tính ngày trong chu kỳ 4 ngày (0-3)
                    SET v_cycle_day = (v_current_day - 1 + v_role_offset) % 4;
                    
                    -- Phân công theo chu kỳ 4 ngày:
                    -- Ngày 1: A (sáng), B (chiều), C (tối) - D nghỉ
                    -- Ngày 2: D (sáng), A (chiều), B (tối) - C nghỉ
                    -- Ngày 3: C (sáng), D (chiều), A (tối) - B nghỉ
                    -- Ngày 4: B (sáng), C (chiều), D (tối) - A nghỉ
                    
                    -- Ca sáng
                    CASE v_cycle_day
                        WHEN 0 THEN SET v_morning_role = 'A';
                        WHEN 1 THEN SET v_morning_role = 'D';
                        WHEN 2 THEN SET v_morning_role = 'C';
                        WHEN 3 THEN SET v_morning_role = 'B';
                    END CASE;
                    
                    -- Ca chiều
                    CASE v_cycle_day
                        WHEN 0 THEN SET v_afternoon_role = 'B';
                        WHEN 1 THEN SET v_afternoon_role = 'A';
                        WHEN 2 THEN SET v_afternoon_role = 'D';
                        WHEN 3 THEN SET v_afternoon_role = 'C';
                    END CASE;
                    
                    -- Ca tối
                    CASE v_cycle_day
                        WHEN 0 THEN SET v_evening_role = 'C';
                        WHEN 1 THEN SET v_evening_role = 'B';
                        WHEN 2 THEN SET v_evening_role = 'A';
                        WHEN 3 THEN SET v_evening_role = 'D';
                    END CASE;
                    
                    -- Lấy tên nhân viên cho từng vai trò
                    SET v_morning_name = GetEmployeeNameByRole(v_morning_role);
                    SET v_afternoon_name = GetEmployeeNameByRole(v_afternoon_role);
                    SET v_evening_name = GetEmployeeNameByRole(v_evening_role);
                    
                    -- Tạo JSON cho ngày hiện tại
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
                
                -- Chèn vào database
                INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
                VALUES (p_month, p_year, v_schedule_data, p_created_by);
                
                -- Trả về kết quả thành công
                SELECT 
                    'success' as status,
                    CONCAT('Đã tạo phân công tháng ', p_month, '/', p_year, ' với vai trò ', v_actual_starting_role, ' làm ca sáng ngày đầu') as message,
                    LAST_INSERT_ID() as schedule_id;
            END IF;
        END IF;
    END IF;
END$$
DELIMITER ;

-- 7. Kiểm tra procedure đã được tạo chưa
SHOW PROCEDURE STATUS WHERE Db = 'bc_bss' AND Name = 'GenerateMonthlyScheduleFromRoles';

-- 8. Kiểm tra dữ liệu hiện tại
SELECT id, month, year, created_at, LENGTH(schedule_data) as data_length 
FROM monthly_work_schedules; 