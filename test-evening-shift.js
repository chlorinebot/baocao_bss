// Test script cho ca đêm
const fetch = require('node-fetch');

async function testEveningShift() {
  try {
    console.log('🌙 Testing Evening Shift Logic...\n');
    
    // 1. Tạo schedule cho ngày hôm trước (6/8)
    console.log('📅 Step 1: Tạo schedule cho ngày hôm trước...');
    const createResponse = await fetch('http://localhost:3000/work-schedule/debug/create-yesterday-schedule', {
      method: 'POST'
    });
    const createResult = await createResponse.json();
    console.log('✅ Create result:', createResult);
    
    // 2. Test getUserRole cho user 7 (employee_b)
    console.log('\n👤 Step 2: Test getUserRole cho user 7...');
    const roleResponse = await fetch('http://localhost:3000/work-schedule/user/7/role');
    const roleResult = await roleResponse.json();
    console.log('✅ Role result:', roleResult);
    
    // 3. Test getUserCurrentShift cho user 7
    console.log('\n🕐 Step 3: Test getUserCurrentShift cho user 7...');
    const shiftResponse = await fetch('http://localhost:3000/work-schedule/user/7/current-shift');
    const shiftResult = await shiftResponse.json();
    console.log('✅ Shift result:', shiftResult);
    
    // 4. Test can-create report
    console.log('\n📝 Step 4: Test can-create report cho user 7...');
    const reportResponse = await fetch('http://localhost:3000/reports/can-create/7');
    const reportResult = await reportResponse.json();
    console.log('✅ Report permission:', reportResult);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Đợi server khởi động
setTimeout(testEveningShift, 3000); 