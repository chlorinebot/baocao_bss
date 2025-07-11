'use client';

import '@/styles/report.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

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
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('node-exporter');

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
    // Lấy danh sách servers từ API
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      if (response.ok) {
        const serversData = await response.json();
        setServers(serversData);
      } else {
        console.error('Lỗi khi lấy danh sách servers');
        // Fallback - sử dụng data mặc định nếu không thể lấy từ API
        setServers([
          { id: 1, server_name: 'Prod-gateway1', ip: '10.2.157.5' },
          { id: 2, server_name: 'Prod-gateway2', ip: '10.2.157.6' },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi fetch servers:', error);
      // Fallback - sử dụng data mặc định nếu có lỗi
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo và validate dữ liệu báo cáo
      const reportData = {
        date: today,
        nodeExporter: servers.map(server => ({
          serverId: server.id,
          serverName: server.server_name,
          ip: server.ip,
          metrics: {
            cpu: checkboxStates[`server_${server.id}_cpu`] || false,
            memory: checkboxStates[`server_${server.id}_memory`] || false,
            disk: checkboxStates[`server_${server.id}_disk`] || false,
            network: checkboxStates[`server_${server.id}_network`] || false,
            netstat: checkboxStates[`server_${server.id}_netstat`] || false,
          },
          note: notes[`server_${server.id}_note`] || ''
        })),
        patroni: Array.from({ length: 16 }, (_, index) => ({
          index: index + 1,
          metrics: {
            primaryNode: checkboxStates[`patroni_${index}_primary`] || false,
            walReplayPaused: checkboxStates[`patroni_${index}_wal_replay`] || false,
            replicasReceivedWal: checkboxStates[`patroni_${index}_replicas_received`] || false,
            primaryWalLocation: checkboxStates[`patroni_${index}_primary_wal`] || false,
            replicasReplayedWal: checkboxStates[`patroni_${index}_replicas_replayed`] || false,
          },
          note: notes[`patroni_${index}_note`] || ''
        })).filter(item => 
          item.metrics.primaryNode || 
          item.metrics.walReplayPaused || 
          item.metrics.replicasReceivedWal || 
          item.metrics.primaryWalLocation || 
          item.metrics.replicasReplayedWal || 
          item.note
        ),
        transactions: Array.from({ length: 16 }, (_, index) => ({
          index: index + 1,
          monitored: checkboxStates[`transaction_${index}_monitored`] || false,
          note: notes[`transaction_${index}_note`] || ''
        })).filter(item => item.monitored || item.note),
        heartbeat: Array.from({ length: 4 }, (_, index) => ({
          index: index + 1,
          metrics: {
            heartbeat86: checkboxStates[`heartbeat_${index}_86`] || false,
            heartbeat87: checkboxStates[`heartbeat_${index}_87`] || false,
            heartbeat88: checkboxStates[`heartbeat_${index}_88`] || false,
          },
          note: notes[`heartbeat_${index}_note`] || ''
        })).filter(item => 
          item.metrics.heartbeat86 || 
          item.metrics.heartbeat87 || 
          item.metrics.heartbeat88 || 
          item.note
        ),
        alerts: {
          types: {
            warning: checkboxStates['alert_warning'] || false,
            critical: checkboxStates['alert_critical'] || false,
            info: checkboxStates['alert_info'] || false,
            infoBackup: checkboxStates['alert_info_backup'] || false,
            warningDisk: checkboxStates['alert_warning_disk'] || false,
            other: checkboxStates['alert_other'] || false,
          },
          notes: {
            note1: notes['alert_note_1'] || '',
            note2: notes['alert_note_2'] || ''
          }
        },
        additionalNotes: additionalNotes || ''
      };

      // Log chi tiết từng phần của dữ liệu
      console.log('Chi tiết Node Exporter:', reportData.nodeExporter);
      console.log('Chi tiết Patroni:', reportData.patroni);
      console.log('Chi tiết Transactions:', reportData.transactions);
      console.log('Chi tiết Heartbeat:', reportData.heartbeat);
      console.log('Chi tiết Alerts:', reportData.alerts);

      // Kiểm tra dữ liệu
      if (!reportData.nodeExporter.some(item => 
        Object.values(item.metrics).some(value => value === true)
      )) {
        throw new Error('Vui lòng kiểm tra ít nhất một mục trong Node Exporter');
      }

      // Kiểm tra token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!');
        router.push('/login');
        return;
      }

      try {
        console.log('Bắt đầu gửi request với token:', token.substring(0, 10) + '...');
        
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(reportData),
          credentials: 'include',
        });

        console.log('Status code từ server:', response.status);
        console.log('Headers từ server:', Object.fromEntries(response.headers.entries()));

        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          responseData = await response.json();
          console.log('Response data (JSON):', responseData);
        } else {
          responseData = await response.text();
          console.log('Response data (Text):', responseData);
        }

        if (!response.ok) {
          if (response.status === 401) {
            alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!');
            router.push('/login');
            return;
          } else if (response.status === 500) {
            throw new Error(`Lỗi máy chủ: ${typeof responseData === 'string' ? responseData : JSON.stringify(responseData)}`);
          } else {
            throw new Error(
              typeof responseData === 'string' 
                ? responseData 
                : responseData.error || responseData.message || 'Gửi báo cáo thất bại'
            );
          }
        }

        alert('Đã gửi báo cáo thành công!');
        router.push('/reports/history');
      } catch (error) {
        console.error('Chi tiết lỗi khi gửi request:', error);
        alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi báo cáo!');
      }
    } catch (error) {
      console.error('Lỗi khi xử lý dữ liệu:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý dữ liệu báo cáo!');
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
    { id: 'node-exporter', title: '1️⃣ Node Exporter', icon: 'hdd-network' },
    { id: 'patroni', title: '2️⃣ PostgreSQL Patroni', icon: 'database-check' },
    { id: 'transactions', title: '3️⃣ Database Transactions', icon: 'arrow-left-right' },
    { id: 'heartbeat', title: '4️⃣ PostgreHeartbeat', icon: 'heart-pulse' },
    { id: 'alerts', title: '5️⃣ Cảnh báo', icon: 'exclamation-triangle' }
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
              {/* Node Exporter Section */}
              <div id="node-exporter" className="card shadow-sm report-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="card-title h5 mb-0">
                      <i className="bi bi-hdd-network me-2"></i>
                      Node Exporter Multiple Server Metrics
                    </h2>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => handleSelectAllNodeExporter((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                    >
                      {Object.entries(checkboxStates).some(([key, value]) => 
                        key.startsWith('server_') && value
                      ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
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
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => handleSelectAllPatroni((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                    >
                      {Object.entries(checkboxStates).some(([key, value]) => 
                        key.startsWith('patroni_') && value
                      ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
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
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => handleSelectAllTransactions((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                    >
                      {Object.entries(checkboxStates).some(([key, value]) => 
                        key.startsWith('transaction_') && value
                      ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
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
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={(e) => handleSelectAllHeartbeat((e.target as HTMLButtonElement).textContent === 'Chọn tất cả')}
                    >
                      {Object.entries(checkboxStates).some(([key, value]) => 
                        key.startsWith('heartbeat_') && value
                      ) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
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
                  <h2 className="card-title h5 mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Cảnh báo
                  </h2>
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
                {/* Additional Notes */}
                <div className="mb-4">
                  <h2 className="h6 mb-3">
                    <i className="bi bi-pencil-square me-2"></i>
                    Ghi chú bổ sung
                  </h2>
                  <textarea
                    rows={8}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Nhập ghi chú bổ sung hoặc thông tin khác..."
                    className="form-control form-control-sm"
                  />
                </div>

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