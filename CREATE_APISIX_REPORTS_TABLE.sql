-- Script tạo bảng apisix_reports
-- Chạy script này trong database để tạo bảng nếu chưa có

CREATE TABLE IF NOT EXISTS `apisix_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `note_request` text,
  `note_upstream` text,
  PRIMARY KEY (`id`),
  KEY `fk_apisix_reports_report` (`id_report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm foreign key constraint nếu bảng reports đã tồn tại
-- Chỉ chạy lệnh dưới nếu bảng reports đã có dữ liệu

-- ALTER TABLE `apisix_reports` 
-- ADD CONSTRAINT `fk_apisix_reports_report` 
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
    AND TABLE_NAME = 'apisix_reports'
ORDER BY 
    ORDINAL_POSITION; 