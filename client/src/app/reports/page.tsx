'use client';

import '@/styles/report.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { CreateServerMetricDto } from '@/types/server-metrics.type';

interface Server {
  id: number;
  server_name: string;
  ip: string;
}

interface CheckboxState {
  [key: string]: boolean;
}

interface NotesState {
  [key: string]: string;
}

export default function ReportForm() {
  const router = useRouter();
  const [today] = useState(new Date().toLocaleDateString('vi-VN'));
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [checkboxStates, setCheckboxStates] = useState<CheckboxState>({});
  const [notes, setNotes] = useState<NotesState>({});
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('node-exporter');
  
  // Thêm state cho loading từng bảng
  const [loadingSections, setLoadingSections] = useState({
    nodeExporter: false,
    patroni: false,
    transactions: false,
    heartbeat: false,
    alerts: false,
    apisix: false
  });

  useEffect(() => {
    // Scroll tới section tương ứng nếu có hash trong URL
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    // Đảm bảo token được lưu trong cookie
    const token = localStorage.getItem('token');
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
      console.log('🍪 Đã cập nhật token trong cookie từ trang reports');
    } else {
      console.error('❌ Không tìm thấy token trong localStorage');
      router.push('/login');
      return;
    }

    // Lấy danh sách servers từ API
    fetchServers();
  }, [router]);

  const fetchServers = async () => {
    try {
      console.log('🔄 Bắt đầu lấy danh sách servers từ API...');
      const response = await fetch('/api/servers');
      
      if (response.ok) {
        const serversData = await response.json();
        console.log('✅ Lấy danh sách servers thành công:', serversData);
        setServers(serversData);
      } else {
        console.error('❌ Lỗi khi lấy danh sách servers - Status:', response.status);
        console.error('❌ Response text:', await response.text());
        // Fallback - sử dụng data mặc định nếu không thể lấy từ API
        console.log('⚠️ Sử dụng dữ liệu fallback cho servers');
        setServers([
          { id: 1, server_name: 'Prod-gateway1', ip: '10.2.157.5' },
          { id: 2, server_name: 'Prod-gateway2', ip: '10.2.157.6' },
        ]);
      }
    } catch (error) {
      console.error('❌ Lỗi khi fetch servers:', error);
      console.error('❌ Chi tiết lỗi:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      // Fallback - sử dụng data mặc định nếu có lỗi
      console.log('⚠️ Sử dụng dữ liệu fallback cho servers do lỗi network');
      setServers([
        { id: 1, server_name: 'Prod-gateway1', ip: '10.2.157.5' },
        { id: 2, server_name: 'Prod-gateway2', ip: '10.2.157.6' },
      ]);
    } finally {
      setLoadingServers(false);
    }
  };

  const handleCheckboxChange = (key: string) => {
    const now = new Date().toLocaleString('vi-VN');
    
    setCheckboxStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Tự động điền thời gian vào ghi chú nếu checkbox được tích và ghi chú trống
    if (!checkboxStates[key] && !notes[key]?.trim()) {
      setNotes(prev => ({
        ...prev,
        [key]: now
      }));
    }
  };

  const handleNoteChange = (key: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Hàm gửi báo cáo cho từng section
  const handleSubmitSection = async (sectionName: string) => {
    // Đánh dấu section đang loading
    const sectionKey = sectionName === 'Node Exporter' ? 'nodeExporter' : 
                      sectionName === 'Patroni' ? 'patroni' : 
                      sectionName === 'Transactions' ? 'transactions' : 
                      sectionName === 'Heartbeat' ? 'heartbeat' : 
                      sectionName === 'Alerts' ? 'alerts' : 
                      sectionName === 'Apache APISIX' ? 'apisix' : 
                      sectionName.toLowerCase().replace(/\s+/g, '');
    
    setLoadingSections(prev => ({
      ...prev,
      [sectionKey]: true
    }));
    
    try {
      // Kiểm tra cookie token
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
      const token = tokenCookie ? tokenCookie.split('=')[1] : null;
      
      console.log('🔑 Cookie hiện tại:', document.cookie);
      console.log('🔑 Token từ cookie:', token);
      
      if (!token) {
        console.error('❌ Không tìm thấy token trong cookie');
        alert('Bạn cần đăng nhập lại để thực hiện chức năng này');
        router.push('/login');
        return;
      }

      // Xử lý riêng cho Node Exporter
      if (sectionName === 'Node Exporter') {
        // Lấy id_user từ localStorage
        let id_user = null;
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            id_user = userInfo.id;
          }
        } catch (e) {}
        
        if (!id_user) {
          alert('Không xác định được user. Vui lòng đăng nhập lại.');
          return;
        }

        // Tạo report chính trước
        const mainReport = {
          id_user,
          content: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            section: sectionName,
            timestamp: new Date().toISOString()
          })
        };

        console.log('🚀 Đang tạo báo cáo chính cho Node Exporter:', mainReport);

        const reportResponse = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mainReport),
        });

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json();
          throw new Error(errorData.message || 'Lỗi khi tạo báo cáo chính');
        }

        const reportResult = await reportResponse.json();
        console.log('✅ Tạo báo cáo chính thành công:', reportResult);

        // Chuẩn bị dữ liệu NEMSM từ checkbox states
        const nemsmData = servers.map(server => ({
          serverId: server.id,
          cpu: checkboxStates[`server_${server.id}_cpu`] || false,
          memory: checkboxStates[`server_${server.id}_memory`] || false,
          disk: checkboxStates[`server_${server.id}_disk`] || false,
          network: checkboxStates[`server_${server.id}_network`] || false,
          netstat: checkboxStates[`server_${server.id}_netstat`] || false,
          notes: notes[`server_${server.id}_note`] || ''
        }));

        // Gửi dữ liệu NEMSM
        const nemsmReportData = {
          reportId: reportResult.id,
          nemsmData: nemsmData
        };

        console.log('🚀 Đang gửi dữ liệu NEMSM:', nemsmReportData);

        const nemsmResponse = await fetch('/api/nemsm-reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nemsmReportData),
        });

        if (!nemsmResponse.ok) {
          const errorData = await nemsmResponse.json();
          throw new Error(errorData.message || 'Lỗi khi gửi dữ liệu NEMSM');
        }

        const nemsmResult = await nemsmResponse.json();
        console.log('✅ Gửi dữ liệu NEMSM thành công:', nemsmResult);
        alert(`Đã gửi báo cáo ${sectionName} và dữ liệu NEMSM thành công!`);
        
      } else if (sectionName === 'Apache APISIX') {
        // Xử lý riêng cho Apache APISIX
        // Lấy id_user từ localStorage
        let id_user = null;
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            id_user = userInfo.id;
          }
        } catch (e) {}
        
        if (!id_user) {
          alert('Không xác định được user. Vui lòng đăng nhập lại.');
          return;
        }

        // Tạo report chính trước
        const mainReport = {
          id_user,
          content: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            section: sectionName,
            timestamp: new Date().toISOString()
          })
        };

        console.log('🚀 Đang tạo báo cáo chính cho Apache APISIX:', mainReport);

        const reportResponse = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mainReport),
        });

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json();
          throw new Error(errorData.message || 'Lỗi khi tạo báo cáo chính');
        }

        const reportResult = await reportResponse.json();
        console.log('✅ Tạo báo cáo chính thành công:', reportResult);

        // Chuẩn bị dữ liệu Apache APISIX từ notes
        const apisixData = {
          note_request: notes['apisix_request_latency_note'] || '',
          note_upstream: notes['apisix_upstream_latency_note'] || ''
        };

        // Chỉ gửi dữ liệu Apache APISIX nếu có ít nhất một note
        const hasApisixData = apisixData.note_request.trim() || apisixData.note_upstream.trim();

        if (hasApisixData) {
          const apisixReportData = {
            reportId: reportResult.id,
            apisixData: apisixData
          };

          console.log('🚀 Đang gửi dữ liệu Apache APISIX:', apisixReportData);

          const apisixResponse = await fetch('/api/apisix-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apisixReportData),
          });

          if (!apisixResponse.ok) {
            const errorData = await apisixResponse.json();
            throw new Error(errorData.message || 'Lỗi khi gửi dữ liệu Apache APISIX');
          }

          const apisixResult = await apisixResponse.json();
          console.log('✅ Gửi dữ liệu Apache APISIX thành công:', apisixResult);
          alert(`Đã gửi báo cáo ${sectionName} và dữ liệu Apache APISIX thành công!`);
        } else {
          console.log('ℹ️ Chỉ tạo báo cáo chính cho Apache APISIX (không có ghi chú)');
          alert(`Đã gửi báo cáo ${sectionName} thành công!`);
        }
        
      } else if (sectionName === 'Patroni') {
        // Xử lý riêng cho PostgreSQL Patroni
        // Lấy id_user từ localStorage
        let id_user = null;
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            id_user = userInfo.id;
          }
        } catch (e) {}
        
        if (!id_user) {
          alert('Không xác định được user. Vui lòng đăng nhập lại.');
          return;
        }

        // Tạo report chính trước
        const mainReport = {
          id_user,
          content: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            section: sectionName,
            timestamp: new Date().toISOString()
          })
        };

        console.log('🚀 Đang tạo báo cáo chính cho PostgreSQL Patroni:', mainReport);

        const reportResponse = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mainReport),
        });

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json();
          throw new Error(errorData.message || 'Lỗi khi tạo báo cáo chính');
        }

        const reportResult = await reportResponse.json();
        console.log('✅ Tạo báo cáo chính thành công:', reportResult);

        // Chuẩn bị dữ liệu PostgreSQL Patroni từ checkbox states (16 hàng)
        const patroniData = Array.from({ length: 16 }, (_, index) => ({
          rowIndex: index + 1,
          primary_node: checkboxStates[`patroni_${index}_primary`] || false,
          wal_replay_paused: checkboxStates[`patroni_${index}_wal_replay`] || false,
          replicas_received_wal: checkboxStates[`patroni_${index}_replicas_received`] || false,
          primary_wal_location: checkboxStates[`patroni_${index}_primary_wal`] || false,
          replicas_replayed_wal: checkboxStates[`patroni_${index}_replicas_replayed`] || false,
          notes: notes[`patroni_${index}_note`] || ''
        }));

        // Chỉ gửi dữ liệu PostgreSQL Patroni nếu có ít nhất một hàng có dữ liệu
        const hasPatroniData = patroniData.some(row => 
          row.primary_node || row.wal_replay_paused || row.replicas_received_wal || 
          row.primary_wal_location || row.replicas_replayed_wal || row.notes.trim()
        );

        if (hasPatroniData) {
          const patroniReportData = {
            reportId: reportResult.id,
            patroniData: patroniData
          };

          console.log('🚀 Đang gửi dữ liệu PostgreSQL Patroni:', patroniReportData);

          const patroniResponse = await fetch('/api/patroni-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(patroniReportData),
          });

          if (!patroniResponse.ok) {
            const errorData = await patroniResponse.json();
            throw new Error(errorData.message || 'Lỗi khi gửi dữ liệu PostgreSQL Patroni');
          }

          const patroniResult = await patroniResponse.json();
          console.log('✅ Gửi dữ liệu PostgreSQL Patroni thành công:', patroniResult);
          alert(`Đã gửi báo cáo ${sectionName} và dữ liệu PostgreSQL Patroni thành công!`);
        } else {
          console.log('ℹ️ Chỉ tạo báo cáo chính cho PostgreSQL Patroni (không có dữ liệu checkbox)');
          alert(`Đã gửi báo cáo ${sectionName} thành công!`);
        }
        
      } else if (sectionName === 'Transactions') {
        // Xử lý riêng cho Database Transactions
        // Lấy id_user từ localStorage
        let id_user = null;
        try {
          const userInfoStr = localStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            id_user = userInfo.id;
          }
        } catch (e) {}
        
        if (!id_user) {
          alert('Không xác định được user. Vui lòng đăng nhập lại.');
          return;
        }

        // Tạo report chính trước
        const mainReport = {
          id_user,
          content: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            section: sectionName,
            timestamp: new Date().toISOString()
          })
        };

        console.log('🚀 Đang tạo báo cáo chính cho Database Transactions:', mainReport);

        const reportResponse = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mainReport),
        });

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json();
          throw new Error(errorData.message || 'Lỗi khi tạo báo cáo chính');
        }

        const reportResult = await reportResponse.json();
        console.log('✅ Tạo báo cáo chính thành công:', reportResult);

        // Chuẩn bị dữ liệu Database Transactions từ checkbox states (16 hàng)
        const transactionData = Array.from({ length: 16 }, (_, index) => ({
          rowIndex: index + 1,
          transaction_monitored: checkboxStates[`transaction_${index}_monitored`] || false,
          notes: notes[`transaction_${index}_note`] || ''
        }));

        // Chỉ gửi dữ liệu Database Transactions nếu có ít nhất một hàng có dữ liệu
        const hasTransactionData = transactionData.some(row => 
          row.transaction_monitored || row.notes.trim()
        );

        if (hasTransactionData) {
          const transactionReportData = {
            reportId: reportResult.id,
            transactionData: transactionData
          };

          console.log('🚀 Đang gửi dữ liệu Database Transactions:', transactionReportData);

          const transactionResponse = await fetch('/api/transaction-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionReportData),
          });

          if (!transactionResponse.ok) {
            const errorData = await transactionResponse.json();
            throw new Error(errorData.message || 'Lỗi khi gửi dữ liệu Database Transactions');
          }

          const transactionResult = await transactionResponse.json();
          console.log('✅ Gửi dữ liệu Database Transactions thành công:', transactionResult);
          alert(`Đã gửi báo cáo ${sectionName} và dữ liệu Database Transactions thành công!`);
        } else {
          console.log('ℹ️ Chỉ tạo báo cáo chính cho Database Transactions (không có dữ liệu checkbox)');
          alert(`Đã gửi báo cáo ${sectionName} thành công!`);
        }
        
      } else {
        // Xử lý cho các section khác (logic cũ)
        const report = {
          content: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            section: sectionName,
            checkboxStates,
            notes
          })
        };
        
        console.log('🚀 Đang gửi báo cáo section với dữ liệu:', report);
        
        try {
          console.log('🔄 Kiểm tra kết nối đến API endpoint');
          const testResponse = await fetch('/api/reports', { 
            method: 'HEAD',
            headers: { 'Content-Type': 'application/json' }
          });
          console.log('📡 API endpoint phản hồi với status:', testResponse.status);
        } catch (testError) {
          console.error('❌ Không thể kết nối đến API endpoint:', testError);
        }
        
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
        
        console.log('📥 Nhận phản hồi từ API với status:', response.status);
        
        if (response.status === 500) {
          const errorText = await response.text();
          console.error('❌ Lỗi server 500:', errorText);
          throw new Error(`Lỗi server: ${response.status} - ${errorText}`);
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Lỗi từ API:', errorData);
          throw new Error(errorData.message || `Lỗi khi gửi báo cáo cho ${sectionName}`);
        }
        
        const result = await response.json();
        console.log('✅ Gửi báo cáo section thành công:', result);
        alert(`Đã gửi báo cáo ${sectionName} thành công!`);
      }
    } catch (error) {
      console.error(`❌ Lỗi khi gửi báo cáo cho ${sectionName}:`, error);
      console.error('❌ Chi tiết lỗi:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Có lỗi xảy ra khi gửi báo cáo ${sectionName}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      // Bỏ trạng thái loading
      setLoadingSections(prev => ({
        ...prev,
        [sectionKey]: false
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Lấy id_user từ localStorage
      let id_user = null;
      try {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          id_user = userInfo.id;
        }
      } catch (e) {}
      if (!id_user) {
        alert('Không xác định được user. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }
      
      // Tạo đối tượng báo cáo chính với đầy đủ nội dung
      const report = {
        id_user,
        content: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          checkboxStates,
          notes,
          sections: ['Node Exporter', 'Patroni', 'Transactions', 'Heartbeat', 'Alerts', 'Apache APISIX']
        })
      };
      
      console.log('🚀 Đang gửi báo cáo chính với dữ liệu:', report);
      
      try {
        console.log('🔄 Kiểm tra kết nối đến API endpoint');
        const testResponse = await fetch('/api/reports', { 
          method: 'HEAD',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('📡 API endpoint phản hồi với status:', testResponse.status);
      } catch (testError) {
        console.error('❌ Không thể kết nối đến API endpoint:', testError);
      }
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
      
      console.log('📥 Nhận phản hồi từ API với status:', response.status);
      
      if (response.status === 500) {
        const errorText = await response.text();
        console.error('❌ Lỗi server 500:', errorText);
        throw new Error(`Lỗi server: ${response.status} - ${errorText}`);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Lỗi từ API:', errorData);
        throw new Error(errorData.message || 'Lỗi khi gửi báo cáo');
      }
      
      const result = await response.json();
      console.log('✅ Gửi báo cáo chính thành công:', result);

      // Sau khi tạo báo cáo chính thành công, tự động tạo dữ liệu NEMSM
      try {
        console.log('🔄 Bắt đầu tạo dữ liệu NEMSM với Report ID:', result.id);
        
        // Chuẩn bị dữ liệu NEMSM từ checkbox states
        const nemsmData = servers.map(server => ({
          serverId: server.id,
          cpu: checkboxStates[`server_${server.id}_cpu`] || false,
          memory: checkboxStates[`server_${server.id}_memory`] || false,
          disk: checkboxStates[`server_${server.id}_disk`] || false,
          network: checkboxStates[`server_${server.id}_network`] || false,
          netstat: checkboxStates[`server_${server.id}_netstat`] || false,
          notes: notes[`server_${server.id}_note`] || ''
        }));

        // Chỉ gửi dữ liệu NEMSM nếu có ít nhất một server có dữ liệu
        const hasNemsmData = nemsmData.some(server => 
          server.cpu || server.memory || server.disk || server.network || server.netstat || server.notes.trim()
        );

        if (hasNemsmData) {
          const nemsmReportData = {
            reportId: result.id,
            nemsmData: nemsmData
          };

          console.log('🚀 Đang gửi dữ liệu NEMSM:', nemsmReportData);

          const nemsmResponse = await fetch('/api/nemsm-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(nemsmReportData),
          });

          if (!nemsmResponse.ok) {
            const nemsmErrorData = await nemsmResponse.json();
            console.error('⚠️ Không thể lưu dữ liệu NEMSM:', nemsmErrorData);
            // Không throw error ở đây để không làm fail toàn bộ quá trình
            alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu NEMSM: ' + nemsmErrorData.error);
          } else {
            const nemsmResult = await nemsmResponse.json();
            console.log('✅ Gửi dữ liệu NEMSM thành công:', nemsmResult);
          }
        } else {
          console.log('ℹ️ Không có dữ liệu NEMSM nào để gửi');
        }
      } catch (nemsmError) {
        console.error('❌ Lỗi khi gửi dữ liệu NEMSM:', nemsmError);
        // Không throw error ở đây để không làm fail toàn bộ quá trình
        alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu NEMSM: ' + (nemsmError instanceof Error ? nemsmError.message : 'Lỗi không xác định'));
      }

      // Sau khi xử lý NEMSM, tự động tạo dữ liệu Apache APISIX
      try {
        console.log('🔄 Bắt đầu tạo dữ liệu Apache APISIX với Report ID:', result.id);
        
        // Chuẩn bị dữ liệu Apache APISIX từ notes
        const apisixData = {
          note_request: notes['apisix_request_latency_note'] || '',
          note_upstream: notes['apisix_upstream_latency_note'] || ''
        };

        // Chỉ gửi dữ liệu Apache APISIX nếu có ít nhất một note
        const hasApisixData = apisixData.note_request.trim() || apisixData.note_upstream.trim();

        if (hasApisixData) {
          const apisixReportData = {
            reportId: result.id,
            apisixData: apisixData
          };

          console.log('🚀 Đang gửi dữ liệu Apache APISIX:', apisixReportData);

          const apisixResponse = await fetch('/api/apisix-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apisixReportData),
          });

          if (!apisixResponse.ok) {
            const apisixErrorData = await apisixResponse.json();
            console.error('⚠️ Không thể lưu dữ liệu Apache APISIX:', apisixErrorData);
            // Không throw error ở đây để không làm fail toàn bộ quá trình
            alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu Apache APISIX: ' + apisixErrorData.error);
          } else {
            const apisixResult = await apisixResponse.json();
            console.log('✅ Gửi dữ liệu Apache APISIX thành công:', apisixResult);
          }
        } else {
          console.log('ℹ️ Không có dữ liệu Apache APISIX nào để gửi');
        }
      } catch (apisixError) {
        console.error('❌ Lỗi khi gửi dữ liệu Apache APISIX:', apisixError);
        // Không throw error ở đây để không làm fail toàn bộ quá trình
        alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu Apache APISIX: ' + (apisixError instanceof Error ? apisixError.message : 'Lỗi không xác định'));
      }

      // Sau khi xử lý Apache APISIX, tự động tạo dữ liệu PostgreSQL Patroni
      try {
        console.log('🔄 Bắt đầu tạo dữ liệu PostgreSQL Patroni với Report ID:', result.id);
        
        // Chuẩn bị dữ liệu PostgreSQL Patroni từ checkbox states (16 hàng)
        const patroniData = Array.from({ length: 16 }, (_, index) => ({
          rowIndex: index + 1,
          primary_node: checkboxStates[`patroni_${index}_primary`] || false,
          wal_replay_paused: checkboxStates[`patroni_${index}_wal_replay`] || false,
          replicas_received_wal: checkboxStates[`patroni_${index}_replicas_received`] || false,
          primary_wal_location: checkboxStates[`patroni_${index}_primary_wal`] || false,
          replicas_replayed_wal: checkboxStates[`patroni_${index}_replicas_replayed`] || false,
          notes: notes[`patroni_${index}_note`] || ''
        }));

        // Chỉ gửi dữ liệu PostgreSQL Patroni nếu có ít nhất một hàng có dữ liệu
        const hasPatroniData = patroniData.some(row => 
          row.primary_node || row.wal_replay_paused || row.replicas_received_wal || 
          row.primary_wal_location || row.replicas_replayed_wal || row.notes.trim()
        );

        if (hasPatroniData) {
          const patroniReportData = {
            reportId: result.id,
            patroniData: patroniData
          };

          console.log('🚀 Đang gửi dữ liệu PostgreSQL Patroni:', patroniReportData);

          const patroniResponse = await fetch('/api/patroni-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(patroniReportData),
          });

          if (!patroniResponse.ok) {
            const patroniErrorData = await patroniResponse.json();
            console.error('⚠️ Không thể lưu dữ liệu PostgreSQL Patroni:', patroniErrorData);
            // Không throw error ở đây để không làm fail toàn bộ quá trình
            alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu PostgreSQL Patroni: ' + patroniErrorData.error);
          } else {
            const patroniResult = await patroniResponse.json();
            console.log('✅ Gửi dữ liệu PostgreSQL Patroni thành công:', patroniResult);
          }
        } else {
          console.log('ℹ️ Không có dữ liệu PostgreSQL Patroni nào để gửi');
        }
      } catch (patroniError) {
        console.error('❌ Lỗi khi gửi dữ liệu PostgreSQL Patroni:', patroniError);
        // Không throw error ở đây để không làm fail toàn bộ quá trình
        alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu PostgreSQL Patroni: ' + (patroniError instanceof Error ? patroniError.message : 'Lỗi không xác định'));
      }

      // Sau khi xử lý PostgreSQL Patroni, tự động tạo dữ liệu Database Transactions
      try {
        console.log('🔄 Bắt đầu tạo dữ liệu Database Transactions với Report ID:', result.id);
        
        // Chuẩn bị dữ liệu Database Transactions từ checkbox states (16 hàng)
        const transactionData = Array.from({ length: 16 }, (_, index) => ({
          rowIndex: index + 1,
          transaction_monitored: checkboxStates[`transaction_${index}_monitored`] || false,
          notes: notes[`transaction_${index}_note`] || ''
        }));

        // Chỉ gửi dữ liệu Database Transactions nếu có ít nhất một hàng có dữ liệu
        const hasTransactionData = transactionData.some(row => 
          row.transaction_monitored || row.notes.trim()
        );

        if (hasTransactionData) {
          const transactionReportData = {
            reportId: result.id,
            transactionData: transactionData
          };

          console.log('🚀 Đang gửi dữ liệu Database Transactions:', transactionReportData);

          const transactionResponse = await fetch('/api/transaction-reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionReportData),
          });

          if (!transactionResponse.ok) {
            const transactionErrorData = await transactionResponse.json();
            console.error('⚠️ Không thể lưu dữ liệu Database Transactions:', transactionErrorData);
            // Không throw error ở đây để không làm fail toàn bộ quá trình
            alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu Database Transactions: ' + transactionErrorData.error);
          } else {
            const transactionResult = await transactionResponse.json();
            console.log('✅ Gửi dữ liệu Database Transactions thành công:', transactionResult);
          }
        } else {
          console.log('ℹ️ Không có dữ liệu Database Transactions nào để gửi');
        }
      } catch (transactionError) {
        console.error('❌ Lỗi khi gửi dữ liệu Database Transactions:', transactionError);
        // Không throw error ở đây để không làm fail toàn bộ quá trình
        alert('Báo cáo chính đã được lưu thành công, nhưng có lỗi khi lưu dữ liệu Database Transactions: ' + (transactionError instanceof Error ? transactionError.message : 'Lỗi không xác định'));
      }

      alert('Gửi báo cáo thành công!');
      router.push('/reports/history');
    } catch (error) {
      console.error('❌ Lỗi khi gửi báo cáo:', error);
      console.error('❌ Chi tiết lỗi:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Có lỗi xảy ra khi gửi báo cáo: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setLoading(false);
    }
  };

  // Thêm các hàm xử lý chọn tất cả
  const handleSelectAllNodeExporter = (checked: boolean) => {
    const newStates = { ...checkboxStates };
    servers.forEach(server => {
      newStates[`server_${server.id}_cpu`] = checked;
      newStates[`server_${server.id}_memory`] = checked;
      newStates[`server_${server.id}_disk`] = checked;
      newStates[`server_${server.id}_network`] = checked;
      newStates[`server_${server.id}_netstat`] = checked;
    });
    setCheckboxStates(newStates);
  };

  const handleSelectAllPatroni = (checked: boolean) => {
    const newStates = { ...checkboxStates };
    Array.from({ length: 16 }).forEach((_, index) => {
      newStates[`patroni_${index}_primary`] = checked;
      newStates[`patroni_${index}_wal_replay`] = checked;
      newStates[`patroni_${index}_replicas_received`] = checked;
      newStates[`patroni_${index}_primary_wal`] = checked;
      newStates[`patroni_${index}_replicas_replayed`] = checked;
    });
    setCheckboxStates(newStates);
  };

  const handleSelectAllTransactions = (checked: boolean) => {
    const newStates = { ...checkboxStates };
    Array.from({ length: 16 }).forEach((_, index) => {
      newStates[`transaction_${index}_monitored`] = checked;
    });
    setCheckboxStates(newStates);
  };

  const handleSelectAllHeartbeat = (checked: boolean) => {
    const newStates = { ...checkboxStates };
    Array.from({ length: 4 }).forEach((_, index) => {
      newStates[`heartbeat_${index}_86`] = checked;
      newStates[`heartbeat_${index}_87`] = checked;
      newStates[`heartbeat_${index}_88`] = checked;
    });
    setCheckboxStates(newStates);
  };

  // Thêm hàm xử lý chọn tất cả cho một hàng Patroni
  const handleSelectPatroniRow = (index: number, checked: boolean) => {
    const newStates = { ...checkboxStates };
    newStates[`patroni_${index}_primary`] = checked;
    newStates[`patroni_${index}_wal_replay`] = checked;
    newStates[`patroni_${index}_replicas_received`] = checked;
    newStates[`patroni_${index}_primary_wal`] = checked;
    newStates[`patroni_${index}_replicas_replayed`] = checked;
    setCheckboxStates(newStates);
  };

  // Kiểm tra trạng thái của một hàng Patroni
  const isPatroniRowSelected = (index: number) => {
    return (
      checkboxStates[`patroni_${index}_primary`] &&
      checkboxStates[`patroni_${index}_wal_replay`] &&
      checkboxStates[`patroni_${index}_replicas_received`] &&
      checkboxStates[`patroni_${index}_primary_wal`] &&
      checkboxStates[`patroni_${index}_replicas_replayed`]
    );
  };

  const sections = [
    { id: 'apisix', title: 'Apache APISIX', icon: 'router' },
    { id: 'node-exporter', title: 'Node Exporter', icon: 'hdd-network' },
    { id: 'patroni', title: 'PostgreSQL Patroni', icon: 'database-check' },
    { id: 'transactions', title: 'Database Transactions', icon: 'arrow-left-right' },
    { id: 'heartbeat', title: 'PostgreHeartbeat', icon: 'heart-pulse' },
    { id: 'alerts', title: 'Cảnh báo', icon: 'exclamation-triangle' }
  ];

  return (
    <div className="min-vh-100 telsoft-gradient-static">
      <Navbar />
      
      <div className="container py-4">
        {/* Header */}
        <div className="card shadow-sm mb-4 report-header">
          <div className="card-body">
            <h1 className="display-6 mb-3">
              📝 Báo cáo ca trực ngày {today}
            </h1>
            <p className="text-muted">
              Vui lòng điền đầy đủ thông tin báo cáo cho ca trực của bạn
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* Navigation Sidebar */}
          <div className="col-md-2 position-fixed start-0" style={{ width: '280px' }}>
            <div className="card shadow-sm sidebar-nav">
              <div className="card-body p-3">
                <nav className="nav flex-column nav-pills">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`nav-link text-start mb-2 ${
                        activeSection === section.id ? 'active' : ''
                      }`}
                    >
                      <i className={`bi bi-${section.icon} me-2`}></i>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="col-md-10 mx-auto" style={{ marginLeft: '250px', marginRight: '250px' }}>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
              {/* Apache APISIX Section */}
              <div id="apisix" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-router me-2"></i>
                      Apache APISIX
                    </h2>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => handleSelectAllNodeExporter((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                      >
                        {Object.entries(checkboxStates).some(([key, value]) => 
                          key.startsWith('server_') && value
                        ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleSubmitSection('Apache APISIX')}
                        disabled={loadingSections.apisix}
                      >
                        {loadingSections.apisix ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Gửi (Test)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col">Panel</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-center">1</td>
                          <td>Request Latency</td>
                          <td>
                            <textarea
                              rows={1}
                              value={notes['apisix_request_latency_note'] || ''}
                              onChange={(e) => handleNoteChange('apisix_request_latency_note', e.target.value)}
                              placeholder="Ghi chú Request Latency..."
                              className="form-control form-control-sm"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">2</td>
                          <td>Upstream Latency</td>
                          <td>
                            <textarea
                              rows={1}
                              value={notes['apisix_upstream_latency_note'] || ''}
                              onChange={(e) => handleNoteChange('apisix_upstream_latency_note', e.target.value)}
                              placeholder="Ghi chú Upstream Latency..."
                              className="form-control form-control-sm"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Node Exporter Section */}
              <div id="node-exporter" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-hdd-network me-2"></i>
                      Node Exporter Multiple Server Metrics
                    </h2>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => handleSelectAllNodeExporter((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                      >
                        {Object.entries(checkboxStates).some(([key, value]) => 
                          key.startsWith('server_') && value
                        ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleSubmitSection('Node Exporter')}
                        disabled={loadingSections.nodeExporter}
                      >
                        {loadingSections.nodeExporter ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Gửi (Test)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col">Server Name</th>
                          <th scope="col">IP</th>
                          <th scope="col" className="text-center">CPU</th>
                          <th scope="col" className="text-center">Memory</th>
                          <th scope="col" className="text-center">Disk</th>
                          <th scope="col" className="text-center">Network</th>
                          <th scope="col" className="text-center">Netstat</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingServers ? (
                          <tr>
                            <td colSpan={9} className="text-center py-4">
                              <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border text-primary me-2"></div>
                                <span>Đang tải danh sách servers...</span>
                              </div>
                            </td>
                          </tr>
                        ) : servers.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-4 text-muted">
                              Không có server nào trong hệ thống
                            </td>
                          </tr>
                        ) : (
                          servers.map((server, index) => (
                            <tr key={server.id}>
                              <td className="text-center">{index + 1}</td>
                              <td className="fw-medium">{server.server_name}</td>
                              <td className="text-muted">{server.ip}</td>
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    checked={checkboxStates[`server_${server.id}_cpu`] || false}
                                    onChange={() => handleCheckboxChange(`server_${server.id}_cpu`)}
                                    className="form-check-input"
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    checked={checkboxStates[`server_${server.id}_memory`] || false}
                                    onChange={() => handleCheckboxChange(`server_${server.id}_memory`)}
                                    className="form-check-input"
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    checked={checkboxStates[`server_${server.id}_disk`] || false}
                                    onChange={() => handleCheckboxChange(`server_${server.id}_disk`)}
                                    className="form-check-input"
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    checked={checkboxStates[`server_${server.id}_network`] || false}
                                    onChange={() => handleCheckboxChange(`server_${server.id}_network`)}
                                    className="form-check-input"
                                  />
                                </div>
                              </td>
                              <td className="text-center">
                                <div className="form-check d-flex justify-content-center">
                                  <input
                                    type="checkbox"
                                    checked={checkboxStates[`server_${server.id}_netstat`] || false}
                                    onChange={() => handleCheckboxChange(`server_${server.id}_netstat`)}
                                    className="form-check-input"
                                  />
                                </div>
                              </td>
                              <td>
                                <textarea
                                  rows={1}
                                  value={notes[`server_${server.id}_note`] || ''}
                                  onChange={(e) => handleNoteChange(`server_${server.id}_note`, e.target.value)}
                                  placeholder="Ghi chú..."
                                  className="form-control form-control-sm"
                                />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Patroni Section */}
              <div id="patroni" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-database-check me-2"></i>
                      PostgreSQL Patroni
                    </h2>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => handleSelectAllPatroni((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                      >
                        {Object.entries(checkboxStates).some(([key, value]) => 
                          key.startsWith('patroni_') && value
                        ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleSubmitSection('Patroni')}
                        disabled={loadingSections.patroni}
                      >
                        {loadingSections.patroni ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Gửi (Test)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col" className="text-center">Chọn hàng</th>
                          <th scope="col" className="text-center">Primary Node</th>
                          <th scope="col" className="text-center">WAL Replay Paused</th>
                          <th scope="col" className="text-center">Replicas Received WAL</th>
                          <th scope="col" className="text-center">Primary WAL Location</th>
                          <th scope="col" className="text-center">Replicas Replayed WAL</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 16 }, (_, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => handleSelectPatroniRow(index, !isPatroniRowSelected(index))}
                              >
                                {isPatroniRowSelected(index) ? 'Bỏ chọn' : 'Chọn'}
                              </button>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`patroni_${index}_primary`] || false}
                                  onChange={() => handleCheckboxChange(`patroni_${index}_primary`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`patroni_${index}_wal_replay`] || false}
                                  onChange={() => handleCheckboxChange(`patroni_${index}_wal_replay`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`patroni_${index}_replicas_received`] || false}
                                  onChange={() => handleCheckboxChange(`patroni_${index}_replicas_received`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`patroni_${index}_primary_wal`] || false}
                                  onChange={() => handleCheckboxChange(`patroni_${index}_primary_wal`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`patroni_${index}_replicas_replayed`] || false}
                                  onChange={() => handleCheckboxChange(`patroni_${index}_replicas_replayed`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td>
                              <textarea
                                rows={1}
                                value={notes[`patroni_${index}_note`] || ''}
                                onChange={(e) => handleNoteChange(`patroni_${index}_note`, e.target.value)}
                                placeholder="Ghi chú..."
                                className="form-control form-control-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Transactions Section */}
              <div id="transactions" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-arrow-left-right me-2"></i>
                      Database Transactions
                    </h2>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => handleSelectAllTransactions((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                      >
                        {Object.entries(checkboxStates).some(([key, value]) => 
                          key.startsWith('transaction_') && value
                        ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleSubmitSection('Transactions')}
                        disabled={loadingSections.transactions}
                      >
                        {loadingSections.transactions ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Gửi (Test)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col" className="text-center">Transactions Giám sát</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 16 }, (_, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`transaction_${index}_monitored`] || false}
                                  onChange={() => handleCheckboxChange(`transaction_${index}_monitored`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td>
                              <textarea
                                rows={1}
                                value={notes[`transaction_${index}_note`] || ''}
                                onChange={(e) => handleNoteChange(`transaction_${index}_note`, e.target.value)}
                                placeholder="Ghi chú..."
                                className="form-control form-control-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Heartbeat Section */}
              <div id="heartbeat" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-heart-pulse me-2"></i>
                      PostgreHeartbeat
                    </h2>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => handleSelectAllHeartbeat((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                      >
                        {Object.entries(checkboxStates).some(([key, value]) => 
                          key.startsWith('heartbeat_') && value
                        ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleSubmitSection('Heartbeat')}
                        disabled={loadingSections.heartbeat}
                      >
                        {loadingSections.heartbeat ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Gửi (Test)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col" className="text-center">Heartbeat 10.2.45.86</th>
                          <th scope="col" className="text-center">Heartbeat 10.2.45.87</th>
                          <th scope="col" className="text-center">Heartbeat 10.2.45.88</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 4 }, (_, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`heartbeat_${index}_86`] || false}
                                  onChange={() => handleCheckboxChange(`heartbeat_${index}_86`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`heartbeat_${index}_87`] || false}
                                  onChange={() => handleCheckboxChange(`heartbeat_${index}_87`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check d-flex justify-content-center">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates[`heartbeat_${index}_88`] || false}
                                  onChange={() => handleCheckboxChange(`heartbeat_${index}_88`)}
                                  className="form-check-input"
                                />
                              </div>
                            </td>
                            <td>
                              <textarea
                                rows={1}
                                value={notes[`heartbeat_${index}_note`] || ''}
                                onChange={(e) => handleNoteChange(`heartbeat_${index}_note`, e.target.value)}
                                placeholder="Ghi chú..."
                                className="form-control form-control-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Alerts Section */}
              <div id="alerts" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Cảnh báo
                    </h2>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleSubmitSection('Alerts')}
                      disabled={loadingSections.alerts}
                    >
                      {loadingSections.alerts ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Gửi (Test)
                        </>
                      )}
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="text-center">STT</th>
                          <th scope="col">Cảnh báo</th>
                          <th scope="col">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-center">1</td>
                          <td>
                            <div className="d-flex gap-4">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_warning'] || false}
                                  onChange={() => handleCheckboxChange('alert_warning')}
                                  className="form-check-input"
                                  id="alert_warning"
                                />
                                <label className="form-check-label" htmlFor="alert_warning">
                                  Warning
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_critical'] || false}
                                  onChange={() => handleCheckboxChange('alert_critical')}
                                  className="form-check-input"
                                  id="alert_critical"
                                />
                                <label className="form-check-label" htmlFor="alert_critical">
                                  Critical
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_info'] || false}
                                  onChange={() => handleCheckboxChange('alert_info')}
                                  className="form-check-input"
                                  id="alert_info"
                                />
                                <label className="form-check-label" htmlFor="alert_info">
                                  Info
                                </label>
                              </div>
                            </div>
                          </td>
                          <td>
                            <textarea
                              rows={1}
                              value={notes['alert_note_1'] || ''}
                              onChange={(e) => handleNoteChange('alert_note_1', e.target.value)}
                              placeholder="Ghi chú..."
                              className="form-control form-control-sm"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">2</td>
                          <td>
                            <div className="d-flex gap-4">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_info_backup'] || false}
                                  onChange={() => handleCheckboxChange('alert_info_backup')}
                                  className="form-check-input"
                                  id="alert_info_backup"
                                />
                                <label className="form-check-label" htmlFor="alert_info_backup">
                                  Info backup
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_warning_disk'] || false}
                                  onChange={() => handleCheckboxChange('alert_warning_disk')}
                                  className="form-check-input"
                                  id="alert_warning_disk"
                                />
                                <label className="form-check-label" htmlFor="alert_warning_disk">
                                  Warning Disk
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  checked={checkboxStates['alert_other'] || false}
                                  onChange={() => handleCheckboxChange('alert_other')}
                                  className="form-check-input"
                                  id="alert_other"
                                />
                                <label className="form-check-label" htmlFor="alert_other">
                                  Other
                                </label>
                              </div>
                            </div>
                          </td>
                          <td>
                            <textarea
                              rows={1}
                              value={notes['alert_note_2'] || ''}
                              onChange={(e) => handleNoteChange('alert_note_2', e.target.value)}
                              placeholder="Ghi chú..."
                              className="form-control form-control-sm"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Sidebar */}
          <div className="col-md-2 position-fixed end-0" style={{ width: '280px' }}>
            <div className="card shadow-sm sidebar-nav">
              <div className="card-body p-3">
                {/* Action Buttons */}
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="btn btn-secondary btn-sm w-100"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-sm w-100"
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Gửi báo cáo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 