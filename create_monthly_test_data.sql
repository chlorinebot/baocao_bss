-- Tạo dữ liệu test cho monthly_work_schedules tháng 8/2025
USE bc_bss;

-- Xóa dữ liệu cũ nếu có
DELETE FROM monthly_work_schedules WHERE month = 8 AND year = 2025;

-- Tạo schedule_data cho tháng 8/2025
-- User 7 = Nhân viên B sẽ được assign ca chiều ngày 7
INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by, created_at, updated_at)
VALUES (
  8, -- tháng 8
  2025, -- năm 2025
  JSON_ARRAY(
    JSON_OBJECT('day', 1, 'morning', 'A', 'afternoon', 'B', 'evening', 'C'),
    JSON_OBJECT('day', 2, 'morning', 'B', 'afternoon', 'C', 'evening', 'D'),
    JSON_OBJECT('day', 3, 'morning', 'C', 'afternoon', 'D', 'evening', 'A'),
    JSON_OBJECT('day', 4, 'morning', 'D', 'afternoon', 'A', 'evening', 'B'),
    JSON_OBJECT('day', 5, 'morning', 'A', 'afternoon', 'B', 'evening', 'C'),
    JSON_OBJECT('day', 6, 'morning', 'B', 'afternoon', 'C', 'evening', 'D'),
    JSON_OBJECT('day', 7, 'morning', 'C', 'afternoon', 'B', 'evening', 'A'), -- Ngày 7: User 7 (B) = Ca Chiều
    JSON_OBJECT('day', 8, 'morning', 'D', 'afternoon', 'A', 'evening', 'B'),
    JSON_OBJECT('day', 9, 'morning', 'A', 'afternoon', 'B', 'evening', 'C'),
    JSON_OBJECT('day', 10, 'morning', 'B', 'afternoon', 'C', 'evening', 'D')
  ),
  1, -- created_by
  NOW(), -- created_at
  NOW()  -- updated_at
);

-- Kiểm tra kết quả
SELECT 
  id, 
  month, 
  year, 
  JSON_EXTRACT(schedule_data, '$[6]') as day_7_schedule,
  created_at
FROM monthly_work_schedules 
WHERE month = 8 AND year = 2025;

SELECT 'Dữ liệu test đã được tạo cho monthly_work_schedules' as message; 