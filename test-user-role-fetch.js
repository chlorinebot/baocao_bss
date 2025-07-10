const axios = require('axios');

async function testUserRole() {
  console.log('🧪 Test API lấy vai trò phân công của user...');
  
  // Test với user ID = 25 (dựa theo bảng)
  const userId = 25;
  console.log(`🔍 Test với User ID: ${userId}`);
  
  try {
    const response = await axios.get(`http://localhost:3000/work-schedule/user/${userId}/role`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = response.data;
    console.log('📄 Response:');
    console.log('✅ Success:', data.success);
    console.log('📝 Message:', data.message);
    
    if (data.success && data.data) {
      console.log('🎭 Vai trò:', data.data.role);
      console.log('🆔 Schedule ID:', data.data.scheduleId);
      
      if (data.data.role === 'Chưa được phân công') {
        console.log('ℹ️ User chưa được phân công vào vai trò nào');
      } else {
        console.log('✅ User đã được phân công vai trò:', data.data.role);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi test:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

// Test tạo work schedule
async function testCreateSchedule() {
  console.log('\n🧪 Test tạo work schedule...\n');
  
  const scheduleData = {
    employee_a: 25,
    employee_b: 28,
    employee_c: 27,
    employee_d: 26
  };
  
  try {
    const response = await axios.post('http://localhost:3000/work-schedule', scheduleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = response.data;
    console.log('📄 Tạo schedule response:');
    console.log('✅ Success:', data.success);
    console.log('📝 Message:', data.message);
    
    if (data.success) {
      console.log('✅ Tạo work schedule thành công!');
      console.log('🔄 Bây giờ test lại user role...');
      
      // Test lại user role sau khi tạo schedule
      setTimeout(testUserRole, 1000);
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo schedule:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', error.response.data);
    }
  }
}

// Test với nhiều user ID
async function testMultipleUsers() {
  console.log('\n🧪 Test với nhiều user ID...\n');
  
  const userIds = [25, 28, 27, 26, 1]; // Test với các user ID từ bảng
  
  for (const userId of userIds) {
    console.log(`\n--- Test User ID: ${userId} ---`);
    
    try {
      const response = await axios.get(`http://localhost:3000/work-schedule/user/${userId}/role`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      console.log('📄 Response:', {
        success: data.success,
        role: data.data?.role,
        scheduleId: data.data?.scheduleId
      });
    } catch (error) {
      console.error('❌ Lỗi:', error.message);
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
      }
    }
  }
}

// Test server connection
async function testServerConnection() {
  console.log('🔍 Test kết nối server...');
  
  try {
    const response = await axios.get('http://localhost:3000/work-schedule', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Server đang chạy!');
    return true;
  } catch (error) {
    console.error('❌ Không thể kết nối server:', error.message);
    return false;
  }
}

// Chạy test
async function runTests() {
  console.log('🚀 Bắt đầu test API vai trò phân công...');
  
  // Kiểm tra kết nối server trước
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.log('❌ Server chưa sẵn sàng. Vui lòng khởi động server trước.');
    return;
  }
  
  // Test user role
  await testUserRole();
  
  // Test tạo schedule sau 2 giây
  setTimeout(testCreateSchedule, 2000);
  
  // Test nhiều user sau 5 giây
  setTimeout(testMultipleUsers, 5000);
}

runTests(); 