-- Script tạo work_schedule test cho debug
USE bc_bss;

-- Xóa schedule cũ (nếu có)
DELETE FROM work_schedule WHERE activation_date = CURDATE();

-- Tạo schedule mới cho ngày hiện tại
-- Giả sử có 4 user với ID 1, 2, 3, 4 (hoặc thay bằng ID thực tế)
INSERT INTO work_schedule (
  employee_a, 
  employee_b, 
  employee_c, 
  employee_d, 
  active, 
  activation_date, 
  created_date, 
  updated_date
) VALUES (
  1,  -- User ID cho Nhân viên A
  2,  -- User ID cho Nhân viên B  
  3,  -- User ID cho Nhân viên C
  7,  -- User ID cho Nhân viên D (User ID 7 từ log)
  1,  -- active = true
  CURDATE(),  -- activation_date = ngày hiện tại
  NOW(),      -- created_date
  NOW()       -- updated_date
);

-- Kiểm tra kết quả
SELECT 
  ws.*,
  ua.username as employee_a_name,
  ub.username as employee_b_name,
  uc.username as employee_c_name,
  ud.username as employee_d_name
FROM work_schedule ws
LEFT JOIN users ua ON ws.employee_a = ua.id
LEFT JOIN users ub ON ws.employee_b = ub.id  
LEFT JOIN users uc ON ws.employee_c = uc.id
LEFT JOIN users ud ON ws.employee_d = ud.id
WHERE ws.activation_date = CURDATE()
ORDER BY ws.created_date DESC;

-- Kiểm tra user ID 7 có trong hệ thống không
SELECT id, username, firstName, lastName, role_id, isActive 
FROM users 
WHERE id = 7; 