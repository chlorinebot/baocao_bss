const https = require('https');
const http = require('http');

// Test dữ liệu
const testReport = {
  nodeExporter: [
    { cpu: true, memory: true, disk: false, network: true, netstat: false, note: "Test server 1" },
    { cpu: false, memory: true, disk: true, network: false, netstat: true, note: "Test server 2" }
  ],
  patroni: [
    { primaryNode: true, walReplayPaused: false, replicasReceivedWal: true, primaryWalLocation: true, replicasReplayedWal: false, note: "Patroni test 1" },
    { primaryNode: false, walReplayPaused: true, replicasReceivedWal: false, primaryWalLocation: false, replicasReplayedWal: true, note: "Patroni test 2" }
  ],
  transactions: [
    { monitored: true, note: "Transaction test 1" },
    { monitored: false, note: "Transaction test 2" }
  ],
  heartbeat: [
    { heartbeat86: true, heartbeat87: false, heartbeat88: true, note: "Heartbeat test 1" },
    { heartbeat86: false, heartbeat87: true, heartbeat88: false, note: "Heartbeat test 2" }
  ],
  alerts: {
    warning: true,
    critical: false,
    info: true,
    infoBackup: true,
    warningDisk: false,
    other: true,
    note1: "Test warning note 1",
    note2: "Test warning note 2"
  }
};

const postData = JSON.stringify(testReport);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/reports',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer token_1_' + Date.now()
  }
};

console.log('🚀 Đang test API tạo báo cáo...');
console.log('📝 Dữ liệu test:', JSON.stringify(testReport, null, 2));

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Lỗi request: ${e.message}`);
});

req.write(postData);
req.end(); 