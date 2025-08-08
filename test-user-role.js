// Test User Role
console.log('🔍 Testing User Role API...');

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/work-schedule/user/7/role',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('🎯 User Role:', response.data.role);
        console.log('🆔 Schedule ID:', response.data.scheduleId);
      }
    } catch (error) {
      console.log('📝 Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.end(); 