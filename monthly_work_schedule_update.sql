-- Script cập nhật để sửa lỗi MariaDB procedures
-- Chạy script này sau khi đã tạo tables

-- Drop existing procedures and functions if they exist
DROP PROCEDURE IF EXISTS GenerateMonthlySchedule;
DROP PROCEDURE IF EXISTS CreateSampleSchedule;
DROP FUNCTION IF EXISTS GetEmployeeName;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS monthly_schedule_update_log;
DROP TRIGGER IF EXISTS monthly_schedule_delete_log;

-- Tạo lại procedure đơn giản hơn cho MariaDB
DELIMITER $$

CREATE PROCEDURE GenerateMonthlySchedule(
    IN p_month INT,
    IN p_year INT,
    IN p_employee_ids TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_days_in_month INT;
    DECLARE v_current_day INT DEFAULT 1;
    DECLARE v_employee_count INT;
    DECLARE v_current_employee_index INT DEFAULT 0;
    DECLARE v_schedule_data TEXT DEFAULT '';
    DECLARE v_employee_id_morning INT;
    DECLARE v_employee_id_afternoon INT;
    DECLARE v_employee_id_evening INT;
    DECLARE v_temp_json TEXT;
    DECLARE v_first_day BOOLEAN DEFAULT TRUE;
    
    -- Tính số ngày trong tháng
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
    
    -- Đếm số nhân viên
    SET v_employee_count = (CHAR_LENGTH(p_employee_ids) - CHAR_LENGTH(REPLACE(p_employee_ids, ',', '')) + 1);
    
    -- Kiểm tra input
    IF v_employee_count = 0 OR p_employee_ids = '' OR p_employee_ids IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Danh sách nhân viên không được trống';
    END IF;
    
    -- Bắt đầu tạo JSON array
    SET v_schedule_data = '[';
    
    WHILE v_current_day <= v_days_in_month DO
        -- Lấy employee_id cho 3 ca trong ngày
        SET v_employee_id_morning = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', (v_current_employee_index % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        SET v_employee_id_afternoon = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', ((v_current_employee_index + 1) % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        SET v_employee_id_evening = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', ((v_current_employee_index + 2) % v_employee_count) + 1), ',', -1) AS UNSIGNED);
        
        -- Tạo JSON cho ngày hiện tại với 3 ca khác nhau
        SET v_temp_json = CONCAT(
            '{"date":', v_current_day, 
            ',"shifts":{',
            '"morning":{"employee_id":', IFNULL(v_employee_id_morning, 'null'), ',"employee_name":null},',
            '"afternoon":{"employee_id":', IFNULL(v_employee_id_afternoon, 'null'), ',"employee_name":null},',
            '"evening":{"employee_id":', IFNULL(v_employee_id_evening, 'null'), ',"employee_name":null}',
            '}}'
        );
        
        -- Thêm dấu phẩy nếu không phải ngày đầu tiên
        IF NOT v_first_day THEN
            SET v_schedule_data = CONCAT(v_schedule_data, ',');
        END IF;
        
        SET v_schedule_data = CONCAT(v_schedule_data, v_temp_json);
        SET v_first_day = FALSE;
        
        -- Chuyển sang ngày tiếp theo
        SET v_current_day = v_current_day + 1;
        SET v_current_employee_index = (v_current_employee_index + 1) % v_employee_count;
    END WHILE;
    
    -- Đóng JSON array
    SET v_schedule_data = CONCAT(v_schedule_data, ']');
    
    -- Lưu vào database
    INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
    VALUES (p_month, p_year, v_schedule_data, p_created_by);
    
    -- Trả về thông báo thành công
    SELECT CONCAT('Đã tạo phân công cho tháng ', p_month, '/', p_year, ' với ', v_days_in_month, ' ngày') as message;
    
END$$

DELIMITER ;

-- Tạo function để lấy tên nhân viên
DELIMITER $$

CREATE FUNCTION GetEmployeeName(p_employee_id INT) 
RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_name VARCHAR(100);
    
    SELECT CONCAT(firstName, ' ', lastName) 
    INTO v_name
    FROM users 
    WHERE id = p_employee_id AND role_id = 2;
    
    RETURN IFNULL(v_name, 'Không xác định');
END$$

DELIMITER ;

-- Tạo trigger để log thay đổi
DELIMITER $$

CREATE TRIGGER monthly_schedule_update_log
AFTER UPDATE ON monthly_work_schedules
FOR EACH ROW
BEGIN
    INSERT INTO monthly_schedule_logs (
        schedule_id, 
        action_type, 
        old_data, 
        new_data, 
        changed_by,
        change_reason
    ) VALUES (
        NEW.id,
        'UPDATE',
        OLD.schedule_data,
        NEW.schedule_data,
        NEW.created_by,
        'Cập nhật phân công ca làm việc'
    );
END$$

CREATE TRIGGER monthly_schedule_delete_log
BEFORE DELETE ON monthly_work_schedules
FOR EACH ROW
BEGIN
    INSERT INTO monthly_schedule_logs (
        schedule_id, 
        action_type, 
        old_data, 
        new_data, 
        changed_by,
        change_reason
    ) VALUES (
        OLD.id,
        'DELETE',
        CONCAT('{"month":', OLD.month, ',"year":', OLD.year, ',"schedule_data":', OLD.schedule_data, '}'),
        NULL,
        OLD.created_by,
        'Xóa phân công ca làm việc'
    );
END$$

DELIMITER ;

-- Procedure để test tạo phân công
DELIMITER $$

CREATE PROCEDURE CreateSampleSchedule()
BEGIN
    DECLARE v_employee_ids TEXT DEFAULT '2,3,4,5'; -- Giả sử có 4 user với role_id = 2
    DECLARE v_current_month INT DEFAULT MONTH(CURDATE());
    DECLARE v_current_year INT DEFAULT YEAR(CURDATE());
    
    -- Kiểm tra xem đã có phân công cho tháng hiện tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM monthly_work_schedules 
        WHERE month = v_current_month AND year = v_current_year
    ) THEN
        CALL GenerateMonthlySchedule(v_current_month, v_current_year, v_employee_ids, 1);
    ELSE
        SELECT 'Phân công cho tháng hiện tại đã tồn tại' as message;
    END IF;
END$$

DELIMITER ;

-- Test procedure (tùy chọn)
-- CALL CreateSampleSchedule();

-- Kiểm tra kết quả
-- SELECT * FROM monthly_work_schedules ORDER BY year DESC, month DESC LIMIT 1; 