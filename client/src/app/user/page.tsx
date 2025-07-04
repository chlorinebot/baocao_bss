'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './user.module.css';

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

export default function UserPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const updateTime = () => {
      const now = new Date();
      // Sử dụng trực tiếp thời gian hiện tại của hệ thống
      const timeString = now.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);
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

      setUserInfo(userInfo);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleSidebarClick = (section: string) => {
    setActiveSection(section);
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
            <div className={styles.timeDisplay}>
              <span className={styles.timeIcon}>🕐</span>
              <span className={styles.timeText}>{currentTime}</span>
              <span className={styles.timeZone}>(GMT+7)</span>
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
                    <span className={styles.sidebarIcon}>🏠</span>
                    <span>Trang chủ</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'create-report' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('create-report')}
                  >
                    <span className={styles.sidebarIcon}>📝</span>
                    <span>Tạo báo cáo</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'report-history' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('report-history')}
                  >
                    <span className={styles.sidebarIcon}>📊</span>
                    <span>Lịch sử báo cáo</span>
                  </button>
                </li>
                <li className={styles.sidebarItem}>
                  <button 
                    className={`${styles.sidebarButton} ${activeSection === 'profile' ? styles.active : ''}`}
                    onClick={() => handleSidebarClick('profile')}
                  >
                    <span className={styles.sidebarIcon}>👤</span>
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
                      <div className={styles.featureIcon}>📝</div>
                      <div className={styles.featureContent}>
                        <h4>Tạo báo cáo</h4>
                        <p>Tạo báo cáo mới cho công việc của bạn</p>
                        <button 
                          className={styles.featureButton}
                          onClick={() => setActiveSection('create-report')}
                        >
                          Tạo báo cáo
                        </button>
                      </div>
                    </div>

                    <div className={styles.featureItem}>
                      <div className={styles.featureIcon}>📊</div>
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
                      <div className={styles.featureIcon}>👤</div>
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
                      <div className={styles.featureIcon}>🔒</div>
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
                    Nếu bạn gặp khó khăn hoặc cần hỗ trợ, vui lòng liên hệ với quản trị viên.
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
              <div className={styles.reportForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tiêu đề báo cáo</label>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    placeholder="Nhập tiêu đề báo cáo..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Loại báo cáo</label>
                  <select className={styles.formSelect}>
                    <option value="">Chọn loại báo cáo</option>
                    <option value="monthly">Báo cáo tháng</option>
                    <option value="quarterly">Báo cáo quý</option>
                    <option value="yearly">Báo cáo năm</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nội dung báo cáo</label>
                  <textarea 
                    className={styles.formTextarea}
                    rows={6}
                    placeholder="Nhập nội dung báo cáo..."
                  ></textarea>
                </div>
                <div className={styles.formActions}>
                  <button className={styles.submitButton}>Tạo báo cáo</button>
                  <button className={styles.cancelButton}>Hủy</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'report-history' && (
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Lịch sử báo cáo</h2>
              <div className={styles.reportList}>
                <div className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <h4 className={styles.reportTitle}>Báo cáo tháng 12/2024</h4>
                    <p className={styles.reportDate}>Ngày tạo: 15/12/2024</p>
                    <span className={styles.reportStatus}>Hoàn thành</span>
                  </div>
                  <div className={styles.reportActions}>
                    <button className={styles.viewButton}>Xem</button>
                    <button className={styles.editButton}>Sửa</button>
                    <button className={styles.deleteButton}>Xóa</button>
                  </div>
                </div>
                <div className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <h4 className={styles.reportTitle}>Báo cáo quý 4/2024</h4>
                    <p className={styles.reportDate}>Ngày tạo: 01/12/2024</p>
                    <span className={styles.reportStatus}>Đang xử lý</span>
                  </div>
                  <div className={styles.reportActions}>
                    <button className={styles.viewButton}>Xem</button>
                    <button className={styles.editButton}>Sửa</button>
                    <button className={styles.deleteButton}>Xóa</button>
                  </div>
                </div>
                <div className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <h4 className={styles.reportTitle}>Báo cáo tháng 11/2024</h4>
                    <p className={styles.reportDate}>Ngày tạo: 30/11/2024</p>
                    <span className={styles.reportStatus}>Hoàn thành</span>
                  </div>
                  <div className={styles.reportActions}>
                    <button className={styles.viewButton}>Xem</button>
                    <button className={styles.editButton}>Sửa</button>
                    <button className={styles.deleteButton}>Xóa</button>
                  </div>
                </div>
              </div>
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
                      ✏️ Sửa thông tin
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
                    ✕
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
              {toastType === 'success' ? '✅' : '❌'}
            </span>
            <span className={styles.toastMessage}>{toastMessage}</span>
            <button 
              className={styles.toastClose}
              onClick={() => setShowToast(false)}
            >
              ✕
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