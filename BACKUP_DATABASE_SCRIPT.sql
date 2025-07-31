-- ==================================================================
-- SCRIPT BACKUP DATABASE BSS MANAGEMENT SYSTEM
-- Mục đích: Tạo backup hoàn chỉnh database để phòng khi có sự cố
-- Sử dụng: Chạy script này thường xuyên để backup dữ liệu
-- ==================================================================

-- Sử dụng database
USE bc_bss;

-- ==================================================================
-- PHẦN 1: THÔNG TIN BACKUP
-- ==================================================================

SELECT 'BẮT ĐẦU QUÁ TRÌNH BACKUP DATABASE BSS' as info;
SELECT NOW() as backup_time;
SELECT DATABASE() as current_database;

-- ==================================================================
-- PHẦN 2: KIỂM TRA TÌNH TRẠNG DATABASE
-- ==================================================================

-- Đếm số lượng bảng
SELECT 'TỔNG SỐ BẢNG:' as info, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'bc_bss';

-- Thống kê dữ liệu từng bảng
SELECT 'THỐNG KÊ DỮ LIỆU CÁC BẢNG:' as info;

SELECT 'roles' as table_name, COUNT(*) as record_count FROM roles
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'nemsm' as table_name, COUNT(*) as record_count FROM nemsm
UNION ALL
SELECT 'work_schedule' as table_name, COUNT(*) as record_count FROM work_schedule
UNION ALL
SELECT 'reports' as table_name, COUNT(*) as record_count FROM reports
UNION ALL
SELECT 'nemsm_reports' as table_name, COUNT(*) as record_count FROM nemsm_reports
UNION ALL
SELECT 'heartbeat_reports' as table_name, COUNT(*) as record_count FROM heartbeat_reports
UNION ALL
SELECT 'patroni_reports' as table_name, COUNT(*) as record_count FROM patroni_reports
UNION ALL
SELECT 'transaction_reports' as table_name, COUNT(*) as record_count FROM transaction_reports
UNION ALL
SELECT 'alert_reports' as table_name, COUNT(*) as record_count FROM alert_reports
UNION ALL
SELECT 'apisix_reports' as table_name, COUNT(*) as record_count FROM apisix_reports
UNION ALL
SELECT 'monthly_work_schedules' as table_name, COUNT(*) as record_count FROM monthly_work_schedules
UNION ALL
SELECT 'monthly_schedule_logs' as table_name, COUNT(*) as record_count FROM monthly_schedule_logs
ORDER BY table_name;

-- ==================================================================
-- PHẦN 3: BACKUP DỮ LIỆU QUAN TRỌNG
-- ==================================================================

-- Tạo bảng backup tạm thời với timestamp
SET @backup_suffix = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');

-- Backup bảng users
SET @sql = CONCAT('CREATE TABLE users_backup_', @backup_suffix, ' AS SELECT * FROM users');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backup bảng work_schedule
SET @sql = CONCAT('CREATE TABLE work_schedule_backup_', @backup_suffix, ' AS SELECT * FROM work_schedule');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backup bảng monthly_work_schedules
SET @sql = CONCAT('CREATE TABLE monthly_work_schedules_backup_', @backup_suffix, ' AS SELECT * FROM monthly_work_schedules');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backup bảng reports
SET @sql = CONCAT('CREATE TABLE reports_backup_', @backup_suffix, ' AS SELECT * FROM reports');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT CONCAT('ĐÃ TẠO CÁC BẢNG BACKUP VỚI SUFFIX: ', @backup_suffix) as backup_info;

-- ==================================================================
-- PHẦN 4: XUẤT SCRIPT TẠO LẠI STORED PROCEDURES
-- ==================================================================

SELECT 'DANH SÁCH STORED PROCEDURES:' as info;
SHOW PROCEDURE STATUS WHERE Db = 'bc_bss';

