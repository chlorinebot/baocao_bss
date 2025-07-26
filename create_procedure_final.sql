-- TẠO STORED PROCEDURE HOÀN CHỈNH
-- =====================================

-- Xóa procedure cũ (nếu có)
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;

-- Tạo procedure mới
DELIMITER $$

CREATE PROCEDURE GenerateMonthlyScheduleFromRoles(
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT,
    IN p_starting_role CHAR(1)
)
BEGIN
    DECLARE v_error_msg VARCHAR(255) DEFAULT '';
    DECLARE v_schedule_data TEXT DEFAULT '';
    DECLARE v_days_in_month INT DEFAULT 0;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_role_cycle INT DEFAULT 0;
    DECLARE v_morning_role CHAR(1);
    DECLARE v_afternoon_role CHAR(1); 
    DECLARE v_evening_role CHAR(1);
    DECLARE v_actual_user_id INT DEFAULT 0;
    
    -- Kiểm tra input
    IF p_month < 1 OR p_month > 12 THEN
        SET v_error_msg = 'Tháng không hợp lệ (1-12)';
    ELSEIF p_year < 2020 OR p_year > 2030 THEN
        SET v_error_msg = 'Năm không hợp lệ (2020-2030)';
    ELSEIF p_starting_role NOT IN ('A', 'B', 'C', 'D') THEN
        SET v_error_msg = 'Vai trò bắt đầu phải là A, B, C hoặc D';
    END IF;
    
    -- Kiểm tra trùng lặp
    IF v_error_msg = '' AND EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SET v_error_msg = CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại');
    END IF;
    
    IF v_error_msg != '' THEN
        SELECT 'error' as status, v_error_msg as message, 0 as schedule_id;
    ELSE
        -- Tìm user ID hợp lệ
        SELECT id INTO v_actual_user_id
        FROM users
        WHERE role_id IN (1, 2) AND isActive = 1
        ORDER BY id
        LIMIT 1;
        
        IF v_actual_user_id = 0 THEN
            INSERT INTO users (username, email, password, firstName, lastName, role_id, isActive)
            VALUES ('admin', 'admin@test.com', 'admin123', 'Admin', 'User', 1, 1);
            SET v_actual_user_id = LAST_INSERT_ID();
        END IF;
        
        -- Tính số ngày trong tháng
        SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
        
        -- Tạo JSON data
        SET v_schedule_data = '[';
        
        WHILE v_current_day <= v_days_in_month DO
            -- Tính vai trò cho từng ca dựa trên chu kỳ 4 ngày
            SET v_role_cycle = (v_current_day - 1) % 4;
            
            CASE p_starting_role
                WHEN 'A' THEN
                    CASE v_role_cycle
                        WHEN 0 THEN SET v_morning_role = 'A'; SET v_afternoon_role = 'D'; SET v_evening_role = 'C';
                        WHEN 1 THEN SET v_morning_role = 'B'; SET v_afternoon_role = 'A'; SET v_evening_role = 'D';
                        WHEN 2 THEN SET v_morning_role = 'C'; SET v_afternoon_role = 'B'; SET v_evening_role = 'A';
                        WHEN 3 THEN SET v_morning_role = 'D'; SET v_afternoon_role = 'C'; SET v_evening_role = 'B';
                    END CASE;
                WHEN 'B' THEN
                    CASE v_role_cycle
                        WHEN 0 THEN SET v_morning_role = 'B'; SET v_afternoon_role = 'A'; SET v_evening_role = 'D';
                        WHEN 1 THEN SET v_morning_role = 'C'; SET v_afternoon_role = 'B'; SET v_evening_role = 'A';
                        WHEN 2 THEN SET v_morning_role = 'D'; SET v_afternoon_role = 'C'; SET v_evening_role = 'B';
                        WHEN 3 THEN SET v_morning_role = 'A'; SET v_afternoon_role = 'D'; SET v_evening_role = 'C';
                    END CASE;
                WHEN 'C' THEN
                    CASE v_role_cycle
                        WHEN 0 THEN SET v_morning_role = 'C'; SET v_afternoon_role = 'B'; SET v_evening_role = 'A';
                        WHEN 1 THEN SET v_morning_role = 'D'; SET v_afternoon_role = 'C'; SET v_evening_role = 'B';
                        WHEN 2 THEN SET v_morning_role = 'A'; SET v_afternoon_role = 'D'; SET v_evening_role = 'C';
                        WHEN 3 THEN SET v_morning_role = 'B'; SET v_afternoon_role = 'A'; SET v_evening_role = 'D';
                    END CASE;
                WHEN 'D' THEN
                    CASE v_role_cycle
                        WHEN 0 THEN SET v_morning_role = 'D'; SET v_afternoon_role = 'C'; SET v_evening_role = 'B';
                        WHEN 1 THEN SET v_morning_role = 'A'; SET v_afternoon_role = 'D'; SET v_evening_role = 'C';
                        WHEN 2 THEN SET v_morning_role = 'B'; SET v_afternoon_role = 'A'; SET v_evening_role = 'D';
                        WHEN 3 THEN SET v_morning_role = 'C'; SET v_afternoon_role = 'B'; SET v_evening_role = 'A';
                    END CASE;
            END CASE;
            
            -- Thêm JSON cho ngày hiện tại
            IF v_current_day > 1 THEN
                SET v_schedule_data = CONCAT(v_schedule_data, ',');
            END IF;
            
            SET v_schedule_data = CONCAT(v_schedule_data, '{');
            SET v_schedule_data = CONCAT(v_schedule_data, '"date":', v_current_day, ',');
            SET v_schedule_data = CONCAT(v_schedule_data, '"shifts":{');
            SET v_schedule_data = CONCAT(v_schedule_data, '"morning":{"role":"', v_morning_role, '","employee_name":"Nhân viên ', v_morning_role, '"},');
            SET v_schedule_data = CONCAT(v_schedule_data, '"afternoon":{"role":"', v_afternoon_role, '","employee_name":"Nhân viên ', v_afternoon_role, '"},');
            SET v_schedule_data = CONCAT(v_schedule_data, '"evening":{"role":"', v_evening_role, '","employee_name":"Nhân viên ', v_evening_role, '"}');
            SET v_schedule_data = CONCAT(v_schedule_data, '}');
            SET v_schedule_data = CONCAT(v_schedule_data, '}');
            
            SET v_current_day = v_current_day + 1;
        END WHILE;
        
        SET v_schedule_data = CONCAT(v_schedule_data, ']');
        
        -- Lưu vào database
        INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
        VALUES (p_month, p_year, v_schedule_data, v_actual_user_id);
        
        SELECT 'success' as status, 
               CONCAT('Tạo phân công tháng ', p_month, '/', p_year, ' thành công với ', v_days_in_month, ' ngày') as message, 
               LAST_INSERT_ID() as schedule_id;
    END IF;
END$$

DELIMITER ;

-- Test procedure
SELECT 'Procedure created successfully' as result; 