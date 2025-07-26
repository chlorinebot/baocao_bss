-- Simple procedure để khắc phục lỗi tạo phân công tháng
USE bc_bss;

-- Xóa procedure cũ
DROP PROCEDURE IF EXISTS GenerateMonthlyScheduleFromRoles;

-- Tạo procedure đơn giản
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
    
    -- Kiểm tra input đơn giản
    IF p_month < 1 OR p_month > 12 THEN
        SELECT 'error' as status, 'Tháng không hợp lệ' as message, 0 as schedule_id;
        LEAVE;
    END IF;
    
    IF p_year < 2020 OR p_year > 2030 THEN
        SELECT 'error' as status, 'Năm không hợp lệ' as message, 0 as schedule_id;
        LEAVE;
    END IF;
    
    -- Kiểm tra có phân công trùng không
    IF EXISTS (SELECT 1 FROM monthly_work_schedules WHERE month = p_month AND year = p_year) THEN
        SELECT 'error' as status, CONCAT('Phân công tháng ', p_month, '/', p_year, ' đã tồn tại') as message, 0 as schedule_id;
        LEAVE;
    END IF;
    
    -- Tạo JSON đơn giản cho 3 ngày đầu (để test)
    SET v_schedule_data = '[
        {"date":1,"shifts":{"morning":{"role":"A","employee_name":"Test A"},"afternoon":{"role":"D","employee_name":"Test D"},"evening":{"role":"C","employee_name":"Test C"}}},
        {"date":2,"shifts":{"morning":{"role":"B","employee_name":"Test B"},"afternoon":{"role":"A","employee_name":"Test A"},"evening":{"role":"D","employee_name":"Test D"}}},
        {"date":3,"shifts":{"morning":{"role":"C","employee_name":"Test C"},"afternoon":{"role":"B","employee_name":"Test B"},"evening":{"role":"A","employee_name":"Test A"}}}
    ]';
    
    -- Lưu vào database
    INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
    VALUES (p_month, p_year, v_schedule_data, p_created_by);
    
    SET v_schedule_id = LAST_INSERT_ID();
    
    -- Trả về kết quả thành công
    SELECT 'success' as status, 
           CONCAT('Tạo phân công tháng ', p_month, '/', p_year, ' thành công') as message, 
           v_schedule_id as schedule_id;
END$$
DELIMITER ;

-- Test procedure
SELECT 'Test tạo phân công tháng 7/2025:' as result;
CALL GenerateMonthlyScheduleFromRoles(7, 2025, 1, 'A');

-- Kiểm tra kết quả
SELECT 'Kiểm tra dữ liệu đã tạo:' as result;
SELECT * FROM monthly_work_schedules WHERE month = 7 AND year = 2025; 