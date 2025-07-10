const { exec } = require('child_process');

async function testUserRole() {
  console.log('🧪 Test API lấy vai trò phân công của user...');
  
  // Test với user ID = 25 (dựa theo bảng)
  const userId = 25;
  console.log(`🔍 Test với User ID: ${userId}`);
  
  const curlCommand = `curl -X GET http://localhost:3000/work-schedule/user/${userId}/role -H "Content-Type: application/json" -s`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Lỗi khi test:', error.message);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ Lỗi cURL:', stderr);
      return;
    }
    
    try {
      const response = JSON.parse(stdout);
      console.log('📄 Response:');
      console.log('✅ Success:', response.success);
      console.log('📝 Message:', response.message);
      
      if (response.success && response.data) {
        console.log('🎭 Vai trò:', response.data.role);
        console.log('🆔 Schedule ID:', response.data.scheduleId);
        
        if (response.data.role === 'Chưa được phân công') {
          console.log('ℹ️ User chưa được phân công vào vai trò nào');
        } else {
          console.log('✅ User đã được phân công vai trò:', response.data.role);
        }
      }
    } catch (parseError) {
      console.error('❌ Lỗi parse JSON:', parseError.message);
      console.log('📄 Raw response:', stdout);
    }
  });
}

// Test với nhiều user ID
async function testMultipleUsers() {
  console.log('\n🧪 Test với nhiều user ID...\n');
  
  const userIds = [25, 28, 27, 26, 1]; // Test với các user ID từ bảng
  
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    console.log(`\n--- Test User ID: ${userId} ---`);
    
    const curlCommand = `curl -X GET http://localhost:3000/work-schedule/user/${userId}/role -H "Content-Type: application/json" -s`;
    
    await new Promise((resolve) => {
      exec(curlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Lỗi:', error.message);
          resolve();
          return;
        }
        
        try {
          const response = JSON.parse(stdout);
          console.log('📄 Response:', {
            success: response.success,
            role: response.data?.role,
            scheduleId: response.data?.scheduleId
          });
        } catch (parseError) {
          console.error('❌ Lỗi parse:', parseError.message);
        }
        
        resolve();
      });
    });
  }
}

// Test tạo work schedule trước
async function testCreateSchedule() {
  console.log('\n🧪 Test tạo work schedule...\n');
  
  const scheduleData = {
    employee_a: 25,
    employee_b: 28,
    employee_c: 27,
    employee_d: 26
  };
  
  const curlCommand = `curl -X POST http://localhost:3000/work-schedule -H "Content-Type: application/json" -d "${JSON.stringify(scheduleData).replace(/"/g, '\\"')}" -s`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Lỗi khi tạo schedule:', error.message);
      return;
    }
    
    try {
      const response = JSON.parse(stdout);
      console.log('📄 Tạo schedule response:');
      console.log('✅ Success:', response.success);
      console.log('📝 Message:', response.message);
      
      if (response.success) {
        console.log('✅ Tạo work schedule thành công!');
        console.log('🔄 Bây giờ test lại user role...');
        
        // Test lại user role sau khi tạo schedule
        setTimeout(testUserRole, 1000);
      }
    } catch (parseError) {
      console.error('❌ Lỗi parse JSON:', parseError.message);
      console.log('📄 Raw response:', stdout);
    }
  });
}

// Chạy test
console.log('🚀 Bắt đầu test API vai trò phân công...');
testUserRole();

// Test tạo schedule sau 2 giây
setTimeout(testCreateSchedule, 2000);

// Test nhiều user sau 5 giây
setTimeout(testMultipleUsers, 5000); 