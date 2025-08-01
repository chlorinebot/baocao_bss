'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Report {
  id: number;
  id_user: number;
  content: string;
  shift_type: 'morning' | 'afternoon' | 'evening';
  shift_date: string;
  created_at: string;
}

interface DateFilter {
  fromDate: string;
  toDate: string;
}

export default function ReportsHistoryPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ fromDate: '', toDate: '' });
  const [hasDateFilter, setHasDateFilter] = useState(false);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      
      // Lấy user ID từ localStorage
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        router.push('/login');
        return;
      }

      const userInfo = JSON.parse(userInfoStr);
      const userId = userInfo.id;

      if (!userId) {
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
        setFilteredReports(data.slice(0, 20)); // Hiển thị 20 báo cáo mới nhất
      } else {
        console.error('Lỗi khi lấy báo cáo:', response.status);
        setReports([]);
        setFilteredReports([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử báo cáo:', error);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReportsByDate = () => {
    const hasFilter = !!(dateFilter.fromDate || dateFilter.toDate);
    setHasDateFilter(hasFilter);

    if (!hasFilter) {
      setFilteredReports(reports.slice(0, 20));
      return;
    }

    const filtered = reports.filter(report => {
      const reportDate = new Date(report.created_at);
      const fromDate = dateFilter.fromDate ? new Date(dateFilter.fromDate) : null;
      const toDate = dateFilter.toDate ? new Date(dateFilter.toDate + 'T23:59:59') : null;

      if (fromDate && toDate) {
        return reportDate >= fromDate && reportDate <= toDate;
      } else if (fromDate) {
        return reportDate >= fromDate;
      } else if (toDate) {
        return reportDate <= toDate;
      }
      return true;
    });

    setFilteredReports(filtered);
  };

  const clearDateFilter = () => {
    setDateFilter({ fromDate: '', toDate: '' });
    setHasDateFilter(false);
    setFilteredReports(reports.slice(0, 20));
  };

  const showAllReports = () => {
    setHasDateFilter(true);
    setFilteredReports(reports);
  };

  useEffect(() => {
    filterReportsByDate();
  }, [dateFilter, reports]);

  const handleDateFilterChange = (field: 'fromDate' | 'toDate', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setQuickDateFilter = (period: 'today' | 'thisWeek' | 'thisMonth' | 'lastWeek' | 'lastMonth') => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    switch (period) {
      case 'today':
        setDateFilter({
          fromDate: startOfToday.toISOString().split('T')[0],
          toDate: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'thisWeek':
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
        setDateFilter({
          fromDate: startOfWeek.toISOString().split('T')[0],
          toDate: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateFilter({
          fromDate: startOfMonth.toISOString().split('T')[0],
          toDate: startOfToday.toISOString().split('T')[0]
        });
        break;
      case 'lastWeek':
        const lastWeekEnd = new Date(startOfToday);
        lastWeekEnd.setDate(startOfToday.getDate() - startOfToday.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        setDateFilter({
          fromDate: lastWeekStart.toISOString().split('T')[0],
          toDate: lastWeekEnd.toISOString().split('T')[0]
        });
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateFilter({
          fromDate: lastMonthStart.toISOString().split('T')[0],
          toDate: lastMonthEnd.toISOString().split('T')[0]
        });
        break;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getShiftName = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'Ca Sáng';
      case 'afternoon': return 'Ca Chiều';
      case 'evening': return 'Ca Tối';
      default: return 'Không xác định';
    }
  };

  const handleViewReport = (reportId: number) => {
    router.push(`/reports/review?id=${reportId}`);
  };

  const getReportTitle = (content: string, createdAt: string) => {
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.date) {
        return `Báo cáo ngày ${new Date(parsedContent.date).toLocaleDateString('vi-VN')}`;
      }
    } catch (e) {
      // Fallback nếu không parse được content
    }
    return `Báo cáo ${formatDate(createdAt)}`;
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Navbar />
      
      <div className="container py-4">
        {/* Header */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 mb-2">
                  <i className="bi bi-clock-history me-2"></i>
                  Lịch sử báo cáo ca trực
                </h1>
                <p className="text-muted mb-0">
                  Xem lại các báo cáo ca trực đã tạo trước đây
                </p>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => router.push('/reports')}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Tạo báo cáo mới
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => router.push('/dashboard')}
                >
                  <i className="bi bi-house me-1"></i>
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-funnel me-2"></i>
              Bộ lọc
            </h5>
            
            <div className="row g-3 mb-3">
              <div className="col-md-3">
                <label className="form-label">Từ ngày:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter.fromDate}
                  onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Đến ngày:</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateFilter.toDate}
                  onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
                />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={clearDateFilter}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Xóa bộ lọc
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={showAllReports}
                >
                  <i className="bi bi-list me-1"></i>
                  Hiển thị tất cả
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => setQuickDateFilter('today')}
              >
                Hôm nay
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => setQuickDateFilter('thisWeek')}
              >
                Tuần này
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => setQuickDateFilter('thisMonth')}
              >
                Tháng này
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => setQuickDateFilter('lastWeek')}
              >
                Tuần trước
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => setQuickDateFilter('lastMonth')}
              >
                Tháng trước
              </button>
            </div>
          </div>
        </div>

        {/* Thống kê */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-file-text text-primary me-2 fs-4"></i>
                  <div>
                    <h4 className="mb-0">{reports.length}</h4>
                    <small className="text-muted">Tổng báo cáo</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-eye text-success me-2 fs-4"></i>
                  <div>
                    <h4 className="mb-0">{filteredReports.length}</h4>
                    <small className="text-muted">Đang hiển thị</small>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-calendar-check text-info me-2 fs-4"></i>
                  <div>
                    <h4 className="mb-0">
                      {reports.filter(r => {
                        const today = new Date().toDateString();
                        return new Date(r.created_at).toDateString() === today;
                      }).length}
                    </h4>
                    <small className="text-muted">Hôm nay</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách báo cáo */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="bi bi-list-ul me-2"></i>
              Danh sách báo cáo
              {hasDateFilter && (
                <span className="badge bg-info ms-2">
                  {filteredReports.length} kết quả
                </span>
              )}
            </h5>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary me-2"></div>
                <span>Đang tải danh sách báo cáo...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h4 className="text-muted mt-3">Không có báo cáo nào</h4>
                <p className="text-muted">
                  {hasDateFilter ? 'Không tìm thấy báo cáo trong khoảng thời gian đã chọn' : 'Bạn chưa tạo báo cáo nào'}
                </p>
                {!hasDateFilter && (
                  <button
                    type="button"
                    className="btn btn-primary mt-2"
                    onClick={() => router.push('/reports')}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Tạo báo cáo đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Tiêu đề</th>
                      <th scope="col">Ca làm việc</th>
                      <th scope="col">Ngày ca</th>
                      <th scope="col">Thời gian tạo</th>
                      <th scope="col" className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, index) => (
                      <tr key={report.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-medium">
                            {getReportTitle(report.content, report.created_at)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            report.shift_type === 'morning' ? 'bg-warning' :
                            report.shift_type === 'afternoon' ? 'bg-info' : 'bg-dark'
                          }`}>
                            {getShiftName(report.shift_type)}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {report.shift_date ? formatDate(report.shift_date) : '-'}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDateTime(report.created_at)}
                          </small>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 