#!/usr/bin/env node

const http = require('http');
const https = require('https');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log('🔍 Kiểm tra kết nối Backend...');
console.log(`🌐 Backend URL: ${BACKEND_URL}`);

function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const httpModule = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Backend-Test-Script'
      }
    };

    if (data && method !== 'GET') {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = httpModule.request(options, (res) => {
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
          headers: res.headers,
          data: parsedData
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('\n📋 Bắt đầu test các endpoints...\n');

  // Test 1: Health check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const healthResult = await testEndpoint(`${BACKEND_URL}/`);
    console.log(`   ✅ Health check: ${healthResult.status}`);
    if (healthResult.data) {
      console.log(`   📄 Response:`, JSON.stringify(healthResult.data, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    console.log('   🚨 Backend có thể không chạy hoặc không thể kết nối!');
    return;
  }

  // Test 2: Work schedule endpoint
  try {
    console.log('\n2️⃣ Testing work-schedule endpoint...');
    const scheduleResult = await testEndpoint(`${BACKEND_URL}/work-schedule`);
    console.log(`   ✅ Work schedule: ${scheduleResult.status}`);
    if (scheduleResult.data) {
      console.log(`   📄 Response:`, JSON.stringify(scheduleResult.data, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Work schedule test failed: ${error.message}`);
  }

  // Test 3: Reports can-create endpoint (với user ID giả)
  try {
    console.log('\n3️⃣ Testing reports can-create endpoint...');
    const canCreateResult = await testEndpoint(`${BACKEND_URL}/reports/can-create/1`);
    console.log(`   ✅ Can create report: ${canCreateResult.status}`);
    if (canCreateResult.data) {
      console.log(`   📄 Response:`, JSON.stringify(canCreateResult.data, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Can create report test failed: ${error.message}`);
  }

  // Test 4: Database connection thông qua reports endpoint
  try {
    console.log('\n4️⃣ Testing database connection via reports endpoint...');
    const reportsResult = await testEndpoint(`${BACKEND_URL}/reports`);
    console.log(`   ✅ Reports database: ${reportsResult.status}`);
    if (reportsResult.data) {
      console.log(`   📄 Response:`, Array.isArray(reportsResult.data) ? `Array with ${reportsResult.data.length} items` : JSON.stringify(reportsResult.data, null, 2));
    }
  } catch (error) {
    console.log(`   ❌ Database connection test failed: ${error.message}`);
  }

  console.log('\n✅ Hoàn thành test backend connection!');
  console.log('\n📝 Nếu thấy lỗi, hãy kiểm tra:');
  console.log('   - Backend server có đang chạy không');
  console.log('   - Database có kết nối được không');  
  console.log('   - Port 3000 có bị chiếm không');
  console.log('   - Firewall có chặn kết nối không');
}

runTests().catch(console.error); 