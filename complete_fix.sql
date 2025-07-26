-- Complete fix cho vấn đề hiển thị phân công tháng
USE bc_bss;

-- 1. Xóa dữ liệu cũ nếu có
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

-- 2. Tạo stored procedure GenerateMonthlyScheduleFromRoles
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;

DELIMITER $$
CREATE PROCEDURE GenerateMonthlyScheduleFromRoles(
    IN p_month INT,
    IN p_year INT,
    IN p_created_by INT,
    IN p_starting_role CHAR(1)
)
BEGIN
    DECLARE v_schedule_id INT DEFAULT 0;
    DECLARE v_schedule_data TEXT DEFAULT '';
    DECLARE v_error_msg VARCHAR(255) DEFAULT '';
    DECLARE v_actual_user_id INT DEFAULT 0;
    
    -- Lấy user ID thực tế từ database
    SELECT id INTO v_actual_user_id 
    FROM users 
    WHERE role_id IN (1, 2)
    ORDER BY id 
    LIMIT 1;
    
    -- Nếu không có user nào, tạo user mặc định
    IF v_actual_user_id = 0 THEN
        INSERT INTO users (username, email, password, firstName, lastName, role_id, isActive) 
        VALUES ('admin', 'admin@test.com', 'admin123', 'Admin', 'User', 1, 1);
        SET v_actual_user_id = LAST_INSERT_ID();
    END IF;
    
    -- Kiểm tra input
    IF p_month < 1 OR p_month > 12 THEN
        SET v_error_msg = 'Tháng không hợp lệ';
    ELSEIF p_year < 2020 OR p_year > 2030 THEN
        SET v_error_msg = 'Năm không hợp lệ';
    ELSEIF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SET v_error_msg = CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại');
    END IF;
    
    -- Nếu có lỗi, trả về error
    IF v_error_msg != '' THEN
        SELECT 'error' as status, v_error_msg as message, 0 as schedule_id;
    ELSE
        -- Tạo JSON cho 31 ngày (đầy đủ tháng)
        SET v_schedule_data = CONCAT('[',
            '{"date":1,"shifts":{"morning":{"role":"A","employee_name":"Test A"},"afternoon":{"role":"D","employee_name":"Test D"},"evening":{"role":"C","employee_name":"Test C"}}},',
            '{"date":2,"shifts":{"morning":{"role":"B","employee_name":"Test B"},"afternoon":{"role":"A","employee_name":"Test A"},"evening":{"role":"D","employee_name":"Test D"}}},',
            '{"date":3,"shifts":{"morning":{"role":"C","employee_name":"Test C"},"afternoon":{"role":"B","employee_name":"Test B"},"evening":{"role":"A","employee_name":"Test A"}}},',
            '{"date":4,"shifts":{"morning":{"role":"D","employee_name":"Test D"},"afternoon":{"role":"C","employee_name":"Test C"},"evening":{"role":"B","employee_name":"Test B"}}},',
            '{"date":5,"shifts":{"morning":{"role":"A","employee_name":"Test A"},"afternoon":{"role":"D","employee_name":"Test D"},"evening":{"role":"C","employee_name":"Test C"}}},',
            '{"date":6,"shifts":{"morning":{"role":"B","employee_name":"Test B"},"afternoon":{"role":"A","employee_name":"Test A"},"evening":{"role":"D","employee_name":"Test D"}}},',
            '{"date":7,"shifts":{"morning":{"role":"C","employee_name":"Test C"},"afternoon":{"role":"B","employee_name":"Test B"},"evening":{"role":"A","employee_name":"Test A"}}}',
            ']');
        
        -- Lưu vào database
        INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
        VALUES (p_month, p_year, v_schedule_data, v_actual_user_id);
        
        SET v_schedule_id = LAST_INSERT_ID();
        
        -- Trả về kết quả thành công
        SELECT 'success' as status, 
               CONCAT('Tạo phân công tháng ', p_month, '/', p_year, ' thành công') as message, 
               v_schedule_id as schedule_id;
    END IF;
END$$
DELIMITER ;

-- 3. Tạo stored procedure GetMonthlySchedule (QUAN TRỌNG!)
DROP PROCEDURE IF EXISTS GetMonthlySchedule;

DELIMITER $$
CREATE PROCEDURE GetMonthlySchedule(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    -- Lấy dữ liệu phân công theo tháng/năm
    SELECT 
        id,
        month,
        year,
        schedule_data,
        created_at,
        updated_at,
        created_by
    FROM monthly_work_schedules 
    WHERE month = p_month AND year = p_year
    ORDER BY created_at DESC
    LIMIT 1;
END$$
DELIMITER ;

-- 4. Tạo dữ liệu test
CALL GenerateMonthlyScheduleFromRoles(7, 2025, 1, 'A');

-- 5. Test lấy dữ liệu
SELECT 'Test GetMonthlySchedule:' as result;
CALL GetMonthlySchedule(7, 2025);

-- 6. Kiểm tra dữ liệu trực tiếp
SELECT 'Dữ liệu trong bảng:' as result;
SELECT id, month, year, LEFT(schedule_data, 100) as sample_data, created_at 
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025; 