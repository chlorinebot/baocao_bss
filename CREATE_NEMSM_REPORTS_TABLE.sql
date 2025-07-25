-- Script tạo bảng nemsm_reports
-- Chạy script này trong database để tạo bảng nếu chưa có

CREATE TABLE IF NOT EXISTS `nemsm_reports` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_report_id` int(11) NOT NULL,
  `id_nemsm` int(11) NOT NULL,
  `cpu` varchar(10) DEFAULT 'false',
  `memory` varchar(10) DEFAULT 'false',
  `disk_space_used` varchar(10) DEFAULT 'false',
  `network_traffic` varchar(10) DEFAULT 'false',
  `netstat` varchar(10) DEFAULT 'false',
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `fk_nemsm_reports_report` (`id_report_id`),
  KEY `fk_nemsm_reports_nemsm` (`id_nemsm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thêm foreign key constraints nếu các bảng reports và nemsm đã tồn tại
-- Chỉ chạy các lệnh dưới nếu bảng reports và nemsm đã có dữ liệu

-- ALTER TABLE `nemsm_reports` 
-- ADD CONSTRAINT `fk_nemsm_reports_report` 
-- FOREIGN KEY (`id_report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

-- ALTER TABLE `nemsm_reports` 
-- ADD CONSTRAINT `fk_nemsm_reports_nemsm` 
-- FOREIGN KEY (`id_nemsm`) REFERENCES `nemsm` (`id`) ON DELETE CASCADE;

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
    AND TABLE_NAME = 'nemsm_reports'
ORDER BY 
    ORDINAL_POSITION; 