-- Script tạo bảng transaction_reports
-- Chạy script này trong database để tạo bảng nếu chưa có

CREATE TABLE IF NOT EXISTS `transaction_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `row_index` int(11) NOT NULL,
  `transaction_monitored` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `fk_transaction_reports_report` (`id_report_id`),
  KEY `idx_transaction_row_index` (`row_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm foreign key constraint nếu bảng reports đã tồn tại
-- Chỉ chạy lệnh dưới nếu bảng reports đã có dữ liệu

-- ALTER TABLE `transaction_reports` 
-- ADD CONSTRAINT `fk_transaction_reports_report` 
-- FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

-- Kiểm tra cấu trúc bảng
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'transaction_reports'
ORDER BY 
    ORDINAL_POSITION; 