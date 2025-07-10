const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testCurrentShift() {
  try {
    console.log('🔍 Testing current shift endpoint...');
    
    // Test với user ID 1
    const userId = 1;
    const response = await axios.get(`${API_BASE_URL}/work-schedule/user/${userId}/current-shift`);
    
    console.log('✅ Response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('🎯 User role:', response.data.data.role);
      console.log('⏰ Current shift:', response.data.data.shift);
      console.log('📅 Schedule ID:', response.data.data.scheduleId);
    } else {
      console.log('❌ Request failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing current shift:', error.message);
    if (error.response) {
      console.error('📝 Error response:', error.response.data);
    }
  }
}

// Test với nhiều user ID khác nhau
async function testMultipleUsers() {
  const userIds = [1, 2, 3, 4, 5];
  
  for (const userId of userIds) {
    console.log(`\n🔍 Testing user ID: ${userId}`);
    try {
      const response = await axios.get(`${API_BASE_URL}/work-schedule/user/${userId}/current-shift`);
      
      if (response.data.success) {
        console.log(`✅ User ${userId} - Role: ${response.data.data.role}, Shift: ${response.data.data.shift}`);
      } else {
        console.log(`❌ User ${userId} - ${response.data.message}`);
      }
    } catch (error) {
      console.log(`❌ User ${userId} - Error: ${error.message}`);
    }
  }
}

// Chạy test
testCurrentShift().then(() => {
  console.log('\n📋 Testing multiple users...');
  return testMultipleUsers();
}).then(() => {
  console.log('\n🎉 All tests completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
}); 