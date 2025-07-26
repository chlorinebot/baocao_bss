-- Fix missing stored procedures
USE bc_bss;

-- Drop existing procedures
DROP PROCEDURE IF EXISTS GetMonthlySchedule;
DROP PROCEDURE IF EXISTS UpdateMonthlySchedule;
DROP PROCEDURE IF EXISTS DeleteMonthlySchedule;
DROP PROCEDURE IF EXISTS GetAllMonthlySchedules;

-- Create GetMonthlySchedule procedure
DELIMITER $$
CREATE PROCEDURE GetMonthlySchedule(
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT 
        id,
        month,
        year,
        schedule_data,
        created_at,
        updated_at,
        created_by,
        (SELECT CONCAT(firstName, ' ', lastName) FROM users WHERE id = created_by) as created_by_name
    FROM monthly_work_schedules
    WHERE month = p_month AND year = p_year;
END$$
DELIMITER ;

-- Create UpdateMonthlySchedule procedure  
DELIMITER $$
CREATE PROCEDURE UpdateMonthlySchedule(
    IN p_id INT,
    IN p_schedule_data TEXT
)
BEGIN
    UPDATE monthly_work_schedules 
    SET schedule_data = p_schedule_data,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_id;
    
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Create DeleteMonthlySchedule procedure
DELIMITER $$
CREATE PROCEDURE DeleteMonthlySchedule(
    IN p_id INT
)
BEGIN
    DELETE FROM monthly_work_schedules WHERE id = p_id;
    SELECT ROW_COUNT() as affected_rows;
END$$
DELIMITER ;

-- Create GetAllMonthlySchedules procedure
DELIMITER $$
CREATE PROCEDURE GetAllMonthlySchedules()
BEGIN
    SELECT 
        id,
        month,
        year,
        schedule_data,
        created_at,
        updated_at,
        created_by,
        (SELECT CONCAT(firstName, ' ', lastName) FROM users WHERE id = created_by) as created_by_name
    FROM monthly_work_schedules
    ORDER BY year DESC, month DESC;
END$$
DELIMITER ;

SELECT 'Stored procedures created successfully!' as result; 