-- Đơn giản: Chỉ insert dữ liệu trực tiếp vào database
USE bc_bss;

-- Xóa dữ liệu cũ
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

-- Insert dữ liệu trực tiếp (không cần stored procedure phức tạp)
INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by, created_at) 
VALUES (
    7, 
    2025, 
    '[
        {"date":1,"shifts":{"morning":{"role":"A","employee_name":"Nguyễn Văn A"},"afternoon":{"role":"D","employee_name":"Trần Thị D"},"evening":{"role":"C","employee_name":"Lê Văn C"}}},
        {"date":2,"shifts":{"morning":{"role":"B","employee_name":"Phạm Thị B"},"afternoon":{"role":"A","employee_name":"Nguyễn Văn A"},"evening":{"role":"D","employee_name":"Trần Thị D"}}},
        {"date":3,"shifts":{"morning":{"role":"C","employee_name":"Lê Văn C"},"afternoon":{"role":"B","employee_name":"Phạm Thị B"},"evening":{"role":"A","employee_name":"Nguyễn Văn A"}}},
        {"date":4,"shifts":{"morning":{"role":"D","employee_name":"Trần Thị D"},"afternoon":{"role":"C","employee_name":"Lê Văn C"},"evening":{"role":"B","employee_name":"Phạm Thị B"}}},
        {"date":5,"shifts":{"morning":{"role":"A","employee_name":"Nguyễn Văn A"},"afternoon":{"role":"D","employee_name":"Trần Thị D"},"evening":{"role":"C","employee_name":"Lê Văn C"}}}
    ]',
    1,
    NOW()
);

-- Kiểm tra dữ liệu đã insert
SELECT 'Dữ liệu đã được tạo:' as result;
SELECT id, month, year, LEFT(schedule_data, 200) as sample_data, created_at 
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025;

-- Test query trực tiếp như backend sẽ gọi
SELECT 'Test query như backend:' as result;
SELECT id, month, year, schedule_data, created_at, updated_at, created_by
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025
ORDER BY created_at DESC
LIMIT 1; 