-- Tạo stored procedure GetMonthlySchedule để lấy dữ liệu phân công
USE bc_bss;

-- Xóa procedure cũ nếu có
DROP PROCEDURE IF EXISTS GetMonthlySchedule;

-- Tạo procedure GetMonthlySchedule
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

-- Test procedure
SELECT 'Test lấy phân công tháng 7/2025:' as result;
CALL GetMonthlySchedule(7, 2025);

-- Kiểm tra dữ liệu trực tiếp
SELECT 'Dữ liệu trực tiếp từ bảng:' as result;
SELECT * FROM monthly_work_schedules WHERE month = 7 AND year = 2025; 