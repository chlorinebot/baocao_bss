const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        console.log(`${method} ${path} - Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}\n`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', err => {
      console.log(`Error: ${err.message}`);
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTest() {
  console.log('🧪 BƯỚC 1: Tạo dữ liệu test cho monthly_work_schedules...\n');
  
  try {
    // Tạo dữ liệu test
    await makeRequest('POST', '/monthly-schedules/debug/create-test-data');
    
    console.log('🔍 BƯỚC 2: Kiểm tra API sau khi có dữ liệu monthly_work_schedules...\n');
    
    // Test user role
    await makeRequest('GET', '/work-schedule/user/7/role');
    
    // Test current shift
    await makeRequest('GET', '/work-schedule/user/7/current-shift');
    
    // Test reports permission
    await makeRequest('GET', '/reports/can-create/7');
    
    console.log('✅ Test hoàn thành!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

runTest(); 