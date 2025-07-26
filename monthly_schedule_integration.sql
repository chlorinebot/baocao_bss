-- ===========================================
-- MONTHLY WORK SCHEDULE INTEGRATION
-- Tích hợp ca làm việc hàng tháng với bảng work_schedule hiện có
-- ===========================================

-- 1. THÊM CỘT MỚI VÀO BẢNG WORK_SCHEDULE HIỆN CÓ
-- ===========================================

-- Thêm cột để quản lý ca làm việc hàng tháng
ALTER TABLE work_schedule ADD COLUMN IF NOT EXISTS schedule_month INT DEFAULT NULL COMMENT 'Tháng áp dụng (1-12)';
ALTER TABLE work_schedule ADD COLUMN IF NOT EXISTS schedule_year INT DEFAULT NULL COMMENT 'Năm áp dụng';
ALTER TABLE work_schedule ADD COLUMN IF NOT EXISTS schedule_type ENUM('daily', 'monthly') DEFAULT 'daily' COMMENT 'Loại phân công: daily hoặc monthly';
ALTER TABLE work_schedule ADD COLUMN IF NOT EXISTS day_of_month INT DEFAULT NULL COMMENT 'Ngày trong tháng (1-31) cho monthly schedule';

-- Thêm index cho hiệu suất
ALTER TABLE work_schedule ADD INDEX IF NOT EXISTS idx_schedule_month_year (schedule_month, schedule_year);
ALTER TABLE work_schedule ADD INDEX IF NOT EXISTS idx_schedule_type (schedule_type);
ALTER TABLE work_schedule ADD INDEX IF NOT EXISTS idx_day_of_month (day_of_month);

-- Thêm constraint để đảm bảo dữ liệu hợp lệ
ALTER TABLE work_schedule ADD CONSTRAINT chk_schedule_month CHECK (schedule_month IS NULL OR (schedule_month >= 1 AND schedule_month <= 12));
ALTER TABLE work_schedule ADD CONSTRAINT chk_schedule_year CHECK (schedule_year IS NULL OR (schedule_year >= 2020 AND schedule_year <= 2030));
ALTER TABLE work_schedule ADD CONSTRAINT chk_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31));

-- 2. XÓA CÁC PROCEDURE CŨ NẾU CÓ
-- ===========================================

DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromWorkSchedule;
DROP PROCEDURE IF EXISTS GetMonthlyWorkSchedule;
DROP PROCEDURE IF EXISTS UpdateDayInMonthlySchedule;
DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
DROP PROCEDURE IF EXISTS GetAvailableEmployeesFromWorkSchedule;
DROP PROCEDURE IF EXISTS GetCurrentActiveSchedule;
DROP VIEW IF EXISTS v_monthly_work_schedule;
DROP VIEW IF EXISTS v_current_schedule;

-- 3. TẠO CÁC PROCEDURE MỚI TÍCH HỢP VỚI WORK_SCHEDULE
-- ===========================================

-- Procedure lấy danh sách nhân viên từ work_schedule hiện tại
DELIMITER $$

CREATE PROCEDURE GetAvailableEmployeesFromWorkSchedule()
BEGIN
    -- Lấy phân công hiện tại đang active
    SELECT DISTINCT
        CASE 
            WHEN ws.employee_a > 0 THEN ws.employee_a
            ELSE NULL
        END as employee_id,
        'A' as position,
        CONCAT(ua.firstName, ' ', ua.lastName) as employee_name
    FROM work_schedule ws
    LEFT JOIN users ua ON ws.employee_a = ua.id
    WHERE ws.active = 1 AND ws.employee_a > 0
    
    UNION ALL
    
    SELECT DISTINCT
        CASE 
            WHEN ws.employee_b > 0 THEN ws.employee_b
            ELSE NULL
        END as employee_id,
        'B' as position,
        CONCAT(ub.firstName, ' ', ub.lastName) as employee_name
    FROM work_schedule ws
    LEFT JOIN users ub ON ws.employee_b = ub.id
    WHERE ws.active = 1 AND ws.employee_b > 0
    
    UNION ALL
    
    SELECT DISTINCT
        CASE 
            WHEN ws.employee_c > 0 THEN ws.employee_c
            ELSE NULL
        END as employee_id,
        'C' as position,
        CONCAT(uc.firstName, ' ', uc.lastName) as employee_name
    FROM work_schedule ws
    LEFT JOIN users uc ON ws.employee_c = uc.id
    WHERE ws.active = 1 AND ws.employee_c > 0
    
    UNION ALL
    
    SELECT DISTINCT
        CASE 
            WHEN ws.employee_d > 0 THEN ws.employee_d
            ELSE NULL
        END as employee_id,
        'D' as position,
        CONCAT(ud.firstName, ' ', ud.lastName) as employee_name
    FROM work_schedule ws
    LEFT JOIN users ud ON ws.employee_d = ud.id
    WHERE ws.active = 1 AND ws.employee_d > 0
    
    ORDER BY position, employee_name;
