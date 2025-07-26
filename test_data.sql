-- Tạo dữ liệu test cho phân công tháng 7/2025
USE bc_bss;

-- Xóa dữ liệu cũ
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

-- Insert dữ liệu test đơn giản
INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by, created_at) 
VALUES (
    7, 
    2025, 
    '[
        {"date":1,"shifts":{"morning":{"role":"A","employee_name":"Nguyễn Văn A"},"afternoon":{"role":"D","employee_name":"Trần Thị D"},"evening":{"role":"C","employee_name":"Lê Văn C"}}},
        {"date":2,"shifts":{"morning":{"role":"B","employee_name":"Phạm Thị B"},"afternoon":{"role":"A","employee_name":"Nguyễn Văn A"},"evening":{"role":"D","employee_name":"Trần Thị D"}}},
        {"date":3,"shifts":{"morning":{"role":"C","employee_name":"Lê Văn C"},"afternoon":{"role":"B","employee_name":"Phạm Thị B"},"evening":{"role":"A","employee_name":"Nguyễn Văn A"}}},
        {"date":4,"shifts":{"morning":{"role":"D","employee_name":"Trần Thị D"},"afternoon":{"role":"C","employee_name":"Lê Văn C"},"evening":{"role":"B","employee_name":"Phạm Thị B"}}},
        {"date":5,"shifts":{"morning":{"role":"A","employee_name":"Nguyễn Văn A"},"afternoon":{"role":"D","employee_name":"Trần Thị D"},"evening":{"role":"C","employee_name":"Lê Văn C"}}},
        {"date":6,"shifts":{"morning":{"role":"B","employee_name":"Phạm Thị B"},"afternoon":{"role":"A","employee_name":"Nguyễn Văn A"},"evening":{"role":"D","employee_name":"Trần Thị D"}}},
        {"date":7,"shifts":{"morning":{"role":"C","employee_name":"Lê Văn C"},"afternoon":{"role":"B","employee_name":"Phạm Thị B"},"evening":{"role":"A","employee_name":"Nguyễn Văn A"}}}
    ]',
    1,
    NOW()
);

-- Kiểm tra dữ liệu
SELECT 'Dữ liệu test đã được tạo:' as message;
SELECT id, month, year, created_at, 
       CASE 
           WHEN schedule_data IS NOT NULL THEN 'CÓ DỮ LIỆU JSON'
           ELSE 'KHÔNG CÓ DỮ LIỆU'
       END as data_status
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025;

-- Test query như backend sẽ gọi
SELECT 'Query test như backend:' as message;
SELECT id, month, year, schedule_data, created_at, updated_at, created_by
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025
ORDER BY created_at DESC
LIMIT 1; 