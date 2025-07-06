const { exec } = require('child_process');

async function testLogin() {
  console.log('🧪 Đang test API đăng nhập...');
  
  const curlCommand = `curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"admin\\",\\"password\\":\\"admin123\\"}" -v`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Lỗi khi test:', error.message);
      return;
    }
    
    console.log('📄 Response:', stdout);
    console.log('📋 Error/Debug:', stderr);
  });
}

testLogin(); 