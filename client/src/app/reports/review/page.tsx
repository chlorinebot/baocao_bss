'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './review.css';

interface UserInfo {
  id: number;
  username: string;
  full_name: string;
  firstName: string;  // Thay đổi từ first_name
  lastName: string;   // Thay đổi từ last_name
}

interface UserShift {
  schedule_id: number;
  start_time: string;
  end_time: string;
  date: string;
  shift_name: string;
}

interface ApisixData {
  note_request?: string;
  note_upstream?: string;
}

interface ServerData {
  id: number;
  cpu: boolean;
  memory: boolean;
  disk_space_used: boolean;
  network_traffic: boolean;
  netstat: boolean;
  notes?: string;
  server: {
    id: number;
    server_name: string;
    ip: string;
  };
}

interface PatroniData {
  id: number;
  row_index: number;
  primary_node: boolean;
  wal_replay_paused: boolean;
  replicas_received_wal: boolean;
  primary_wal_location: boolean;
  replicas_replayed_wal: boolean;
  notes?: string;
}

interface TransactionData {
  id: number;
  row_index: number;
  transaction_monitored: boolean;
  notes?: string;
}

interface HeartbeatData {
  id: number;
  row_index: number;
  heartbeat_86: boolean;
  heartbeat_87: boolean;
  heartbeat_88: boolean;
  notes?: string;
}

interface AlertData {
  note_alert_1?: string;
  note_alert_2?: string;
}

