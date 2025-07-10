const http = require('http');

const testEndpoint = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/work-schedule/user/1/current-shift',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Status:', res.statusCode);
      console.log('📊 Response:', data);
      
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.success) {
          console.log('🎯 Role:', jsonData.data.role);
          console.log('⏰ Shift:', jsonData.data.shift);
          console.log('🕐 Time:', jsonData.data.shiftTime);
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
};

console.log('🔍 Testing current shift endpoint...');
testEndpoint(); 