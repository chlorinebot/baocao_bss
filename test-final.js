#!/usr/bin/env node

const http = require('http');

function testAPI(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    console.log(`🔍 Testing: ${path}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📄 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('timeout', () => {
      console.log(`⏰ TIMEOUT: ${path}`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.on('error', (err) => {
      console.log(`❌ ERROR: ${err.message}`);
      reject(err);
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing với dữ liệu mới...\n');
  
  try {
    // Test 1: User role
    console.log('=== TEST 1: User Role ===');
    await testAPI('/work-schedule/user/7/role');
    console.log('\n');
    
    // Test 2: Current shift
    console.log('=== TEST 2: Current Shift ===');
    await testAPI('/work-schedule/user/7/current-shift');
    console.log('\n');
    
    // Test 3: Reports permission
    console.log('=== TEST 3: Reports Permission ===');
    await testAPI('/reports/can-create/7');
    console.log('\n');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  console.log('✅ Tests completed!');
}

// Đợi 10 giây rồi chạy test
setTimeout(() => {
  console.log('Backend should be ready now...\n');
  runTests();
}, 10000); 