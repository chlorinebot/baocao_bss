'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './nemsm.module.css';

interface ServerStatus {
  id: number;
  server_name: string;
  ip: string;
  cpu: boolean;
  memory: boolean;
  disk_space_user: boolean;
  network_traffic: boolean;
  netstat: boolean;
  note?: string;
}

interface Report {
  id: number;
  id_NEmSM: number;
  cpu: number;
  memory: number;
  disk_space_user: number;
  network_traffic: number;
  netstat: string;
  note?: string;
  created_at: string;
  by_id_user: number;
}

export default function NEmSMReport() {
  const router = useRouter();
  const [servers, setServers] = useState<ServerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedServer, setSelectedServer] = useState<number | null>(null);
  const [reportData, setReportData] = useState<Partial<Report>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (!token || !userInfoStr) {
      router.push('/login');
      return;
    }

    setUserInfo(JSON.parse(userInfoStr));
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch('http://localhost:3000/nemsm');
      if (!response.ok) throw new Error('Không thể lấy danh sách server');
      
      const data = await response.json();
      setServers(data);
    } catch (error) {
      setError('Lỗi khi tải danh sách server');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedServer) {
      setError('Vui lòng chọn server để tạo báo cáo');
      return;
    }

    try {
      const report = {
        id_NEmSM: selectedServer,
        ...reportData,
        by_id_user: userInfo.id,
      };

      const response = await fetch('http://localhost:3000/nemsm-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) throw new Error('Không thể tạo báo cáo');

      alert('Báo cáo đã được tạo thành công!');
      router.push('/user'); // Quay lại trang user sau khi tạo báo cáo
    } catch (error) {
      setError('Lỗi khi tạo báo cáo');
      console.error('Error:', error);
    }
  };

  const handleInputChange = (field: keyof Report, value: any) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Báo Cáo Theo Dõi Server (NEmSM)</h1>
      
      <div className={styles.serverTable}>
        <table>
          <thead>
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server, index) => (
              <tr key={server.id}>
                <td>{index + 1}</td>
                <td>{server.server_name}</td>
                <td>{server.ip}</td>
                <td><input type="checkbox" checked={server.cpu} readOnly /></td>
                <td><input type="checkbox" checked={server.memory} readOnly /></td>
                <td><input type="checkbox" checked={server.disk_space_user} readOnly /></td>
                <td><input type="checkbox" checked={server.network_traffic} readOnly /></td>
                <td><input type="checkbox" checked={server.netstat} readOnly /></td>
                <td>{server.note || '-'}</td>
                <td>
                  <button 
                    onClick={() => setSelectedServer(server.id)}
                    className={styles.actionButton}
                  >
                    Tạo báo cáo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedServer && (
        <div className={styles.reportForm}>
          <h2>Tạo Báo Cáo Mới</h2>
          <div className={styles.formGroup}>
            <label>CPU (%)</label>
            <input 
              type="number" 
              value={reportData.cpu || ''} 
              onChange={(e) => handleInputChange('cpu', parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Memory (%)</label>
            <input 
              type="number" 
              value={reportData.memory || ''} 
              onChange={(e) => handleInputChange('memory', parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Disk Space Used (%)</label>
            <input 
              type="number" 
              value={reportData.disk_space_user || ''} 
              onChange={(e) => handleInputChange('disk_space_user', parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Network Traffic (MB/s)</label>
            <input 
              type="number" 
              value={reportData.network_traffic || ''} 
              onChange={(e) => handleInputChange('network_traffic', parseFloat(e.target.value))}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Netstat</label>
            <input 
              type="text" 
              value={reportData.netstat || ''} 
              onChange={(e) => handleInputChange('netstat', e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Ghi chú</label>
            <textarea 
              value={reportData.note || ''} 
              onChange={(e) => handleInputChange('note', e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button onClick={handleSubmitReport} className={styles.submitButton}>
              Tạo báo cáo
            </button>
            <button 
              onClick={() => setSelectedServer(null)} 
              className={styles.cancelButton}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 