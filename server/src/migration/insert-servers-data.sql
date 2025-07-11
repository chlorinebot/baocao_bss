-- Xóa dữ liệu cũ nếu có
DELETE FROM nemsm;

-- Reset auto increment về 1
ALTER TABLE nemsm AUTO_INCREMENT = 1;

-- Thêm dữ liệu servers mẫu
INSERT INTO nemsm (server_name, ip) VALUES 
('Prod-gateway1', '10.2.157.5'),
('Prod-gateway2', '10.2.157.6'),
('Appsrv-pro1', '10.2.45.79'),
('Appsrv-pro2', '10.2.45.80'),
('Prod-minio-01', '10.2.45.81'),
('Prod-minio-02', '10.2.45.82'),
('Prod-minio-03', '10.2.45.83'),
('Prod-minio-04', '10.2.45.84'),
('p-node1', '10.2.45.86'),
('p-node2', '10.2.45.87'),
('p-node3', '10.2.45.88');

-- Kiểm tra dữ liệu
SELECT * FROM nemsm ORDER BY id; 