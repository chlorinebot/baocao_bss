-- KIỂM TRA VÀ SỬA DỮ LIỆU DATABASE
-- =====================================

-- 1. Kiểm tra dữ liệu hiện tại
SELECT 
    id, 
    month, 
    year, 
    schedule_data,
    LENGTH(schedule_data) as data_length,
    created_at,
    created_by
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025
ORDER BY created_at DESC;

-- 2. Xóa dữ liệu cũ (nếu có)
DELETE FROM monthly_work_schedules WHERE month = 7 AND year = 2025;

-- 3. Chèn dữ liệu test mới với JSON đúng format
INSERT INTO monthly_work_schedules (month, year, schedule_data, created_by)
VALUES (
    7,
    2025,
    '[
        {
            "date": 1,
            "shifts": {
                "morning": {"role": "A", "employee_name": "Nguyễn Văn A"},
                "afternoon": {"role": "B", "employee_name": "Nguyễn Văn B"},
                "evening": {"role": "C", "employee_name": "Nguyễn Văn C"}
            }
        },
        {
            "date": 2,
            "shifts": {
                "morning": {"role": "B", "employee_name": "Nguyễn Văn B"},
                "afternoon": {"role": "C", "employee_name": "Nguyễn Văn C"},
                "evening": {"role": "D", "employee_name": "Nguyễn Văn D"}
            }
        },
        {
            "date": 3,
            "shifts": {
                "morning": {"role": "C", "employee_name": "Nguyễn Văn C"},
                "afternoon": {"role": "D", "employee_name": "Nguyễn Văn D"},
                "evening": {"role": "A", "employee_name": "Nguyễn Văn A"}
            }
        }
    ]',
    1
);

-- 4. Kiểm tra lại sau khi chèn
SELECT 
    id, 
    month, 
    year,
    JSON_VALID(schedule_data) as is_valid_json,
    JSON_LENGTH(schedule_data) as json_length,
    LEFT(schedule_data, 200) as first_200_chars,
    created_at
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025;

-- 5. Test parse JSON
SELECT 
    id,
    JSON_EXTRACT(schedule_data, '$[0].date') as first_date,
    JSON_EXTRACT(schedule_data, '$[0].shifts.morning.employee_name') as first_morning_employee
FROM monthly_work_schedules 
WHERE month = 7 AND year = 2025; 