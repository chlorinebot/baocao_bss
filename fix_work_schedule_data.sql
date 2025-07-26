-- Fix work_schedule data để có thể tạo phân công tháng
USE bc_bss;

-- 1. Kiểm tra dữ liệu hiện tại
SELECT 'Kiểm tra users table:' as step;
SELECT id, firstName, lastName, email, role_id FROM users ORDER BY id;

SELECT 'Kiểm tra work_schedule table:' as step;
SELECT * FROM work_schedule WHERE active = 1;

-- 2. Tạo dữ liệu work_schedule test nếu chưa có
-- Lấy 4 user đầu tiên (ngoại trừ admin) để làm employee_a, b, c, d
SET @employee_a = (SELECT id FROM users WHERE role_id != 1 ORDER BY id LIMIT 1);
SET @employee_b = (SELECT id FROM users WHERE role_id != 1 ORDER BY id LIMIT 1 OFFSET 1);
SET @employee_c = (SELECT id FROM users WHERE role_id != 1 ORDER BY id LIMIT 1 OFFSET 2);
SET @employee_d = (SELECT id FROM users WHERE role_id != 1 ORDER BY id LIMIT 1 OFFSET 3);

-- Nếu không có đủ users, tạo users mẫu
INSERT IGNORE INTO users (firstName, lastName, email, password, role_id) VALUES
('Nguyễn', 'Văn A', 'employee_a@test.com', '$2b$10$example', 2),
('Trần', 'Thị B', 'employee_b@test.com', '$2b$10$example', 2),
('Lê', 'Văn C', 'employee_c@test.com', '$2b$10$example', 2),
('Phạm', 'Thị D', 'employee_d@test.com', '$2b$10$example', 2);

-- Lấy lại IDs sau khi tạo
SET @employee_a = (SELECT id FROM users WHERE email = 'employee_a@test.com');
SET @employee_b = (SELECT id FROM users WHERE email = 'employee_b@test.com'); 
SET @employee_c = (SELECT id FROM users WHERE email = 'employee_c@test.com');
SET @employee_d = (SELECT id FROM users WHERE email = 'employee_d@test.com');

-- Xóa các work_schedule cũ
DELETE FROM work_schedule;

-- Tạo work_schedule mới với active = 1
INSERT INTO work_schedule (employee_a, employee_b, employee_c, employee_d, active, activation_date) 
VALUES (@employee_a, @employee_b, @employee_c, @employee_d, 1, CURDATE());

SELECT 'Dữ liệu work_schedule sau khi tạo:' as step;
SELECT 
    ws.*,
    CONCAT(ua.firstName, ' ', ua.lastName) as employee_a_name,
    CONCAT(ub.firstName, ' ', ub.lastName) as employee_b_name,
    CONCAT(uc.firstName, ' ', uc.lastName) as employee_c_name,
    CONCAT(ud.firstName, ' ', ud.lastName) as employee_d_name
FROM work_schedule ws
LEFT JOIN users ua ON ws.employee_a = ua.id
LEFT JOIN users ub ON ws.employee_b = ub.id
LEFT JOIN users uc ON ws.employee_c = uc.id
LEFT JOIN users ud ON ws.employee_d = ud.id
WHERE ws.active = 1;

-- 3. Xóa phân công tháng 7/2025 nếu đã tồn tại (để có thể tạo lại)
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

SELECT 'Setup hoàn tất! Bây giờ có thể tạo phân công tháng.' as result; 