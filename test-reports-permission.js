#!/usr/bin/env node

const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const TEST_USER_ID = 7; // User ID từ log

console.log('🔍 Test Reports Permission API...');
console.log(`🌐 Backend URL: ${BACKEND_URL}`);
console.log(`👤 Test User ID: ${TEST_USER_ID}`);

function testEndpoint(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Reports-Test-Script'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        let parsedData = responseData;
        try {
          parsedData = JSON.parse(responseData);
        } catch (e) {
          // Giữ nguyên text nếu không parse được JSON
        }
        
        resolve({
          status: res.statusCode,
          data: parsedData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function runTest() {
  console.log('\n📋 Bắt đầu test reports permission...\n');

  try {
    console.log(`🔍 Testing reports/can-create/${TEST_USER_ID}...`);
    const result = await testEndpoint(`${BACKEND_URL}/reports/can-create/${TEST_USER_ID}`);
    
    console.log(`📊 Status: ${result.status}`);
    console.log(`📄 Response:`, JSON.stringify(result.data, null, 2));
    
    if (result.status === 200 && result.data) {
      const { canCreate, reason, currentShift, shiftTime, isWorkingTime } = result.data;
      
      console.log('\n📋 Kết quả phân tích:');
      console.log(`✅ Có thể tạo báo cáo: ${canCreate ? 'CÓ' : 'KHÔNG'}`);
      console.log(`📝 Lý do: ${reason || 'Không có'}`);
      console.log(`🎯 Ca hiện tại: ${currentShift || 'Không xác định'}`);
      console.log(`⏰ Thời gian ca: ${shiftTime || 'Không xác định'}`);
      console.log(`🕐 Đang trong ca: ${isWorkingTime ? 'CÓ' : 'KHÔNG'}`);
      
      if (!canCreate) {
        console.log('\n🚨 NGUYÊN NHÂN KHÔNG THỂ TẠO BÁO CÁO:');
        console.log(`   ${reason}`);
        
        if (reason && reason.includes('chưa được phân công')) {
          console.log('\n💡 GIẢI PHÁP:');
          console.log('   1. Chạy script SQL: mysql -u root -p bc_bss < create_test_schedule.sql');
          console.log('   2. Hoặc tạo work_schedule qua dashboard');
          console.log('   3. Đảm bảo user ID 7 có trong schedule');
        }
        
        if (reason && reason.includes('nghỉ ngày hôm nay')) {
          console.log('\n💡 THÔNG TIN:');
          console.log('   - Đây là tính năng rotation mới');
          console.log('   - User nghỉ 1 ngày trong chu kỳ 4 ngày');
          console.log('   - Không thể tạo báo cáo khi nghỉ');
        }
        
        if (reason && reason.includes('thời gian cho phép')) {
          console.log('\n💡 THÔNG TIN THỜI GIAN:');
          console.log('   - Ca sáng: 06:00 - 14:30');
          console.log('   - Ca chiều: 14:00 - 22:30');
          console.log('   - Ca tối: 22:00 - 06:30 (hôm sau)');
          console.log(`   - Thời gian hiện tại: ${new Date().toLocaleTimeString('vi-VN')}`);
        }
      } else {
        console.log('\n✅ CÓ THỂ TẠO BÁO CÁO!');
        console.log('   User có thể tạo báo cáo ngay bây giờ.');
      }
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('\n🚨 Các bước kiểm tra:');
    console.log('   1. Backend có đang chạy không? (npm run start:dev)');
    console.log('   2. Database có kết nối được không?');
    console.log('   3. Bảng work_schedule có dữ liệu không?');
    console.log('   4. User ID 7 có tồn tại không?');
  }

  console.log('\n✅ Hoàn thành test!');
}

runTest().catch(console.error); 