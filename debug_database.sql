-- Debug database để tìm lỗi
USE bc_bss;

-- 1. Kiểm tra dữ liệu có tồn tại không
SELECT 'Kiểm tra dữ liệu tồn tại:' as step;
SELECT COUNT(*) as total_records FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

-- 2. Kiểm tra cấu trúc bảng
SELECT 'Cấu trúc bảng:' as step;
DESCRIBE monthly_work_schedules;

-- 3. Kiểm tra dữ liệu chi tiết
SELECT 'Dữ liệu chi tiết:' as step;
SELECT 
    id,
    month,
    year,
    schedule_data IS NULL as is_null,
    LENGTH(schedule_data) as data_length,
    LEFT(schedule_data, 100) as first_100_chars,
    created_by,
    created_at
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025;

-- 4. Test query chính xác như backend
SELECT 'Query như backend:' as step;
SELECT id, month, year, schedule_data, created_at, updated_at, created_by
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025
ORDER BY created_at DESC
LIMIT 1;

-- 5. Thêm dữ liệu mới nếu cần
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by) 
VALUES (
    7, 
    2025, 
    '[{"date":1,"shifts":{"morning":{"role":"A","employee_name":"Test A"},"afternoon":{"role":"B","employee_name":"Test B"},"evening":{"role":"C","employee_name":"Test C"}}},{"date":2,"shifts":{"morning":{"role":"B","employee_name":"Test B"},"afternoon":{"role":"C","employee_name":"Test C"},"evening":{"role":"D","employee_name":"Test D"}}}]',
    1
);

-- 6. Kiểm tra lại sau khi insert
SELECT 'Sau khi insert:' as step;
SELECT id, month, year, schedule_data, created_by FROM monthly_work_schedules WHERE month = 7 AND year = 2025; 