END$$

DELIMITER ;

-- Procedure tạo phân công hàng tháng từ work_schedule hiện tại
DELIMITER $$

CREATE PROCEDURE GenerateMonthlyScheduleFromWorkSchedule(
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_days_in_month INT;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_employee_a INT DEFAULT 0;
    DECLARE v_employee_b INT DEFAULT 0;
    DECLARE v_employee_c INT DEFAULT 0;
    DECLARE v_employee_d INT DEFAULT 0;
    DECLARE v_current_employee_index INT DEFAULT 0;
    DECLARE v_employees_array TEXT DEFAULT '';
    DECLARE v_employee_count INT DEFAULT 4;
    DECLARE v_morning_emp INT;
    DECLARE v_afternoon_emp INT;
    DECLARE v_evening_emp INT;
    
    -- Kiểm tra xem đã có phân công monthly cho tháng này chưa
    IF EXISTS (
        SELECT 1 FROM work_schedule 
        WHERE schedule_type = 'monthly' 
        AND schedule_month = p_month 
        AND schedule_year = p_year
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Phân công hàng tháng cho tháng này đã tồn tại';
    END IF;
    
    -- Lấy phân công hiện tại đang active
    SELECT employee_a, employee_b, employee_c, employee_d
    INTO v_employee_a, v_employee_b, v_employee_c, v_employee_d
    FROM work_schedule 
    WHERE active = 1 
    LIMIT 1;
    
    -- Kiểm tra có phân công active không
    IF v_employee_a = 0 AND v_employee_b = 0 AND v_employee_c = 0 AND v_employee_d = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không có phân công active nào trong hệ thống';
    END IF;
    
    -- Tính số ngày trong tháng
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
    
    -- Tạo phân công cho từng ngày trong tháng
    WHILE v_current_day <= v_days_in_month DO
        -- Xác định nhân viên cho từng ca dựa trên ngày và luân phiên A->B->C->D
        CASE (v_current_day - 1) % 4
            WHEN 0 THEN 
                SET v_morning_emp = v_employee_a;
                SET v_afternoon_emp = v_employee_b;
                SET v_evening_emp = v_employee_c;
            WHEN 1 THEN 
                SET v_morning_emp = v_employee_b;
                SET v_afternoon_emp = v_employee_c;
                SET v_evening_emp = v_employee_d;
            WHEN 2 THEN 
                SET v_morning_emp = v_employee_c;
                SET v_afternoon_emp = v_employee_d;
                SET v_evening_emp = v_employee_a;
            WHEN 3 THEN 
                SET v_morning_emp = v_employee_d;
                SET v_afternoon_emp = v_employee_a;
                SET v_evening_emp = v_employee_b;
        END CASE;
        
        -- Tạo 3 bản ghi cho 3 ca trong ngày
        -- Ca sáng
        INSERT INTO work_schedule (
            employee_a, employee_b, employee_c, employee_d,
            active, schedule_type, schedule_month, schedule_year, day_of_month,
            created_at
        ) VALUES (
            v_morning_emp, 0, 0, 0,
            1, 'monthly', p_month, p_year, v_current_day,
            CURRENT_TIMESTAMP
        );
        
        -- Ca chiều  
        INSERT INTO work_schedule (
            employee_a, employee_b, employee_c, employee_d,
            active, schedule_type, schedule_month, schedule_year, day_of_month,
            created_at
        ) VALUES (
            0, v_afternoon_emp, 0, 0,
            1, 'monthly', p_month, p_year, v_current_day,
            CURRENT_TIMESTAMP
        );
        
        -- Ca tối
        INSERT INTO work_schedule (
            employee_a, employee_b, employee_c, employee_d,
            active, schedule_type, schedule_month, schedule_year, day_of_month,
            created_at
        ) VALUES (
            0, 0, v_evening_emp, 0,
            1, 'monthly', p_month, p_year, v_current_day,
            CURRENT_TIMESTAMP
        );
        
        SET v_current_day = v_current_day + 1;
    END WHILE;
    
    -- Trả về thông báo thành công
    SELECT CONCAT('Đã tạo phân công hàng tháng cho tháng ', p_month, '/', p_year, ' với ', v_days_in_month, ' ngày') as message,
           v_days_in_month * 3 as total_shifts_created;
    
END$$

DELIMITER ;

-- Procedure lấy phân công hàng tháng
DELIMITER $$

CREATE PROCEDURE GetMonthlyWorkSchedule(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT 
        ws.day_of_month as date,
        CASE 
            WHEN ws.employee_a > 0 THEN 'morning'
            WHEN ws.employee_b > 0 THEN 'afternoon' 
            WHEN ws.employee_c > 0 THEN 'evening'
            ELSE 'unknown'
        END as shift_type,
        CASE 
            WHEN ws.employee_a > 0 THEN ws.employee_a
            WHEN ws.employee_b > 0 THEN ws.employee_b
            WHEN ws.employee_c > 0 THEN ws.employee_c
            WHEN ws.employee_d > 0 THEN ws.employee_d
            ELSE NULL
        END as employee_id,
        CASE 
            WHEN ws.employee_a > 0 THEN CONCAT(ua.firstName, ' ', ua.lastName)
            WHEN ws.employee_b > 0 THEN CONCAT(ub.firstName, ' ', ub.lastName)
            WHEN ws.employee_c > 0 THEN CONCAT(uc.firstName, ' ', uc.lastName)
            WHEN ws.employee_d > 0 THEN CONCAT(ud.firstName, ' ', ud.lastName)
            ELSE 'Chưa phân công'
        END as employee_name,
        ws.id,
        ws.created_at,
        ws.updated_at
    FROM work_schedule ws
    LEFT JOIN users ua ON ws.employee_a = ua.id
    LEFT JOIN users ub ON ws.employee_b = ub.id  
    LEFT JOIN users uc ON ws.employee_c = uc.id
    LEFT JOIN users ud ON ws.employee_d = ud.id
    WHERE ws.schedule_type = 'monthly'
    AND ws.schedule_month = p_month
    AND ws.schedule_year = p_year
    AND ws.active = 1
    ORDER BY ws.day_of_month, 
             CASE 
                 WHEN ws.employee_a > 0 THEN 1  -- morning
                 WHEN ws.employee_b > 0 THEN 2  -- afternoon
                 WHEN ws.employee_c > 0 THEN 3  -- evening
             END;
END$$

DELIMITER ;

-- Procedure cập nhật ca làm việc cho một ngày cụ thể
DELIMITER $$

CREATE PROCEDURE UpdateDayInMonthlySchedule(
    IN p_month INT,
    IN p_year INT,
    IN p_day INT,
    IN p_shift_type ENUM('morning', 'afternoon', 'evening'),
    IN p_employee_id INT,
    IN p_updated_by INT
)
BEGIN
    DECLARE v_schedule_id INT DEFAULT 0;
    
    -- Tìm ID của ca làm việc cần cập nhật
    CASE p_shift_type
        WHEN 'morning' THEN
            SELECT id INTO v_schedule_id
            FROM work_schedule 
            WHERE schedule_type = 'monthly'
            AND schedule_month = p_month
            AND schedule_year = p_year  
            AND day_of_month = p_day
            AND employee_a > 0
            LIMIT 1;
            
        WHEN 'afternoon' THEN
            SELECT id INTO v_schedule_id
            FROM work_schedule 
            WHERE schedule_type = 'monthly'
            AND schedule_month = p_month
            AND schedule_year = p_year
            AND day_of_month = p_day
            AND employee_b > 0
            LIMIT 1;
            
        WHEN 'evening' THEN
            SELECT id INTO v_schedule_id
            FROM work_schedule 
            WHERE schedule_type = 'monthly'
            AND schedule_month = p_month
            AND schedule_year = p_year
            AND day_of_month = p_day
            AND employee_c > 0
            LIMIT 1;
    END CASE;
    
    -- Cập nhật nhân viên cho ca làm việc
    IF v_schedule_id > 0 THEN
        CASE p_shift_type
            WHEN 'morning' THEN
                UPDATE work_schedule 
                SET employee_a = p_employee_id, updated_at = CURRENT_TIMESTAMP
                WHERE id = v_schedule_id;
                
            WHEN 'afternoon' THEN
                UPDATE work_schedule 
                SET employee_b = p_employee_id, updated_at = CURRENT_TIMESTAMP
                WHERE id = v_schedule_id;
                
            WHEN 'evening' THEN
                UPDATE work_schedule 
                SET employee_c = p_employee_id, updated_at = CURRENT_TIMESTAMP
                WHERE id = v_schedule_id;
        END CASE;
        
        SELECT CONCAT('Đã cập nhật ca ', p_shift_type, ' ngày ', p_day, '/', p_month, '/', p_year) as message;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy ca làm việc để cập nhật';
    END IF;
END$$

DELIMITER ;

-- Procedure xóa phân công hàng tháng
DELIMITER $$

CREATE PROCEDURE DeleteMonthlySchedule(
    IN p_month INT,
    IN p_year INT,
    IN p_deleted_by INT
)
BEGIN
    DECLARE v_deleted_count INT DEFAULT 0;
    
    -- Xóa tất cả bản ghi monthly cho tháng này
    DELETE FROM work_schedule 
    WHERE schedule_type = 'monthly'
    AND schedule_month = p_month
    AND schedule_year = p_year;
    
    SET v_deleted_count = ROW_COUNT();
    
    IF v_deleted_count > 0 THEN
        SELECT CONCAT('Đã xóa ', v_deleted_count, ' ca làm việc cho tháng ', p_month, '/', p_year) as message;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy phân công hàng tháng để xóa';
    END IF;
END$$

DELIMITER ;

-- Procedure lấy tất cả phân công hàng tháng
DELIMITER $$

CREATE PROCEDURE GetAllMonthlySchedules()
BEGIN
    SELECT 
        schedule_month as month,
        schedule_year as year,
        CONCAT('Tháng ', schedule_month, '/', schedule_year) as period_name,
        COUNT(*) as total_shifts,
        COUNT(DISTINCT day_of_month) as total_days,
        MIN(created_at) as created_at,
        MAX(updated_at) as updated_at
    FROM work_schedule 
    WHERE schedule_type = 'monthly'
    GROUP BY schedule_month, schedule_year
    ORDER BY schedule_year DESC, schedule_month DESC;
END$$

DELIMITER ;

-- 4. TẠO VIEW ĐỂ DỄ TRUY VẤN
-- ===========================================

-- View cho phân công hàng tháng
CREATE VIEW v_monthly_work_schedule AS
SELECT 
    ws.schedule_month as month,
    ws.schedule_year as year,
    ws.day_of_month as date,
    CASE 
        WHEN ws.employee_a > 0 THEN 'morning'
        WHEN ws.employee_b > 0 THEN 'afternoon'
        WHEN ws.employee_c > 0 THEN 'evening'
        ELSE 'unknown'
    END as shift_type,
    CASE 
        WHEN ws.employee_a > 0 THEN ws.employee_a
        WHEN ws.employee_b > 0 THEN ws.employee_b
        WHEN ws.employee_c > 0 THEN ws.employee_c
        WHEN ws.employee_d > 0 THEN ws.employee_d
        ELSE NULL
    END as employee_id,
    CASE 
        WHEN ws.employee_a > 0 THEN CONCAT(ua.firstName, ' ', ua.lastName)
        WHEN ws.employee_b > 0 THEN CONCAT(ub.firstName, ' ', ub.lastName)
        WHEN ws.employee_c > 0 THEN CONCAT(uc.firstName, ' ', uc.lastName)
        WHEN ws.employee_d > 0 THEN CONCAT(ud.firstName, ' ', ud.lastName)
        ELSE 'Chưa phân công'
    END as employee_name,
    ws.id as schedule_id,
    ws.active,
    ws.created_at,
    ws.updated_at
FROM work_schedule ws
LEFT JOIN users ua ON ws.employee_a = ua.id AND ws.employee_a > 0
LEFT JOIN users ub ON ws.employee_b = ub.id AND ws.employee_b > 0
LEFT JOIN users uc ON ws.employee_c = uc.id AND ws.employee_c > 0
LEFT JOIN users ud ON ws.employee_d = ud.id AND ws.employee_d > 0
WHERE ws.schedule_type = 'monthly'
AND ws.active = 1;

-- View cho phân công hiện tại (daily)
CREATE VIEW v_current_schedule AS
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
    ws.created_at,
    ws.updated_at,
    ws.activation_date
FROM work_schedule ws
LEFT JOIN users ua ON ws.employee_a = ua.id
LEFT JOIN users ub ON ws.employee_b = ub.id
LEFT JOIN users uc ON ws.employee_c = uc.id
LEFT JOIN users ud ON ws.employee_d = ud.id
WHERE ws.schedule_type = 'daily' OR ws.schedule_type IS NULL;

-- 5. QUERIES TEST VÀ KIỂM TRA
-- ===========================================

-- Kiểm tra cấu trúc bảng đã cập nhật
DESCRIBE work_schedule;

-- Kiểm tra procedures đã tạo
SHOW PROCEDURE STATUS WHERE Name LIKE '%Monthly%' OR Name LIKE '%WorkSchedule%';

-- Kiểm tra views
SHOW CREATE VIEW v_monthly_work_schedule;
SHOW CREATE VIEW v_current_schedule;

-- Lấy phân công hiện tại
SELECT * FROM v_current_schedule WHERE active = 1;

-- Lấy danh sách nhân viên có thể phân công
CALL GetAvailableEmployeesFromWorkSchedule();

-- 6. SAMPLE USAGE - CÁC LỆNH SỬ DỤNG MẪU
-- ===========================================

-- Tạo phân công hàng tháng cho tháng hiện tại
-- CALL GenerateMonthlyScheduleFromWorkSchedule(MONTH(CURDATE()), YEAR(CURDATE()), 1);

-- Lấy phân công hàng tháng
-- CALL GetMonthlyWorkSchedule(MONTH(CURDATE()), YEAR(CURDATE()));

-- Cập nhật ca làm việc
-- CALL UpdateDayInMonthlySchedule(MONTH(CURDATE()), YEAR(CURDATE()), 1, 'morning', 2, 1);

-- Xóa phân công hàng tháng
-- CALL DeleteMonthlySchedule(MONTH(CURDATE()), YEAR(CURDATE()), 1);

-- Lấy tất cả phân công hàng tháng
CALL GetAllMonthlySchedules();

-- Xem phân công hàng tháng qua view
SELECT * FROM v_monthly_work_schedule 
WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())
ORDER BY date, shift_type;

-- 7. QUERIES THỐNG KÊ VÀ BÁO CÁO
-- ===========================================

-- Thống kê tổng quan
SELECT 
    'Daily Schedules' as type,
    COUNT(*) as total_count
FROM work_schedule 
WHERE schedule_type = 'daily' OR schedule_type IS NULL

UNION ALL

SELECT 
    'Monthly Schedules' as type,
    COUNT(*) as total_count  
FROM work_schedule
WHERE schedule_type = 'monthly';

-- Thống kê theo tháng
SELECT 
    schedule_month as month,
    schedule_year as year,
    COUNT(*) as total_shifts,
    COUNT(DISTINCT day_of_month) as days_scheduled,
    COUNT(DISTINCT CASE WHEN employee_a > 0 THEN employee_a END) as morning_employees,
    COUNT(DISTINCT CASE WHEN employee_b > 0 THEN employee_b END) as afternoon_employees,
    COUNT(DISTINCT CASE WHEN employee_c > 0 THEN employee_c END) as evening_employees
FROM work_schedule 
WHERE schedule_type = 'monthly'
GROUP BY schedule_month, schedule_year
ORDER BY schedule_year DESC, schedule_month DESC;

-- ===========================================
-- KẾT THÚC SCRIPT TÍCH HỢP
-- ===========================================

SELECT 'Monthly Work Schedule Integration đã hoàn thành!' as status; 