export default function ReportReview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userShift, setUserShift] = useState<UserShift | null>(null);
  const [apisixData, setApisixData] = useState<ApisixData>({});
  const [serversData, setServersData] = useState<ServerData[]>([]);
  const [patroniData, setPatroniData] = useState<PatroniData[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [heartbeatData, setHeartbeatData] = useState<HeartbeatData[]>([]);
  const [alertData, setAlertData] = useState<AlertData>({});
  const [reportDate, setReportDate] = useState<string>('');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      // Lấy thông tin user từ localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      console.log('🔍 Raw userInfo from localStorage:', userInfoStr);
      
      if (!userInfoStr) {
        router.push('/login');
        return;
      }

      const userData = JSON.parse(userInfoStr);
      console.log('🔍 Parsed userData:', userData);
      console.log('🔍 User Details:', {
        username: userData.username,
        full_name: userData.full_name,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      setUserInfo(userData);

      // Lấy thông tin ca trực
      await fetchUserShift(userData.id);
      
      // Lấy report ID từ sessionStorage (được set khi tạo báo cáo thành công)
      const latestReportId = sessionStorage.getItem('latestReportId');
      console.log('📋 Latest Report ID from sessionStorage:', latestReportId);
      
      if (latestReportId) {
        await fetchReportDetails(parseInt(latestReportId));
      } else {
        console.warn('⚠️ Không tìm thấy reportId trong sessionStorage');
      }

      // Set ngày hiện tại
      setReportDate(new Date().toLocaleDateString('vi-VN'));
      
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShift = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/work-schedule/user/${userId}/current-shift`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserShift(data.data);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin ca trực:', error);
    }
  };

  const convertStringToBoolean = (value: string) => {
    return value === 'true';
  };

  const processServerData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      cpu: convertStringToBoolean(item.cpu),
      memory: convertStringToBoolean(item.memory),
      disk_space_used: convertStringToBoolean(item.disk_space_used),
      network_traffic: convertStringToBoolean(item.network_traffic),
      netstat: convertStringToBoolean(item.netstat)
    }));
  };

  const processPatroniData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      primary_node: convertStringToBoolean(item.primary_node),
      wal_replay_paused: convertStringToBoolean(item.wal_replay_paused),
      replicas_received_wal: convertStringToBoolean(item.replicas_received_wal),
      primary_wal_location: convertStringToBoolean(item.primary_wal_location),
      replicas_replayed_wal: convertStringToBoolean(item.replicas_replayed_wal)
    }));
  };

  const processTransactionData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      transaction_monitored: convertStringToBoolean(item.transaction_monitored)
    }));
  };

  const processHeartbeatData = (data: any[]) => {
    return data.map(item => ({
      ...item,
      heartbeat_86: convertStringToBoolean(item.heartbeat_86),
      heartbeat_87: convertStringToBoolean(item.heartbeat_87),
      heartbeat_88: convertStringToBoolean(item.heartbeat_88)
    }));
  };

  const fetchReportDetails = async (reportId: number) => {
    try {
      console.log('🔍 Fetching report details for reportId:', reportId);
      
      // Lấy dữ liệu Apache APISIX
      const apisixResponse = await fetch(`/api/apisix-reports?reportId=${reportId}`);
      console.log('📊 APISIX Response status:', apisixResponse.status);
      if (apisixResponse.ok) {
        const apisixResult = await apisixResponse.json();
        console.log('📊 APISIX Result:', apisixResult);
        
        const apisixData = apisixResult.data || apisixResult;
        if (apisixData && apisixData.length > 0) {
          setApisixData({
            note_request: apisixData[0].note_request,
            note_upstream: apisixData[0].note_upstream
          });
        }
      }

      // Lấy dữ liệu NEMSM (Node Exporter)
      const nemsmResponse = await fetch(`/api/nemsm-reports?reportId=${reportId}`);
      console.log('🖥️ NEMSM Response status:', nemsmResponse.status);
      if (nemsmResponse.ok) {
        const nemsmResult = await nemsmResponse.json();
        console.log('🖥️ NEMSM Result:', nemsmResult);
        
        // Backend có thể wrap data trong field 'data'
        const nemsmData = nemsmResult.data || nemsmResult;
        if (nemsmData && nemsmData.length > 0) {
          setServersData(processServerData(nemsmData));
        }
      }

      // Lấy dữ liệu Patroni
      const patroniResponse = await fetch(`/api/patroni-reports?reportId=${reportId}`);
      console.log('🗄️ Patroni Response status:', patroniResponse.status);
      if (patroniResponse.ok) {
        const patroniResult = await patroniResponse.json();
        console.log('🗄️ Patroni Result:', patroniResult);
        
        const patroniData = patroniResult.data || patroniResult;
        if (patroniData && patroniData.length > 0) {
          setPatroniData(processPatroniData(patroniData));
        }
      }

      // Lấy dữ liệu Transaction
      const transactionResponse = await fetch(`/api/transaction-reports?reportId=${reportId}`);
      console.log('💳 Transaction Response status:', transactionResponse.status);
      if (transactionResponse.ok) {
        const transactionResult = await transactionResponse.json();
        console.log('💳 Transaction Result:', transactionResult);
        
        const transactionData = transactionResult.data || transactionResult;
        if (transactionData && transactionData.length > 0) {
          setTransactionData(processTransactionData(transactionData));
        }
      }

      // Lấy dữ liệu Heartbeat
      const heartbeatResponse = await fetch(`/api/heartbeat-reports?reportId=${reportId}`);
      console.log('💓 Heartbeat Response status:', heartbeatResponse.status);
      if (heartbeatResponse.ok) {
        const heartbeatResult = await heartbeatResponse.json();
        console.log('💓 Heartbeat Result:', heartbeatResult);
        
        const heartbeatData = heartbeatResult.data || heartbeatResult;
        if (heartbeatData && heartbeatData.length > 0) {
          setHeartbeatData(processHeartbeatData(heartbeatData));
        }
      }

      // Lấy dữ liệu Alert
      const alertResponse = await fetch(`/api/alert-reports?reportId=${reportId}`);
      console.log('🚨 Alert Response status:', alertResponse.status);
      if (alertResponse.ok) {
        const alertResult = await alertResponse.json();
        console.log('🚨 Alert Result:', alertResult);
        
        const alertData = alertResult.data || alertResult;
        if (alertData && alertData.length > 0) {
          setAlertData({
            note_alert_1: alertData[0].note_alert_1,
            note_alert_2: alertData[0].note_alert_2
          });
        }
      }

    } catch (error) {
      console.error('Lỗi khi lấy chi tiết báo cáo:', error);
    }
  };

  const formatShiftTime = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    const start = startTime.substring(0, 5); // HH:MM
    const end = endTime.substring(0, 5);     // HH:MM
    return `${start} - ${end}`;
  };

  const getShiftByTime = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 14) {
      return 'Ca sáng (06:00 - 14:00)';
    } else if (currentHour >= 14 && currentHour < 22) {
      return 'Ca chiều (14:00 - 22:00)';
    } else {
      return 'Ca tối (22:00 - 06:00)';
    }
  };

  const getFullName = (user: UserInfo | null) => {
    if (!user) return '';
    
    console.log('👤 User Info:', {
      username: user.username,
      full_name: user.full_name,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    // Ưu tiên lastName và firstName
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Fallback về full_name nếu không có lastName và firstName
    if (user.full_name) {
      return user.full_name;
    }
    
    // Cuối cùng mới dùng username
    return user.username;
  };

  const renderCheckmark = (value: boolean) => {
    return value ? '✓' : '';
  };

  const getStatus = (hasData: boolean) => {
    return hasData ? 'OK' : '';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid report-review">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="report-header text-center mb-4">
            <h2 className="mb-3">BÁO CÁO CA TRỰC</h2>
            <div className="shift-info">
              <p><strong>Ca trực từ:</strong> {getShiftByTime()}</p>
              <p><strong>Người trực:</strong> {getFullName(userInfo)}</p>
              <p><strong>Ngày:</strong> {reportDate}</p>
            </div>
          </div>

          {/* Scroll Buttons */}
          <div className="scroll-buttons">
            <button 
              className="scroll-top-btn" 
              onClick={scrollToTop}
              title="Lên đầu trang"
            >
              <i className="bi bi-arrow-up"></i>
            </button>
            <button 
              className="scroll-bottom-btn" 
              onClick={scrollToBottom}
              title="Xuống cuối trang"
            >
              <i className="bi bi-arrow-down"></i>
            </button>
          </div>

          {/* Apache APISIX Section */}
          <div className="section mb-4">
            <h4 className="section-title">1. Apache APISIX</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Panel</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Request Latency</td>
                  <td>{getStatus(!!apisixData.note_request) || 'OK'}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Upstream Latency</td>
                  <td>{getStatus(!!apisixData.note_upstream) || 'OK'}</td>
                </tr>
              </tbody>
            </table>
            
            {/* Hiển thị ghi chú nếu có */}
            {(apisixData.note_request || apisixData.note_upstream) && (
              <div className="notes-section mt-3">
                <h6>Ghi chú chi tiết:</h6>
                {apisixData.note_request && (
                  <div className="note-item">
                    <strong>Request Latency:</strong> {apisixData.note_request}
                  </div>
                )}
                {apisixData.note_upstream && (
                  <div className="note-item">
                    <strong>Upstream Latency:</strong> {apisixData.note_upstream}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Node Exporter Multiple Server Metrics Section */}
          <div className="section mb-4">
            <h4 className="section-title">2. Node Exporter multiple Server Metrics</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Server name</th>
                  <th>IP</th>
                  <th>CPU</th>
                  <th>Memory</th>
                  <th>Disk Space Used</th>
                  <th>Network traffic</th>
                  <th>Netstat</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {serversData.map((server, index) => (
                  <tr key={server.id}>
                    <td>{index + 1}</td>
                    <td>{server.server.server_name}</td>
                    <td>{server.server.ip}</td>
                    <td className="text-center">{renderCheckmark(server.cpu)}</td>
                    <td className="text-center">{renderCheckmark(server.memory)}</td>
                    <td className="text-center">{renderCheckmark(server.disk_space_used)}</td>
                    <td className="text-center">{renderCheckmark(server.network_traffic)}</td>
                    <td className="text-center">{renderCheckmark(server.netstat)}</td>
                    <td>{server.notes || ''}</td>
                  </tr>
                ))}
                {serversData.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      Không có dữ liệu server
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PostgreSQL Patroni Section */}
          <div className="section mb-4">
            <h4 className="section-title">3. PostgreSQL Patroni</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Primary Node</th>
                  <th>WAL Replay Paused</th>
                  <th>Replicas Received WAL</th>
                  <th>Primary WAL Location</th>
                  <th>Replicas Replayed WAL</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {patroniData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.row_index}</td>
                    <td className="text-center">{renderCheckmark(item.primary_node)}</td>
                    <td className="text-center">{renderCheckmark(item.wal_replay_paused)}</td>
                    <td className="text-center">{renderCheckmark(item.replicas_received_wal)}</td>
                    <td className="text-center">{renderCheckmark(item.primary_wal_location)}</td>
                    <td className="text-center">{renderCheckmark(item.replicas_replayed_wal)}</td>
                    <td>{item.notes || ''}</td>
                  </tr>
                ))}
                {patroniData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Không có dữ liệu Patroni
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Database Transactions Section */}
          <div className="section mb-4">
            <h4 className="section-title">4. Database Transactions</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Transactions Giám sát</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.row_index}</td>
                    <td className="text-center">{renderCheckmark(item.transaction_monitored)}</td>
                    <td>{item.notes || ''}</td>
                  </tr>
                ))}
                {transactionData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      Không có dữ liệu Transaction
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PostgreHeartbeat Section */}
          <div className="section mb-4">
            <h4 className="section-title">5. PostgreHeartbeat</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Heartbeat 10.2.45.86</th>
                  <th>Heartbeat 10.2.45.87</th>
                  <th>Heartbeat 10.2.45.88</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {heartbeatData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.row_index}</td>
                    <td className="text-center">{renderCheckmark(item.heartbeat_86)}</td>
                    <td className="text-center">{renderCheckmark(item.heartbeat_87)}</td>
                    <td className="text-center">{renderCheckmark(item.heartbeat_88)}</td>
                    <td>{item.notes || ''}</td>
                  </tr>
                ))}
                {heartbeatData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      Không có dữ liệu Heartbeat
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cảnh báo Section */}
          <div className="section mb-4">
            <h4 className="section-title">6. Cảnh báo</h4>
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Loại cảnh báo</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Warning / Critical / Info</td>
                  <td>{alertData.note_alert_1 || ''}</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Info backup / Warning Disk / Other</td>
                  <td>{alertData.note_alert_2 || ''}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons text-center mt-4">
            <button 
              className="btn btn-secondary me-3"
              onClick={() => router.push('/dashboard')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại Dashboard
            </button>
            <button 
              className="btn btn-success me-3"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-2"></i>
              In báo cáo
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/reports')}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Tạo báo cáo mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 