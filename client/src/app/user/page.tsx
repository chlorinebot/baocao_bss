'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './user.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  role_id: number;
  createdAt: string;
}

interface UserRole {
  role: string;
  scheduleId: number | null;
}

interface UserShift {
  role: string;
  shift: string | null;
  shiftTime: string | null;
  scheduleId: number | null;
}

interface Report {
  id: number;
  id_user: number;
  content: string;
  created_at: string;
}

// Thêm interface cho quyền tạo báo cáo
interface ReportPermission {
  canCreate: boolean;
  reason: string;
  currentShift?: string;
  shiftTime?: string;
  isWorkingTime?: boolean;
}

export default function UserPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userShift, setUserShift] = useState<UserShift | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [dateFilter, setDateFilter] = useState({
    fromDate: '',
    toDate: ''
  });
  const [hasDateFilter, setHasDateFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    birthday: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Thêm state cho quyền tạo báo cáo
  const [reportPermission, setReportPermission] = useState<ReportPermission | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(false);

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const updateTime = () => {
      const now = new Date();
      // Format ngày
      const dateString = now.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setCurrentTime(dateString);
    };

    updateTime(); // Cập nhật ngay lập tức
    const timeInterval = setInterval(updateTime, 1000); // Cập nhật mỗi giây

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    // Kiểm tra token và lấy thông tin user
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (!token || !userInfoStr) {
      router.push('/login');
      return;
    }

    try {
      const userInfo = JSON.parse(userInfoStr);
      
      // Kiểm tra role - chỉ cho phép user (role_id = 2) truy cập
      if (userInfo.role_id === 1) {
        // Admin được chuyển hướng về dashboard
        router.push('/dashboard');
        return;
      }
      
      if (userInfo.role_id !== 2) {
        // Role không hợp lệ
        router.push('/login');
        return;
      }

      // Đảm bảo token được lưu trong cookie
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
        console.log('🍪 Đã cập nhật token trong cookie từ trang user');
      }

      setUserInfo(userInfo);
      // Lấy vai trò phân công và ca trực sau khi có thông tin user
      fetchUserRole(userInfo.id);
      fetchUserShift(userInfo.id);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  }, [router]);

  // Hàm lấy vai trò phân công của user
  const fetchUserRole = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/work-schedule/user/${userId}/role`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserRole(data.data);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy vai trò phân công:', error);
      setUserRole({ role: 'Chưa được phân công', scheduleId: null });
    }
  };

  // Hàm lấy thông tin ca trực hiện tại
  const fetchUserShift = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/work-schedule/user/${userId}/current-shift`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserShift(data.data);
          // Sau khi lấy được thông tin ca trực, kiểm tra quyền tạo báo cáo
          checkReportPermission(userId);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin ca trực:', error);
      setUserShift({ role: 'Chưa được phân công', shift: null, shiftTime: null, scheduleId: null });
    }
  };

  // Thêm hàm kiểm tra quyền tạo báo cáo
  const checkReportPermission = async (userId: number) => {
    setCheckingPermission(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/can-create/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportPermission({
          canCreate: data.canCreate || false,
          reason: data.reason || '',
          currentShift: data.currentShift || '',
          shiftTime: data.shiftTime || '',
          isWorkingTime: data.isWorkingTime || false
        });
      } else {
        const errorData = await response.json();
        setReportPermission({
          canCreate: false,
          reason: errorData.error || 'Không thể kiểm tra quyền tạo báo cáo',
          currentShift: '',
          shiftTime: '',
          isWorkingTime: false
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền tạo báo cáo:', error);
      setReportPermission({
        canCreate: false,
        reason: 'Lỗi kết nối khi kiểm tra quyền tạo báo cáo',
        currentShift: '',
        shiftTime: '',
        isWorkingTime: false
      });
    } finally {
      setCheckingPermission(false);
    }
  };

  // Hàm lấy lịch sử báo cáo của user
  const fetchUserReports = async (userId: number) => {
    setLoadingReports(true);
    try {
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
        // Chỉ hiển thị 10 báo cáo mới nhất khi không có bộ lọc
        setFilteredReports(data.slice(0, 10));
        // Reset bộ lọc khi load dữ liệu mới
        setDateFilter({ fromDate: '', toDate: '' });
        setHasDateFilter(false);
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
      setLoadingReports(false);
    }
  };

  // Hàm lọc báo cáo theo ngày
  const filterReportsByDate = () => {
    const hasFilter = !!(dateFilter.fromDate || dateFilter.toDate);
    setHasDateFilter(hasFilter);

    if (!hasFilter) {
      // Không có bộ lọc: chỉ hiển thị 10 báo cáo mới nhất
      setFilteredReports(reports.slice(0, 10));
      return;
    }

    // Có bộ lọc: lọc theo ngày và hiển thị tất cả kết quả
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

  // Hàm xóa bộ lọc
  const clearDateFilter = () => {
    setDateFilter({ fromDate: '', toDate: '' });
    setHasDateFilter(false);
    setFilteredReports(reports.slice(0, 10));
  };

  // Hàm hiển thị tất cả báo cáo
  const showAllReports = () => {
    setHasDateFilter(true); // Đặt flag để thống kê hiển thị đúng
    setFilteredReports(reports);
  };

  // Effect để tự động lọc khi thay đổi bộ lọc
  useEffect(() => {
    filterReportsByDate();
  }, [dateFilter, reports]);

  // Hàm xử lý thay đổi bộ lọc ngày
  const handleDateFilterChange = (field: 'fromDate' | 'toDate', value: string) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hàm thiết lập bộ lọc nhanh
  const setQuickDateFilter = (period: 'today' | 'thisWeek' | 'thisMonth' | 'lastWeek' | 'lastMonth') => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    
    let fromDate = '';
    let toDate = '';

    switch (period) {
      case 'today':
        fromDate = toDate = today.toISOString().split('T')[0];
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(day - today.getDay());
        fromDate = startOfWeek.toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'thisMonth':
        fromDate = new Date(year, month, 1).toISOString().split('T')[0];
        toDate = today.toISOString().split('T')[0];
        break;
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(day - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        fromDate = lastWeekStart.toISOString().split('T')[0];
        toDate = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const lastMonth = new Date(year, month - 1, 1);
        const lastMonthEnd = new Date(year, month, 0);
        fromDate = lastMonth.toISOString().split('T')[0];
        toDate = lastMonthEnd.toISOString().split('T')[0];
        break;
    }

    setDateFilter({ fromDate, toDate });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleSidebarClick = (section: string) => {
    setActiveSection(section);
    
    // Fetch báo cáo khi chuyển sang section report-history
    if (section === 'report-history' && userInfo) {
      fetchUserReports(userInfo.id);
    }
  };

  const handleViewReport = (reportId: number) => {
    // Chuyển hướng đến trang xem báo cáo
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

  const handleEditProfile = () => {
    if (userInfo) {
      setEditForm({
        email: userInfo.email || '',
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        birthday: userInfo.birthday || ''
      });
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!editForm.email || !editForm.firstName || !editForm.lastName) {
      showToastMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      showToastMessage('Email không hợp lệ', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !userInfo) {
        throw new Error('Không có token hoặc thông tin user');
      }

      const response = await fetch(`http://localhost:3000/users/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: editForm.email,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          birthday: editForm.birthday
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }

      const updatedUser = await response.json();
      
      // Cập nhật userInfo state
      setUserInfo(prev => ({
        ...prev!,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        birthday: updatedUser.birthday
      }));

      // Cập nhật localStorage
      const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const newUserInfo = {
        ...currentUserInfo,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        birthday: updatedUser.birthday
      };
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));

      setShowEditModal(false);
      showToastMessage('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật thông tin';
      
      // Nếu là lỗi từ API, lấy thông báo chi tiết
      if (error instanceof Error && error.message.includes('fetch')) {
        // Lỗi network
        showToastMessage('Không thể kết nối đến server. Vui lòng thử lại.', 'error');
      } else {
        // Lỗi từ backend
        showToastMessage(`Lỗi: ${errorMessage}`, 'error');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Ẩn toast sau 3 giây
  };

  // Hàm format thông tin ca làm việc để hiển thị
  const getShiftDisplayInfo = () => {
    if (checkingPermission) {
      return {
        shift: 'Đang kiểm tra...',
        time: '',
        status: 'loading'
      };
    }

    if (!reportPermission || !userShift) {
      return {
        shift: 'Chưa được phân công',
        time: '',
        status: 'not-assigned'
      };
    }

    // Nếu có thông tin ca từ reportPermission
    if (reportPermission.currentShift && reportPermission.shiftTime) {
      return {
        shift: reportPermission.currentShift,
        time: reportPermission.shiftTime,
        status: reportPermission.isWorkingTime ? 'working' : 'not-working'
      };
    }

    // Fallback từ userShift
    if (userShift.shift && userShift.shiftTime) {
      return {
        shift: userShift.shift,
        time: userShift.shiftTime,
        status: 'assigned'
      };
    }

    return {
      shift: 'Đang nghỉ',
      time: '',
      status: 'off'
    };
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} telsoft-gradient-static`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} telsoft-gradient-static`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Image
              src="/img/logo_telsoft.jpg"
              alt="TELSOFT Logo"
              width={120}
              height={48}
              className={styles.logo}
              priority
            />
          </div>
          <div className={styles.headerCenter}>
            <div className={styles.userRoleDisplay}>
              <span className={styles.roleLabel}>Vai trò:</span>
              <span className={styles.roleValue}>
                {userRole?.role || 'Đang tải...'}
              </span>
            </div>
            {(() => {
              const shiftInfo = getShiftDisplayInfo();
              return (
                <div className={styles.shiftDisplay}>
                  <i className="bi bi-clock-history" style={{ marginRight: '8px' }}></i>
                  <span className={styles.shiftLabel}>{shiftInfo.shift}</span>
                  {shiftInfo.time && (
                    <span className={styles.shiftTime}>({shiftInfo.time})</span>
                  )}
                  {shiftInfo.status === 'not-working' && (
                    <span className={styles.shiftStatus} style={{ color: '#dc3545', marginLeft: '8px' }}>
                      - Chưa đến giờ làm
                    </span>
                  )}
                  {shiftInfo.status === 'working' && (
                    <span className={styles.shiftStatus} style={{ color: '#28a745', marginLeft: '8px' }}>
                      - Đang trong ca
                    </span>
                  )}
                  {shiftInfo.status === 'off' && (
                    <span className={styles.shiftStatus} style={{ color: '#6c757d', marginLeft: '8px' }}>
                      - Đang nghỉ
                    </span>
                  )}
                </div>
              );
            })()}
            <div className={styles.shiftDisplay}>
              <i className="bi bi-calendar-date" style={{ marginRight: '8px' }}></i>
              <span className={styles.shiftLabel}>Ngày</span>
              <span className={styles.shiftTime}>({currentTime} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Đăng Xuất
          </button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Menu</h3>
              <ul className={styles.sidebarMenu}>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'dashboard' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('dashboard')}
                  >
                    <i className="bi bi-house-door" style={{ marginRight: '8px' }}></i>
                    <span>Trang chủ</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'create-report' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('create-report')}
                  >
                    <i className="bi bi-file-earmark-plus" style={{ marginRight: '8px' }}></i>
                    <span>Tạo báo cáo</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'report-history' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('report-history')}
                  >
                    <i className="bi bi-bar-chart-line" style={{ marginRight: '8px' }}></i>
                    <span>Lịch sử báo cáo</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('profile')}
                  >
                    <i className="bi bi-person-circle" style={{ marginRight: '8px' }}></i>
                    <span>Thông tin cá nhân</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main className={styles.mainContent}>
          {activeSection === 'dashboard' && (
            <>
              <div className={styles.welcomeCard}>
                <h2 className={styles.welcomeTitle}>
                  Chào mừng, {userInfo?.firstName} {userInfo?.lastName}!
                </h2>
                <p className={styles.welcomeSubtitle}>
                  Đây là giao diện dành cho người dùng thông thường
                </p>
              </div>

              <div className={styles.contentGrid}>
                <div className={styles.featuresCard}>
                  <h3 className={styles.cardTitle}>Chức Năng</h3>
                  <div className={styles.featuresList}>
                    <div className={styles.featureItem}>
                      <div className={styles.featureIcon}><i className="bi bi-file-earmark-plus"></i></div>
                      <div className={styles.featureContent}>
                        <h4>Tạo báo cáo</h4>
                        <p>Tạo báo cáo mới cho công việc của bạn</p>
                        <button 
                          className={styles.featureButton}
                          onClick={() => setActiveSection('create-report')}
                          disabled={!reportPermission?.canCreate}
                          style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {reportPermission?.canCreate ? 'Tạo báo cáo' : 'Không thể tạo báo cáo'}
                        </button>
                      </div>
                    </div>

                    <div className={styles.featureItem}>
                      <div className={styles.featureIcon}><i className="bi bi-bar-chart-line"></i></div>
                      <div className={styles.featureContent}>
                        <h4>Lịch sử báo cáo</h4>
                        <p>Xem và quản lý các báo cáo đã tạo</p>
                        <button 
                          className={styles.featureButton}
                          onClick={() => setActiveSection('report-history')}
                        >
                          Xem lịch sử
                        </button>
                      </div>
                    </div>

                    <div className={styles.featureItem}>
                      <div className={styles.featureIcon}><i className="bi bi-person-circle"></i></div>
                      <div className={styles.featureContent}>
                        <h4>Thông tin cá nhân</h4>
                        <p>Cập nhật thông tin tài khoản của bạn</p>
                        <button 
                          className={styles.featureButton}
                          onClick={() => setActiveSection('profile')}
                        >
                          Chỉnh sửa
                        </button>
                      </div>
                    </div>

                    <div className={styles.featureItem}>
                      <div className={styles.featureIcon}><i className="bi bi-shield-lock"></i></div>
                      <div className={styles.featureContent}>
                        <h4>Đổi mật khẩu</h4>
                        <p>Thay đổi mật khẩu để bảo mật tài khoản</p>
                        <button className={styles.featureButton}>Đổi mật khẩu</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.helpCard}>
                  <h3 className={styles.cardTitle}>Cần hỗ trợ?</h3>
                  <p>
                    Nếu bạn gặp khó khăn hoặc cần hỗ trợ, vui lòng sử dụng tài liệu hướng dẫn sử dụng hoặc liên hệ với quản trị viên.
                  </p>
                  <div className={styles.helpActions}>
                    <button className={styles.helpButton}>Liên hệ hỗ trợ</button>
                    <button className={styles.helpButton}>Hướng dẫn sử dụng</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'create-report' && (
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Tạo báo cáo mới</h2>

              {/* Thông báo quyền tạo báo cáo */}
              {checkingPermission ? (
                <div className={styles.permissionCheck} style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div className={styles.spinner} style={{ width: '20px', height: '20px' }}></div>
                  <span>Đang kiểm tra quyền tạo báo cáo...</span>
                </div>
              ) : reportPermission && !reportPermission.canCreate ? (
                <div className={styles.permissionDenied} style={{ 
                  background: '#f8d7da', 
                  border: '1px solid #f5c6cb', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '20px',
                  color: '#721c24'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: '#dc3545' }}></i>
                    <strong>Không thể tạo báo cáo</strong>
                  </div>
                  <p style={{ margin: '0', lineHeight: '1.5' }}>{reportPermission.reason}</p>
                </div>
              ) : reportPermission && reportPermission.canCreate ? (
                <div className={styles.permissionGranted} style={{ 
                  background: '#d1edff', 
                  border: '1px solid #bee5eb', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '20px',
                  color: '#0c5460'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-check-circle-fill" style={{ color: '#28a745' }}></i>
                    <strong>Được phép tạo báo cáo</strong>
                  </div>
                  {reportPermission.reason && (
                    <p style={{ margin: '8px 0 0 0', lineHeight: '1.5' }}>{reportPermission.reason}</p>
                  )}
                </div>
              ) : null}

              <div className={styles.reportButtons}>
                <button 
                  className={styles.reportButton}
                  onClick={() => router.push('/reports#apisix')}
                  disabled={!reportPermission?.canCreate}
                  style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <i className="bi bi-router" style={{ marginRight: '8px' }}></i>
                  Apache APISIX
                </button>
                <button 
                  className={styles.reportButton}
                  onClick={() => router.push('/reports#node-exporter')}
                  disabled={!reportPermission?.canCreate}
                  style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <i className="bi bi-hdd-network" style={{ marginRight: '8px' }}></i>
                  Node Exporter multiple Server Metrics
                </button>
                <button 
                  className={styles.reportButton}
                  onClick={() => router.push('/reports#patroni')}
                  disabled={!reportPermission?.canCreate}
                  style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <i className="bi bi-database-check" style={{ marginRight: '8px' }}></i>
                  PostgreSQL Patroni
                </button>
                <button 
                  className={styles.reportButton}
                  onClick={() => router.push('/reports#transactions')}
                  disabled={!reportPermission?.canCreate}
                  style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <i className="bi bi-database" style={{ marginRight: '8px' }}></i>
                  PostgreSQL Database
                </button>
                <button 
                  className={styles.reportButton}
                  onClick={() => router.push('/reports#heartbeat')}
                  disabled={!reportPermission?.canCreate}
                  style={!reportPermission?.canCreate ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <i className="bi bi-discord" style={{ marginRight: '8px' }}></i>
                  Sử dụng Discord giám sát
                </button>
              </div>
              
              {/* Phần Cần hỗ trợ? */}
              <div className={styles.helpCard}>
                <h3 className={styles.cardTitle}>Cần hỗ trợ?</h3>
                <p>
                  Nếu bạn gặp khó khăn hoặc cần hỗ trợ trong quá trình tạo báo cáo, vui lòng sử dụng tài liệu hướng dẫn sử dụng hoặc liên hệ với quản trị viên.
                </p>
                <div className={styles.helpActions}>
                  <button className={styles.helpButton}>
                    <i className="bi bi-headset me-2"></i>
                    Liên hệ hỗ trợ
                  </button>
                  <button className={styles.helpButton}>
                    <i className="bi bi-journal-text me-2"></i>
                    Hướng dẫn sử dụng
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'report-history' && (
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Lịch sử báo cáo</h2>
              
              {/* Bộ lọc theo ngày */}
              <div className={styles.filterSection}>
                <h3 className={styles.filterTitle}>
                  <i className="bi bi-funnel" style={{ marginRight: '8px' }}></i>
                  Lọc theo ngày
                </h3>
                <div className={styles.filterControls}>
                  <div className={styles.dateFilter}>
                    <div className={styles.dateInput}>
                      <label className={styles.dateLabel}>Từ ngày:</label>
                      <input
                        type="date"
                        className={styles.dateInputField}
                        value={dateFilter.fromDate}
                        onChange={(e) => handleDateFilterChange('fromDate', e.target.value)}
                      />
                    </div>
                    <div className={styles.dateInput}>
                      <label className={styles.dateLabel}>Đến ngày:</label>
                      <input
                        type="date"
                        className={styles.dateInputField}
                        value={dateFilter.toDate}
                        onChange={(e) => handleDateFilterChange('toDate', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Quick filter buttons */}
                  <div className={styles.quickFilters}>
                    <span className={styles.quickFilterLabel}>Lọc nhanh:</span>
                    <div className={styles.quickFilterButtons}>
                      <button 
                        className={styles.quickFilterButton}
                        onClick={() => setQuickDateFilter('today')}
                      >
                        Hôm nay
                      </button>
                      <button 
                        className={styles.quickFilterButton}
                        onClick={() => setQuickDateFilter('thisWeek')}
                      >
                        Tuần này
                      </button>
                      <button 
                        className={styles.quickFilterButton}
                        onClick={() => setQuickDateFilter('thisMonth')}
                      >
                        Tháng này
                      </button>
                      <button 
                        className={styles.quickFilterButton}
                        onClick={() => setQuickDateFilter('lastWeek')}
                      >
                        Tuần trước
                      </button>
                      <button 
                        className={styles.quickFilterButton}
                        onClick={() => setQuickDateFilter('lastMonth')}
                      >
                        Tháng trước
                      </button>
                    </div>
                  </div>

                  <div className={styles.filterActions}>
                    <button 
                      className={styles.clearFilterButton}
                      onClick={clearDateFilter}
                      disabled={!dateFilter.fromDate && !dateFilter.toDate}
                    >
                      <i className="bi bi-x-circle" style={{ marginRight: '4px' }}></i>
                      Xóa bộ lọc
                    </button>
                    <div className={styles.filterStats}>
                      {hasDateFilter 
                        ? `Hiển thị ${filteredReports.length} / ${reports.length} báo cáo`
                        : `Hiển thị ${Math.min(10, reports.length)} báo cáo mới nhất / ${reports.length} tổng`
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông báo hiển thị mặc định */}
              {!hasDateFilter && reports.length > 10 && (
                <div className={styles.defaultViewNotice}>
                  <div className={styles.noticeContent}>
                    <i className="bi bi-info-circle" style={{ marginRight: '8px' }}></i>
                    Đang hiển thị 10 báo cáo mới nhất. Sử dụng bộ lọc theo ngày để xem báo cáo cụ thể.
                  </div>
                  <button 
                    className={styles.showAllButton}
                    onClick={showAllReports}
                  >
                    <i className="bi bi-list-ul" style={{ marginRight: '4px' }}></i>
                    Xem tất cả ({reports.length})
                  </button>
                </div>
              )}

              {loadingReports ? (
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner}></div>
                  <p>Đang tải lịch sử báo cáo...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="bi bi-file-earmark-text" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                  <p>Bạn chưa có báo cáo nào. Hãy tạo báo cáo mới!</p>
                  <button 
                    className={styles.createReportButton}
                    onClick={() => setActiveSection('create-report')}
                  >
                    <i className="bi bi-plus-circle" style={{ marginRight: '4px' }}></i>
                    Tạo báo cáo mới
                  </button>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className={styles.emptyState}>
                  <i className="bi bi-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                  <p>Không tìm thấy báo cáo nào trong khoảng thời gian này.</p>
                  <p>Hãy thử thay đổi bộ lọc hoặc xóa bộ lọc để xem tất cả báo cáo.</p>
                </div>
              ) : (
                <div className={styles.reportList}>
                  {filteredReports.map((report) => (
                    <div key={report.id} className={styles.reportItem}>
                      <div className={styles.reportInfo}>
                        <h4 className={styles.reportTitle}>{getReportTitle(report.content, report.created_at)}</h4>
                        <p className={styles.reportDate}>Ngày tạo: {formatDateTime(report.created_at)}</p>
                        <span className={styles.reportStatus}>Trạng thái: Hoàn thành</span>
                      </div>
                      <div className={styles.reportActions}>
                        <button className={styles.viewButton} onClick={() => handleViewReport(report.id)}>
                          <i className="bi bi-eye" style={{ marginRight: '4px' }}></i>
                          Xem báo cáo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'profile' && (
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Thông tin cá nhân</h2>
              
              <div className={styles.profileInfo}>
                <div className={styles.infoCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Thông Tin Cá Nhân</h3>
                    <button 
                      className={styles.editButton}
                      onClick={handleEditProfile}
                    >
                      <i className="bi bi-pencil-square" style={{ marginRight: '4px' }}></i>
                      Sửa thông tin
                    </button>
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>Tên đăng nhập:</label>
                      <span>{userInfo?.username}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Email:</label>
                      <span>{userInfo?.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Họ tên:</label>
                      <span>{userInfo?.firstName} {userInfo?.lastName}</span>
                    </div>
                    {userInfo?.birthday && (
                      <div className={styles.infoItem}>
                        <label>Ngày sinh:</label>
                        <span>{formatDate(userInfo.birthday)}</span>
                      </div>
                    )}
                    <div className={styles.infoItem}>
                      <label>Ngày tạo tài khoản:</label>
                      <span>{formatDate(userInfo?.createdAt || '')}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <label>Vai trò:</label>
                      <span className={styles.roleBadge}>Người dùng</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3 className={styles.modalTitle}>Chỉnh sửa thông tin cá nhân</h3>
                  <button 
                    className={styles.modalCloseButton}
                    onClick={handleCancelEdit}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
                <div className={styles.modalContent}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên đăng nhập</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={userInfo?.username || ''}
                      disabled
                    />
                    <small className={styles.formNote}>Tên đăng nhập không thể thay đổi</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input 
                      type="email" 
                      className={styles.formInput}
                      value={editForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isUpdating}
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Họ</label>
                      <input 
                        type="text" 
                        className={styles.formInput}
                        value={editForm.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        disabled={isUpdating}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tên</label>
                      <input 
                        type="text" 
                        className={styles.formInput}
                        value={editForm.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        disabled={isUpdating}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày sinh</label>
                    <input 
                      type="date" 
                      className={styles.formInput}
                      value={editForm.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button 
                    className={styles.submitButton}
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`${styles.toast} ${styles[toastType]} ${showToast ? styles.toastShow : ''}`}>
          <div className={styles.toastContent}>
            <span className={styles.toastIcon}>
              <i className={`bi ${toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            </span>
            <span className={styles.toastMessage}>{toastMessage}</span>
            <button 
              className={styles.toastClose}
              onClick={() => setShowToast(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2025 By KimTuan to 
            <span className={styles.footerLogo}>
              <Image
                src="/img/logo_telsoft.jpg"
                alt="TELSOFT Logo"
                width={60}
                height={24}
                className={styles.footerLogoImg}
              />
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 