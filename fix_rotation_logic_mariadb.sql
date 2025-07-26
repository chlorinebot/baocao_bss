-- Fix rotation logic for monthly schedule generation (MariaDB compatible)
USE bc_bss;

-- Drop existing procedure
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;

-- Create updated procedure with correct rotation logic (MariaDB compatible)
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

    -- Set default value for starting role if null
    SET v_actual_starting_role = IFNULL(p_starting_role, 'A');

    -- Calculate days in month
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));

    -- Calculate role offset based on starting role
    CASE v_actual_starting_role
        WHEN 'A' THEN SET v_role_offset = 0;
        WHEN 'B' THEN SET v_role_offset = 1;
        WHEN 'C' THEN SET v_role_offset = 2;
        WHEN 'D' THEN SET v_role_offset = 3;
        ELSE SET v_role_offset = 0; -- Default to A if invalid
    END CASE;

    -- Generate schedule for each day
    WHILE v_current_day <= v_days_in_month DO
        -- Calculate roles for current day using REVERSE rotation logic
        -- Ngày 1: A(sáng), D(chiều), C(tối), B(nghỉ)
        -- Ngày 2: B(sáng), A(chiều), D(tối), C(nghỉ) - người nghỉ hôm trước làm sáng hôm sau
        -- Logic: morning = (offset - (day-1)) % 4
        
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
            '"morning":{"role":"', v_morning_role, '","employee_name":"', IFNULL(v_morning_name, ''), '"},',
            '"afternoon":{"role":"', v_afternoon_role, '","employee_name":"', IFNULL(v_afternoon_name, ''), '"},',
            '"evening":{"role":"', v_evening_role, '","employee_name":"', IFNULL(v_evening_name, ''), '"}',
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

    SELECT 
        'success' as status,
        CONCAT('Đã tạo phân công tháng ', p_month, '/', p_year, ' với vai trò ', v_actual_starting_role, ' làm ca sáng ngày đầu (rotation ngược)') as message,
        LAST_INSERT_ID() as schedule_id;
END$$
DELIMITER ;

SELECT 'Rotation logic updated successfully for MariaDB!' as result; 