'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      const reportData = {
        date: today,
        nodeExporter: servers.map((server, index) => ({
          serverName: server.server_name,
          ip: server.ip,
          cpu: checkboxStates[`server_${index}_cpu`] || false,
          memory: checkboxStates[`server_${index}_memory`] || false,
          disk: checkboxStates[`server_${index}_disk`] || false,
          network: checkboxStates[`server_${index}_network`] || false,
          netstat: checkboxStates[`server_${index}_netstat`] || false,
          note: notes[`server_${index}_note`] || ''
        })),
        patroni: Array.from({ length: 16 }, (_, index) => ({
          primaryNode: checkboxStates[`patroni_${index}_primary`] || false,
          walReplayPaused: checkboxStates[`patroni_${index}_wal_replay`] || false,
          replicasReceivedWal: checkboxStates[`patroni_${index}_replicas_received`] || false,
          primaryWalLocation: checkboxStates[`patroni_${index}_primary_wal`] || false,
          replicasReplayedWal: checkboxStates[`patroni_${index}_replicas_replayed`] || false,
          note: notes[`patroni_${index}_note`] || ''
        })),
        transactions: Array.from({ length: 10 }, (_, index) => ({
          monitored: checkboxStates[`transaction_${index}_monitored`] || false,
          note: notes[`transaction_${index}_note`] || ''
        })),
        heartbeat: Array.from({ length: 4 }, (_, index) => ({
          heartbeat86: checkboxStates[`heartbeat_${index}_86`] || false,
          heartbeat87: checkboxStates[`heartbeat_${index}_87`] || false,
          heartbeat88: checkboxStates[`heartbeat_${index}_88`] || false,
          note: notes[`heartbeat_${index}_note`] || ''
        })),
        alerts: {
          warning: checkboxStates['alert_warning'] || false,
          critical: checkboxStates['alert_critical'] || false,
          info: checkboxStates['alert_info'] || false,
          infoBackup: checkboxStates['alert_info_backup'] || false,
          warningDisk: checkboxStates['alert_warning_disk'] || false,
          other: checkboxStates['alert_other'] || false,
          note1: notes['alert_note_1'] || '',
          note2: notes['alert_note_2'] || ''
        },
        additionalNotes
      };

      // Gửi data đến API (cần implement API endpoint)
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        alert('Đã gửi báo cáo thành công!');
        router.push('/reports/history');
      } else {
        throw new Error('Gửi báo cáo thất bại');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Có lỗi xảy ra khi gửi báo cáo!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <i className="bi bi-clipboard-data me-2"></i>
              📝 Báo cáo ca trực ngày {today}
            </h2>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
            >
              <i className="bi bi-arrow-left me-2"></i>
              ← Quay lại
            </button>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* 1. Node Exporter */}
            <div className="mb-8" id="node-exporter">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">
                1️⃣ Node Exporter Multiple Server Metrics
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">STT</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Server Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">IP</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">CPU</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Memory</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Disk</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Network</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Netstat</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingServers ? (
                      <tr>
                        <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            <span className="text-gray-600">Đang tải danh sách servers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : servers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          Không có server nào trong hệ thống
                        </td>
                      </tr>
                    ) : (
                      servers.map((server, index) => (
                        <tr key={server.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{server.server_name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-gray-600">{server.ip}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates[`server_${index}_cpu`] || false}
                              onChange={() => handleCheckboxChange(`server_${index}_cpu`)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates[`server_${index}_memory`] || false}
                              onChange={() => handleCheckboxChange(`server_${index}_memory`)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates[`server_${index}_disk`] || false}
                              onChange={() => handleCheckboxChange(`server_${index}_disk`)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates[`server_${index}_network`] || false}
                              onChange={() => handleCheckboxChange(`server_${index}_network`)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates[`server_${index}_netstat`] || false}
                              onChange={() => handleCheckboxChange(`server_${index}_netstat`)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <textarea
                              rows={1}
                              value={notes[`server_${index}_note`] || ''}
                              onChange={(e) => handleNoteChange(`server_${index}_note`, e.target.value)}
                              placeholder="Ghi chú..."
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. PostgreSQL Patroni */}
            <div className="mb-8" id="patroni">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">
                2️⃣ PostgreSQL Patroni
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">STT</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Primary Node</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">WAL Replay Paused</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Replicas Received WAL Location</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Primary WAL Location</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Replicas Replayed WAL Location</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 16 }, (_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`patroni_${index}_primary`] || false}
                            onChange={() => handleCheckboxChange(`patroni_${index}_primary`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`patroni_${index}_wal_replay`] || false}
                            onChange={() => handleCheckboxChange(`patroni_${index}_wal_replay`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`patroni_${index}_replicas_received`] || false}
                            onChange={() => handleCheckboxChange(`patroni_${index}_replicas_received`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`patroni_${index}_primary_wal`] || false}
                            onChange={() => handleCheckboxChange(`patroni_${index}_primary_wal`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`patroni_${index}_replicas_replayed`] || false}
                            onChange={() => handleCheckboxChange(`patroni_${index}_replicas_replayed`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <textarea
                            rows={1}
                            value={notes[`patroni_${index}_note`] || ''}
                            onChange={(e) => handleNoteChange(`patroni_${index}_note`, e.target.value)}
                            placeholder="Ghi chú..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. PostgreSQL Database Transactions */}
            <div className="mb-8" id="transactions">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">
                3️⃣ PostgreSQL Database Transactions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">STT</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Transactions Giám sát</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 10 }, (_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`transaction_${index}_monitored`] || false}
                            onChange={() => handleCheckboxChange(`transaction_${index}_monitored`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <textarea
                            rows={1}
                            value={notes[`transaction_${index}_note`] || ''}
                            onChange={(e) => handleNoteChange(`transaction_${index}_note`, e.target.value)}
                            placeholder="Ghi chú..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. PostgreHeartbeat */}
            <div className="mb-8" id="heartbeat">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">
                4️⃣ PostgreHeartbeat
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">STT</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Heartbeat 10.2.45.86</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Heartbeat 10.2.45.87</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Heartbeat 10.2.45.88</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }, (_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`heartbeat_${index}_86`] || false}
                            onChange={() => handleCheckboxChange(`heartbeat_${index}_86`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`heartbeat_${index}_87`] || false}
                            onChange={() => handleCheckboxChange(`heartbeat_${index}_87`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checkboxStates[`heartbeat_${index}_88`] || false}
                            onChange={() => handleCheckboxChange(`heartbeat_${index}_88`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <textarea
                            rows={1}
                            value={notes[`heartbeat_${index}_note`] || ''}
                            onChange={(e) => handleNoteChange(`heartbeat_${index}_note`, e.target.value)}
                            placeholder="Ghi chú..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Cảnh báo */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">
                5️⃣ Cảnh báo
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">STT</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Cảnh báo</th>
                      <th className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_warning'] || false}
                              onChange={() => handleCheckboxChange('alert_warning')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Warning
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_critical'] || false}
                              onChange={() => handleCheckboxChange('alert_critical')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Critical
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_info'] || false}
                              onChange={() => handleCheckboxChange('alert_info')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Info
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <textarea
                          rows={1}
                          value={notes['alert_note_1'] || ''}
                          onChange={(e) => handleNoteChange('alert_note_1', e.target.value)}
                          placeholder="Ghi chú..."
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">2</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_info_backup'] || false}
                              onChange={() => handleCheckboxChange('alert_info_backup')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Info backup
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_warning_disk'] || false}
                              onChange={() => handleCheckboxChange('alert_warning_disk')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Warning Disk
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkboxStates['alert_other'] || false}
                              onChange={() => handleCheckboxChange('alert_other')}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                            />
                            Other
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <textarea
                          rows={1}
                          value={notes['alert_note_2'] || ''}
                          onChange={(e) => handleNoteChange('alert_note_2', e.target.value)}
                          placeholder="Ghi chú..."
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ghi chú tự do */}
            <div className="mb-6">
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm (nếu có)
              </label>
              <textarea
                id="additionalNotes"
                rows={4}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Nhập ghi chú bổ sung hoặc thông tin khác..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center"
              >
                <i className="bi bi-arrow-left me-2"></i>
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </form>
        </div>
      </div>
    </div>
  );
} 