SELECT 'DANH SÁCH FUNCTIONS:' as info;
SHOW FUNCTION STATUS WHERE Db = 'bc_bss';

-- ==================================================================
-- PHẦN 5: THÔNG TIN VỀ FOREIGN KEYS
-- ==================================================================

SELECT 'THÔNG TIN FOREIGN KEYS:' as info;
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'bc_bss' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ==================================================================
-- PHẦN 6: KIỂM TRA INDEX
-- ==================================================================

SELECT 'DANH SÁCH INDEX:' as info;
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    INDEX_TYPE,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'bc_bss'
ORDER BY TABLE_NAME, INDEX_NAME;

-- ==================================================================
-- PHẦN 7: BACKUP CONFIGURATION
-- ==================================================================

-- Lưu thông tin cấu hình database
SELECT 'THÔNG TIN CẤU HÌNH DATABASE:' as info;

SELECT 'CHARACTER SET' as config_type, DEFAULT_CHARACTER_SET_NAME as value
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'bc_bss'
UNION ALL
SELECT 'COLLATION' as config_type, DEFAULT_COLLATION_NAME as value
FROM information_schema.SCHEMATA  
WHERE SCHEMA_NAME = 'bc_bss'
UNION ALL
SELECT 'ENGINE' as config_type, ENGINE as value
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'bc_bss' 
GROUP BY ENGINE;

-- ==================================================================
-- PHẦN 8: HOÀN TẤT BACKUP
-- ==================================================================

SELECT '========================================' as separator;
SELECT 'BACKUP HOÀN TẤT!' as status;
SELECT NOW() as completed_time;
SELECT CONCAT('Các bảng backup được tạo với suffix: ', @backup_suffix) as backup_tables;
SELECT 'Hãy chạy mysqldump để tạo file backup SQL!' as next_step;
SELECT '========================================' as separator;

-- ==================================================================
-- HƯỚNG DẪN SỬ DỤNG MYSQLDUMP
-- ==================================================================

SELECT 'LỆNH MYSQLDUMP ĐỂ TẠO FILE BACKUP:' as guide;
SELECT CONCAT('mysqldump -u root -p bc_bss > bc_bss_backup_', DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s'), '.sql') as command;

-- ==================================================================
-- SCRIPT DỌN DẸP CÁC BẢNG BACKUP CŨ
-- ==================================================================

-- Tạo procedure để dọn dẹp các bảng backup cũ (giữ lại 7 ngày gần nhất)
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS CleanOldBackupTables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE table_name VARCHAR(255);
    DECLARE creation_date VARCHAR(15);
    DECLARE days_old INT;
    
    DECLARE backup_cursor CURSOR FOR
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = 'bc_bss'
        AND TABLE_NAME LIKE '%_backup_%';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN backup_cursor;
    
    cleanup_loop: LOOP
        FETCH backup_cursor INTO table_name;
        IF done THEN
            LEAVE cleanup_loop;
        END IF;
        
        -- Lấy phần date từ tên bảng (format: tablename_backup_YYYYMMDD_HHMMSS)
        SET creation_date = SUBSTRING(table_name, LENGTH(table_name) - 14, 8);
        
        -- Tính số ngày từ ngày tạo đến hiện tại
        SET days_old = DATEDIFF(CURDATE(), STR_TO_DATE(creation_date, '%Y%m%d'));
        
        -- Xóa bảng backup cũ hơn 7 ngày
        IF days_old > 7 THEN
            SET @sql = CONCAT('DROP TABLE IF EXISTS ', table_name);
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            
            SELECT CONCAT('Đã xóa bảng backup cũ: ', table_name) as cleanup_info;
        END IF;
        
    END LOOP;
    
    CLOSE backup_cursor;
    
    SELECT 'Hoàn thành dọn dẹp các bảng backup cũ!' as cleanup_status;
END$$
DELIMITER ;

-- Gọi procedure dọn dẹp
CALL CleanOldBackupTables(); 