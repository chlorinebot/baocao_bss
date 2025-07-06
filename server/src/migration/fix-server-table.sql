-- Xóa bảng cũ nếu tồn tại
DROP TABLE IF EXISTS nemsm;

-- Tạo lại bảng với cấu hình đúng
CREATE TABLE nemsm (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  server_name VARCHAR(255) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu nếu cần
INSERT INTO nemsm (server_name, ip) VALUES ('prod-gateway1', '10.2.157.5');

-- Kiểm tra dữ liệu
SELECT * FROM nemsm; 