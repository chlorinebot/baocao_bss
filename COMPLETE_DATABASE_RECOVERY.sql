CREATE DEFINER=`root`@`localhost` PROCEDURE `GenerateMonthlyScheduleFromRoles`(
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
END
SELECT '========================================' as separator; 