'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './dashboard.module.css';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  isActive: boolean;
  role_id: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('statistics');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof User>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    birthday: '',
    role_id: 2,
    password: '',
    confirmPassword: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    birthday: '',
    role_id: 2,
    password: '',
    confirmPassword: ''
  });
  const [addModalError, setAddModalError] = useState('');
  const [editModalError, setEditModalError] = useState('');
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    isHiding: boolean;
  }>({
    show: false,
    message: '',
    type: 'info',
    isHiding: false
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (!token || !userInfoStr) {
      router.push('/login');
      return;
    }

    try {
      const userInfo = JSON.parse(userInfoStr);
      
      // Kiểm tra role - chỉ cho phép admin (role_id = 1) truy cập dashboard
      if (userInfo.role_id === 2) {
        // User thông thường được chuyển hướng về user interface
        router.push('/user');
        return;
      }
      
      if (userInfo.role_id !== 1) {
        // Role không hợp lệ
        router.push('/login');
        return;
      }

      // Tạo object user với đầy đủ thông tin cho dashboard
      const fullUser: User = {
        id: userInfo.id,
        username: userInfo.username,
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        birthday: userInfo.birthday || '',
        isActive: true, // Mặc định
        role_id: userInfo.role_id,
        createdAt: userInfo.createdAt || new Date().toISOString(),
        updatedAt: userInfo.updatedAt || new Date().toISOString()
      };

      setUser(fullUser);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  }, [router]);

  // Fetch users data
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
        setFilteredUsers(usersData);
        console.log('✅ Đã tải thành công', usersData.length, 'người dùng');
      } else {
        console.error('Failed to fetch users, status:', response.status);
        showToast('Không thể tải danh sách người dùng. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Lỗi kết nối server. Vui lòng kiểm tra server có đang chạy không.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // Sorting functionality
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) {
      return '🔽';
    }
    return sortDirection === 'asc' ? '🔼' : '🔽';
  };

  const sortUsers = (users: User[]) => {
    return [...users].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types
      if (sortField === 'id' || sortField === 'role_id') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'birthday' || sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (sortField === 'isActive') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else {
        // For string fields, combine firstName and lastName for username sorting
        if (sortField === 'username') {
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Search functionality
  useEffect(() => {
    let filtered = users;
    
    if (searchTerm.trim() !== '') {
      filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toString().includes(searchTerm)
      );
    }
    
    // Apply sorting
    filtered = sortUsers(filtered);
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, sortField, sortDirection]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    router.push('/login');
  };

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === 'users') {
      fetchUsers();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1: return 'admin';
      case 2: return 'user';
      default: return 'system';
    }
  };

  const getRoleClass = (roleId: number) => {
    switch (roleId) {
      case 1: return styles.roleAdmin;
      case 2: return styles.roleUser;
      default: return styles.roleSystem;
    }
  };

  const handleEditUser = (userData: User) => {
    setEditingUser(userData);
    setEditModalError('');
    setEditFormData({
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthday: userData.birthday,
      role_id: userData.role_id,
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditModalError('');
    setEditFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthday: '',
      role_id: 2,
      password: '',
      confirmPassword: ''
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? Number(value) : value
    }));
    // Clear error when user starts typing
    if (editModalError) {
      setEditModalError('');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Reset error
    setEditModalError('');

    // Validate password if provided
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      setEditModalError('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      // Update basic user information (without password and username)
      const basicUpdateData = {
        email: editFormData.email,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        birthday: editFormData.birthday,
        role_id: editFormData.role_id
      };

      const response = await fetch(`http://localhost:3000/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basicUpdateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setEditModalError(errorData.message || `Lỗi khi cập nhật thông tin cơ bản (${response.status})`);
        return;
      }

      // Update password separately if provided
      if (editFormData.password && canChangePassword(editingUser)) {
        const passwordResponse = await fetch(`http://localhost:3000/users/${editingUser.id}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: editFormData.password,
            adminId: user?.id,
            adminRoleId: user?.role_id
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          setEditModalError(errorData.message || 'Lỗi khi đổi mật khẩu');
          return;
        }
      }

      // Refresh user list and show success message
      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...updatedUser } : u
      ));
      
      showToast(editFormData.password ? 'Cập nhật thông tin và đổi mật khẩu thành công!' : 'Cập nhật thông tin người dùng thành công!', 'success');
      handleCloseEditModal();
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      setEditModalError('Lỗi kết nối server. Vui lòng thử lại.');
    }
  };

  // Check if current user can change password of target user
  const canChangePassword = (targetUser: User) => {
    if (!user) return false;
    
    // Admin can change password of regular users (role_id = 2)
    if (user.role_id === 1 && targetUser.role_id === 2) {
      return true;
    }
    
    // Admin can only change their own password
    if (user.role_id === 1 && targetUser.role_id === 1) {
      return user.id === targetUser.id;
    }
    
    return false;
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setAddModalError('');
    setAddFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthday: '',
      role_id: 2,
      password: '',
      confirmPassword: ''
    });
  };

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: name === 'role_id' ? Number(value) : value
    }));
    // Clear error when user starts typing
    if (addModalError) {
      setAddModalError('');
    }
  };

  const handleAddUser = async () => {
    // Reset error
    setAddModalError('');

    // Validation
    if (!addFormData.username || !addFormData.email || !addFormData.firstName || 
        !addFormData.lastName || !addFormData.password) {
      setAddModalError('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    if (addFormData.password !== addFormData.confirmPassword) {
      setAddModalError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (addFormData.password.length < 6) {
      setAddModalError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: addFormData.username,
          email: addFormData.email,
          firstName: addFormData.firstName,
          lastName: addFormData.lastName,
          birthday: addFormData.birthday,
          role_id: addFormData.role_id,
          password: addFormData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAddModalError(errorData.message || 'Lỗi khi thêm người dùng mới');
        return;
      }

      showToast('Thêm người dùng mới thành công!', 'success');
      handleCloseAddModal();
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error adding user:', error);
      setAddModalError('Lỗi kết nối server. Vui lòng thử lại.');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      show: true,
      message,
      type,
      isHiding: false
    });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isHiding: true }));
    
    // Wait for fade animation to complete before hiding
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false, isHiding: false }));
    }, 300); // Match the CSS animation duration
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'statistics':
        return (
          <div className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Thống kê hệ thống</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statContent}>
                  <h3>Tổng người dùng</h3>
                  <p className={styles.statNumber}>{users.length}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🔐</div>
                <div className={styles.statContent}>
                  <h3>Người dùng hoạt động</h3>
                  <p className={styles.statNumber}>{users.filter(u => u.isActive).length}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>⚙️</div>
                <div className={styles.statContent}>
                  <h3>Vai trò</h3>
                  <p className={styles.statNumber}>2</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statContent}>
                  <h3>Đăng nhập hôm nay</h3>
                  <p className={styles.statNumber}>0</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className={styles.contentSection}>
            <div className={styles.userManagementHeader}>
              <h2 className={styles.sectionTitle}>Danh sách người dùng</h2>
              <div className={styles.userManagementActions}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo ID, tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  <span className={styles.searchIcon}>🔍</span>
                </div>
                <button 
                  onClick={fetchUsers}
                  className={styles.refreshButton}
                  disabled={usersLoading}
                >
                  <span className={styles.refreshIcon}>🔄</span>
                  {usersLoading ? 'Đang tải...' : 'Làm mới'}
                </button>
                <button className={styles.addUserButton} onClick={handleShowAddModal}>
                  <span className={styles.addIcon}>➕</span>
                  Thêm người dùng mới
                </button>
              </div>
            </div>
            
            <div className={styles.userTableContainer}>
              <div className={styles.tableInfo}>
                <span>Cập nhật theo thời gian thực</span>
                <span className={styles.lastUpdate}>
                  🔄 Cập nhật gần nhất: {new Date().toLocaleTimeString('vi-VN')}
                </span>
              </div>
              
              {usersLoading ? (
                <div className={styles.loadingTable}>Đang tải dữ liệu...</div>
              ) : (
                <>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                          ID <span className={styles.sortIcon}>{getSortIcon('id')}</span>
                        </th>
                        <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                          Tên người dùng <span className={styles.sortIcon}>{getSortIcon('username')}</span>
                        </th>
                        <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                          Email <span className={styles.sortIcon}>{getSortIcon('email')}</span>
                        </th>
                        <th onClick={() => handleSort('role_id')} style={{ cursor: 'pointer' }}>
                          Vai trò <span className={styles.sortIcon}>{getSortIcon('role_id')}</span>
                        </th>
                        <th onClick={() => handleSort('birthday')} style={{ cursor: 'pointer' }}>
                          Ngày sinh <span className={styles.sortIcon}>{getSortIcon('birthday')}</span>
                        </th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((userData) => (
                        <tr key={userData.id}>
                          <td data-label="ID">{userData.id}</td>
                          <td data-label="Tên người dùng">{userData.firstName} {userData.lastName}</td>
                          <td data-label="Email">{userData.email}</td>
                          <td data-label="Vai trò">
                            <span className={`${styles.roleBadge} ${getRoleClass(userData.role_id)}`}>
                              {getRoleName(userData.role_id)}
                            </span>
                          </td>
                          <td data-label="Ngày sinh">{formatDate(userData.birthday)}</td>
                          <td data-label="Thao tác">
                            <div className={styles.actionButtons}>
                              <button 
                                className={styles.editButton} 
                                title="Sửa"
                                onClick={() => handleEditUser(userData)}
                              >
                                ✏️ Sửa
                              </button>
                              <button className={styles.deleteButton} title="Xóa">
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Hiển thị {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
                    </div>
                    <div className={styles.paginationButtons}>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.active : ''}`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Quản lý vai trò</h2>
            <div className={styles.roleManagement}>
              <p>Tính năng quản lý vai trò sẽ được phát triển trong tương lai.</p>
            </div>
          </div>
        );
      case 'admin-info':
        return (
          <div className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Thông tin admin</h2>
            <div className={styles.adminInfo}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Tên đăng nhập:</label>
                  <span>{user?.username}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Họ tên:</label>
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Ngày sinh:</label>
                  <span>{user?.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Trạng thái:</label>
                  <span className={user?.isActive ? styles.active : styles.inactive}>
                    {user?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>Ngày tạo:</label>
                  <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} telsoft-gradient-static`}>
        <div className={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`${styles.container} telsoft-gradient-static`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLogo}>
            <Image
              src="/img/logo_telsoft.jpg"
              alt="TELSOFT Logo"
              width={100}
              height={40}
              className={styles.headerLogoImg}
            />
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Đăng xuất
        </button>
      </div>

      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarMenu}>
            <button 
              className={`${styles.menuItem} ${activeMenu === 'statistics' ? styles.active : ''}`}
              onClick={() => handleMenuClick('statistics')}
            >
              <span className={styles.menuIcon}>📊</span>
              <span className={styles.menuText}>Thống kê hệ thống</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'users' ? styles.active : ''}`}
              onClick={() => handleMenuClick('users')}
            >
              <span className={styles.menuIcon}>👥</span>
              <span className={styles.menuText}>Quản lý người dùng</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'roles' ? styles.active : ''}`}
              onClick={() => handleMenuClick('roles')}
            >
              <span className={styles.menuIcon}>🔐</span>
              <span className={styles.menuText}>Quản lý vai trò</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'admin-info' ? styles.active : ''}`}
              onClick={() => handleMenuClick('admin-info')}
            >
              <span className={styles.menuIcon}>👤</span>
              <span className={styles.menuText}>Thông tin admin</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.welcomeCard}>
            <h2 className={styles.welcomeTitle}>
              Chào mừng, {user.firstName} {user.lastName}!
            </h2>
            <p className={styles.welcomeText}>
              Bạn đã đăng nhập thành công vào hệ thống quản trị.
            </p>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Sửa thông tin người dùng</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseEditModal}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {editModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <span className={styles.errorMessage}>{editModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Tên đăng nhập:</label>
                <input
                  type="text"
                  name="username"
                  value={editFormData.username}
                  onChange={handleEditFormChange}
                  className={styles.formInput}
                  readOnly
                  style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  * Tên đăng nhập không thể thay đổi
                </small>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Họ:</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditFormChange}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Tên:</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditFormChange}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  name="birthday"
                  value={editFormData.birthday}
                  onChange={handleEditFormChange}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Vai trò:</label>
                <select
                  name="role_id"
                  value={editFormData.role_id}
                  onChange={handleEditFormChange}
                  className={styles.formSelect}
                >
                  <option value={1}>Admin</option>
                  <option value={2}>User</option>
                </select>
              </div>

              {/* Password fields - only show if admin can change password */}
              {editingUser && canChangePassword(editingUser) && (
                <>
                  <div className={styles.passwordSection}>
                    <h4>Đổi mật khẩu</h4>
                    <p className={styles.passwordNote}>
                      {editingUser.role_id === 2 
                        ? 'Bạn có thể đổi mật khẩu cho người dùng này mà không cần mật khẩu cũ.'
                        : 'Đổi mật khẩu của chính bạn.'
                      }
                    </p>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Mật khẩu mới:</label>
                    <input
                      type="password"
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditFormChange}
                      className={styles.formInput}
                      placeholder="Để trống nếu không muốn đổi mật khẩu"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Xác nhận mật khẩu mới:</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={editFormData.confirmPassword}
                      onChange={handleEditFormChange}
                      className={styles.formInput}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                </>
              )}

              {/* Show message if cannot change password */}
              {editingUser && !canChangePassword(editingUser) && editingUser.role_id === 1 && (
                <div className={styles.passwordRestriction}>
                  <p>⚠️ Bạn không thể đổi mật khẩu của Admin khác. Mỗi Admin chỉ có thể đổi mật khẩu của chính mình.</p>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseEditModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSaveEdit}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm người dùng mới</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseAddModal}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {addModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <span className={styles.errorMessage}>{addModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Tên đăng nhập:</label>
                <input
                  type="text"
                  name="username"
                  value={addFormData.username}
                  onChange={handleAddFormChange}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={addFormData.email}
                  onChange={handleAddFormChange}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Họ:</label>
                  <input
                    type="text"
                    name="firstName"
                    value={addFormData.firstName}
                    onChange={handleAddFormChange}
                    className={styles.formInput}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Tên:</label>
                  <input
                    type="text"
                    name="lastName"
                    value={addFormData.lastName}
                    onChange={handleAddFormChange}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Ngày sinh:</label>
                <input
                  type="date"
                  name="birthday"
                  value={addFormData.birthday}
                  onChange={handleAddFormChange}
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Vai trò:</label>
                <select
                  name="role_id"
                  value={addFormData.role_id}
                  onChange={handleAddFormChange}
                  className={styles.formSelect}
                >
                  <option value={1}>Admin</option>
                  <option value={2}>User</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Mật khẩu:</label>
                <input
                  type="password"
                  name="password"
                  value={addFormData.password}
                  onChange={handleAddFormChange}
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={addFormData.confirmPassword}
                  onChange={handleAddFormChange}
                  className={styles.formInput}
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseAddModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleAddUser}
              >
                Thêm người dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`]} ${toast.isHiding ? styles.toastHiding : ''}`}>
          <div className={styles.toastContent}>
            <span className={styles.toastIcon}>
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button 
              className={styles.toastClose}
              onClick={hideToast}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 