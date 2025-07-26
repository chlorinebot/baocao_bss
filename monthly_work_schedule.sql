-- Tạo bảng ca làm việc hàng tháng (MariaDB compatible)
CREATE TABLE monthly_work_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    month INT NOT NULL CHECK (month >= 1 AND month <= 12),
    year INT NOT NULL CHECK (year >= 2020 AND year <= 2030),
    schedule_data TEXT NOT NULL COMMENT 'Dữ liệu phân công ca làm việc theo ngày (JSON format)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    
    -- Tạo unique constraint để đảm bảo chỉ có 1 phân công cho mỗi tháng/năm
    UNIQUE KEY unique_month_year (month, year),
    
    -- Foreign key reference đến bảng users
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index để tăng hiệu suất truy vấn
    INDEX idx_month_year (month, year),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at)
);

-- Tạo bảng log để theo dõi thay đổi phân công
CREATE TABLE monthly_schedule_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    action_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    old_data TEXT COMMENT 'Dữ liệu cũ trước khi thay đổi (JSON format)',
    new_data TEXT COMMENT 'Dữ liệu mới sau khi thay đổi (JSON format)',
    changed_by INT NOT NULL,
    change_reason VARCHAR(255) COMMENT 'Lý do thay đổi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES monthly_work_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_created_at (created_at)
);

-- Thêm comment cho các bảng
ALTER TABLE monthly_work_schedules COMMENT = 'Bảng lưu trữ phân công ca làm việc hàng tháng';
ALTER TABLE monthly_schedule_logs COMMENT = 'Bảng log theo dõi thay đổi phân công ca làm việc';

-- Tạo procedure đơn giản hơn cho MariaDB
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
    DECLARE v_schedule_data TEXT DEFAULT '[]';
    DECLARE v_employee_id INT;
    DECLARE v_temp_json TEXT;
    
    -- Tính số ngày trong tháng
    SET v_days_in_month = DAY(LAST_DAY(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01')));
    
    -- Đơn giản hóa: giả sử có 4 nhân viên với IDs được truyền vào như "1,2,3,4"
    SET v_employee_count = (CHAR_LENGTH(p_employee_ids) - CHAR_LENGTH(REPLACE(p_employee_ids, ',', '')) + 1);
    
    -- Kiểm tra input
    IF v_employee_count = 0 OR p_employee_ids = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Danh sách nhân viên không được trống';
    END IF;
    
    -- Tạo JSON đơn giản cho schedule_data
    SET v_schedule_data = '[';
    
    WHILE v_current_day <= v_days_in_month DO
        -- Lấy employee_id cho ca sáng
        SET v_employee_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(p_employee_ids, ',', v_current_employee_index + 1), ',', -1) AS UNSIGNED);
        
        -- Tạo JSON cho ngày hiện tại
        SET v_temp_json = CONCAT(
            '{"date": ', v_current_day, 
            ', "shifts": {',
            '"morning": {"employee_id": ', IFNULL(v_employee_id, 'null'), ', "employee_name": null},',
            '"afternoon": {"employee_id": ', IFNULL(v_employee_id, 'null'), ', "employee_name": null},',
            '"evening": {"employee_id": ', IFNULL(v_employee_id, 'null'), ', "employee_name": null}',
            '}}'
        );
        
        IF v_current_day > 1 THEN
            SET v_schedule_data = CONCAT(v_schedule_data, ',');
        END IF;
        
        SET v_schedule_data = CONCAT(v_schedule_data, v_temp_json);
        
        -- Chuyển sang ngày tiếp theo
        SET v_current_day = v_current_day + 1;
        SET v_current_employee_index = (v_current_employee_index + 1) % v_employee_count;
    END WHILE;
    
    SET v_schedule_data = CONCAT(v_schedule_data, ']');
    
    -- Lưu vào database
    INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
    VALUES (p_month, p_year, v_schedule_data, p_created_by);
    
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

-- Tạo trigger để log thay đổi (đơn giản hóa)
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

-- Tạo view để dễ dàng truy vấn
CREATE VIEW v_monthly_schedules AS
SELECT 
    ms.id,
    ms.month,
    ms.year,
    CONCAT('Tháng ', ms.month, '/', ms.year) as period_name,
    ms.schedule_data,
    ms.created_at,
    ms.updated_at,
    CONCAT(u.firstName, ' ', u.lastName) as created_by_name
FROM monthly_work_schedules ms
LEFT JOIN users u ON ms.created_by = u.id
ORDER BY ms.year DESC, ms.month DESC;

-- Thêm sample data (tùy chọn - comment out nếu không cần)
-- INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by) VALUES 
-- (12, 2024, '[]', 1);

-- Procedure để test tạo phân công
DELIMITER $$

CREATE PROCEDURE CreateSampleSchedule()
BEGIN
    DECLARE v_employee_ids TEXT DEFAULT '2,3,4,5'; -- Giả sử có 4 user với role_id = 2
    
    -- Kiểm tra xem đã có phân công cho tháng hiện tại chưa
    IF NOT EXISTS (
        SELECT 1 FROM monthly_work_schedules 
        WHERE month = MONTH(CURDATE()) AND year = YEAR(CURDATE())
    ) THEN
        CALL GenerateMonthlySchedule(MONTH(CURDATE()), YEAR(CURDATE()), v_employee_ids, 1);
        SELECT 'Đã tạo phân công mẫu cho tháng hiện tại' as message;
    ELSE
        SELECT 'Phân công cho tháng hiện tại đã tồn tại' as message;
    END IF;
END$$

DELIMITER ; 