'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './dashboard.module.css';
import { 
  apiService, 
  Server, 
  CreateServerData, 
  UpdateServerData,
  MonthlyWorkSchedule,
  DailySchedule,
  ShiftAssignment,
  CreateMonthlyScheduleData,
  UpdateMonthlyScheduleData,
  EmployeeRoles
} from '../lib/api';

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

interface WorkSchedule {
  id: number;
  employee_a: number;
  employee_b: number;
  employee_c: number;
  employee_d: number;
  employee_a_name?: string;
  employee_b_name?: string;
  employee_c_name?: string;
  employee_d_name?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  activation_date?: string;
}

interface CreateWorkScheduleDto {
  employee_a: number;
  employee_b: number;
  employee_c: number;
  employee_d: number;
}

// Interface Server được import từ api.ts để tránh conflict
// interface Server {
//   id: number;
//   server_name: string;
//   ip: string;
// }

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

  // Work Schedule states
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<User[]>([]);
  const [workSchedulesLoading, setWorkSchedulesLoading] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState<CreateWorkScheduleDto>({
    employee_a: 0,
    employee_b: 0,
    employee_c: 0,
    employee_d: 0
  });
  const [editScheduleFormData, setEditScheduleFormData] = useState<CreateWorkScheduleDto>({
    employee_a: 0,
    employee_b: 0,
    employee_c: 0,
    employee_d: 0
  });
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState<WorkSchedule[]>([]);
  const [addScheduleModalError, setAddScheduleModalError] = useState('');
  const [editScheduleModalError, setEditScheduleModalError] = useState('');

  // Employee search states
  const [employeeSearchA, setEmployeeSearchA] = useState('');
  const [employeeSearchB, setEmployeeSearchB] = useState('');
  const [employeeSearchC, setEmployeeSearchC] = useState('');
  const [employeeSearchD, setEmployeeSearchD] = useState('');
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [showDropdownC, setShowDropdownC] = useState(false);
  const [showDropdownD, setShowDropdownD] = useState(false);
  const [filteredEmployeesA, setFilteredEmployeesA] = useState<User[]>([]);
  const [filteredEmployeesB, setFiltereredEmployeesB] = useState<User[]>([]);
  const [filteredEmployeesC, setFilteredEmployeesC] = useState<User[]>([]);
  const [filteredEmployeesD, setFilteredEmployeesD] = useState<User[]>([]);

  // Delete User Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteModalError, setDeleteModalError] = useState('');
  const [userAssignedSchedules, setUserAssignedSchedules] = useState<WorkSchedule[]>([]);

  // Delete Schedule Modal States
  const [showDeleteScheduleModal, setShowDeleteScheduleModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<WorkSchedule | null>(null);
  const [deleteScheduleModalError, setDeleteScheduleModalError] = useState('');

  // Server Management States
  const [servers, setServers] = useState<Server[]>([]);
  const [filteredServers, setFilteredServers] = useState<Server[]>([]);
  const [serversLoading, setServersLoading] = useState(false);
  const [serverSearchTerm, setServerSearchTerm] = useState('');
  const [currentServerPage, setCurrentServerPage] = useState(1);
  const [serversPerPage] = useState(10);
  const [serverSortField, setServerSortField] = useState<keyof Server>('id');
  const [serverSortDirection, setServerSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Server Modal States
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [showEditServerModal, setShowEditServerModal] = useState(false);
  const [showDeleteServerModal, setShowDeleteServerModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);
  const [addServerFormData, setAddServerFormData] = useState<CreateServerData>({
    server_name: '',
    ip: ''
  });
  const [editServerFormData, setEditServerFormData] = useState<UpdateServerData>({
    server_name: '',
    ip: ''
  });
  const [addServerModalError, setAddServerModalError] = useState('');
  const [editServerModalError, setEditServerModalError] = useState('');
  const [deleteServerModalError, setDeleteServerModalError] = useState('');

  // Monthly Work Schedule States (Updated for new system)
  const [monthlySchedules, setMonthlySchedules] = useState<MonthlyWorkSchedule[]>([]);
  const [currentMonthlySchedule, setCurrentMonthlySchedule] = useState<MonthlyWorkSchedule | null>(null);
  const [monthlySchedulesLoading, setMonthlySchedulesLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeRoles | null>(null);
  const [employeeRolesLoading, setEmployeeRolesLoading] = useState(false);
  
  // Monthly Schedule Modal States
  const [showCreateMonthlyScheduleModal, setShowCreateMonthlyScheduleModal] = useState(false);
  const [showEditDayScheduleModal, setShowEditDayScheduleModal] = useState(false);
  const [editingDaySchedule, setEditingDaySchedule] = useState<DailySchedule | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number>(-1);
  const [createMonthlyScheduleError, setCreateMonthlyScheduleError] = useState('');
  const [editDayScheduleError, setEditDayScheduleError] = useState('');
  const [startingRole, setStartingRole] = useState<'A' | 'B' | 'C' | 'D'>('A'); // Vai trò bắt đầu ca sáng ngày 1
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render
  const [editDayScheduleData, setEditDayScheduleData] = useState<DailySchedule>({
    date: 1,
    shifts: {
      morning: { role: 'A', employee_name: '' },
      afternoon: { role: 'B', employee_name: '' },
      evening: { role: 'C', employee_name: '' }
    }
  });
  const [currentWorkSchedule, setCurrentWorkSchedule] = useState<any>(null);

  const router = useRouter();

  // Debug useEffect for currentMonthlySchedule
  useEffect(() => {
    if (currentMonthlySchedule) {
      console.log('🔍 [Frontend Debug] currentMonthlySchedule changed:', currentMonthlySchedule);
      console.log('🔍 [Frontend Debug] schedule_data type:', typeof currentMonthlySchedule.schedule_data);
      console.log('🔍 [Frontend Debug] schedule_data content:', currentMonthlySchedule.schedule_data);
      console.log('🔍 [Frontend Debug] is schedule_data array?', Array.isArray(currentMonthlySchedule.schedule_data));
      if (Array.isArray(currentMonthlySchedule.schedule_data)) {
        console.log('🔍 [Frontend Debug] schedule_data length:', currentMonthlySchedule.schedule_data.length);
      }
    } else {
      console.log('🔍 [Frontend Debug] currentMonthlySchedule is null');
    }
  }, [currentMonthlySchedule]);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isHiding: true }));
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false, isHiding: false }));
    }, 300);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
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
  }, [hideToast]);

  // Wrap functions with useCallback to prevent unnecessary re-renders
  const fetchWorkSchedules = useCallback(async () => {
    setWorkSchedulesLoading(true);
    try {
      const response = await fetch('http://localhost:3000/work-schedule');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWorkSchedules(data.data);
          setFilteredSchedules(data.data);
          console.log('✅ Đã tải thành công', data.data.length, 'ca làm việc');
        } else {
          showToast(data.message || 'Không thể tải danh sách ca làm việc', 'error');
        }
      } else {
        showToast('Lỗi server khi tải ca làm việc', 'error');
      }
    } catch (error) {
      console.error('Error fetching work schedules:', error);
      showToast('Lỗi kết nối server', 'error');
    } finally {
      setWorkSchedulesLoading(false);
    }
  }, [showToast]);

  const sortUsers = useCallback((users: User[]) => {
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
  }, [sortField, sortDirection]);

  const sortServers = useCallback((servers: Server[]) => {
    return servers.sort((a, b) => {
      const aValue = a[serverSortField];
      const bValue = b[serverSortField];
      
      if (aValue < bValue) return serverSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return serverSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [serverSortField, serverSortDirection]);

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

      // Đảm bảo token được lưu trong cookie
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
        console.log('🍪 Đã cập nhật token trong cookie từ trang dashboard');
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
      
      // Load work schedules để kiểm tra phân công khi xóa user
      fetchWorkSchedules();
    } catch (error) {
      console.error('Error parsing user info:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      router.push('/login');
    }
  }, [router, fetchWorkSchedules]);

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
      return <i className="bi bi-chevron-expand"></i>;
    }
    return sortDirection === 'asc' ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>;
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
  }, [searchTerm, users, sortUsers]);

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

  const handleMenuClick = async (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === 'users') {
      fetchUsers();
    } else if (menuId === 'work-schedule') {
      fetchWorkSchedules();
    } else if (menuId === 'server-management') {
      fetchServers();
    } else if (menuId === 'monthly-work-schedule') {
      try {
        setCurrentMonthlySchedule(null); // Reset state
        await fetchEmployeeRoles(); // Fetch vai trò nhân viên từ work_schedule
        fetchMonthlySchedule(selectedMonth, selectedYear);
      } catch (error) {
        console.error('Error loading monthly work schedule:', error);
        showToast('Có lỗi khi tải ca làm việc hàng tháng', 'error');
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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

  // Work Schedule Management Functions
  const fetchAvailableEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/work-schedule/employees/available');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableEmployees(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching available employees:', error);
    }
  };

  const handleShowAddScheduleModal = () => {
    setAddScheduleModalError('');
    setScheduleFormData({
      employee_a: 0,
      employee_b: 0,
      employee_c: 0,
      employee_d: 0
    });
    setShowAddScheduleModal(true);
    fetchAvailableEmployees();
  };

  const handleCloseAddScheduleModal = () => {
    setShowAddScheduleModal(false);
    setAddScheduleModalError('');
    setScheduleFormData({
      employee_a: 0,
      employee_b: 0,
      employee_c: 0,
      employee_d: 0
    });
    
    // Clear employee search fields
    setEmployeeSearchA('');
    setEmployeeSearchB('');
    setEmployeeSearchC('');
    setEmployeeSearchD('');
    
    // Clear dropdown states
    setShowDropdownA(false);
    setShowDropdownB(false);
    setShowDropdownC(false);
    setShowDropdownD(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScheduleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (showEditScheduleModal) {
      setEditScheduleFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setScheduleFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleFormData.employee_a) {
      setAddScheduleModalError('Vui lòng chọn ít nhất nhân viên A');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/work-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleFormData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Tạo phân công thành công!', 'success');
        handleCloseAddScheduleModal();
        fetchWorkSchedules();
      } else {
        setAddScheduleModalError(data.error || data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      setAddScheduleModalError('Lỗi kết nối server');
    }
  };

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setEditScheduleModalError('');
    setEditScheduleFormData({
      employee_a: schedule.employee_a,
      employee_b: schedule.employee_b,
      employee_c: schedule.employee_c,
      employee_d: schedule.employee_d
    });
    
    // Set employee names in search fields
    setEmployeeSearchA(schedule.employee_a_name || '');
    setEmployeeSearchB(schedule.employee_b_name || '');
    setEmployeeSearchC(schedule.employee_c_name || '');
    setEmployeeSearchD(schedule.employee_d_name || '');
    
    // Clear dropdown states
    setShowDropdownA(false);
    setShowDropdownB(false);
    setShowDropdownC(false);
    setShowDropdownD(false);
    
    setShowEditScheduleModal(true);
    fetchAvailableEmployees();
  };

  const handleCloseEditScheduleModal = () => {
    setShowEditScheduleModal(false);
    setEditingSchedule(null);
    setEditScheduleModalError('');
    
    // Clear employee search fields
    setEmployeeSearchA('');
    setEmployeeSearchB('');
    setEmployeeSearchC('');
    setEmployeeSearchD('');
    
    // Clear dropdown states
    setShowDropdownA(false);
    setShowDropdownB(false);
    setShowDropdownC(false);
    setShowDropdownD(false);
  };

  const handleUpdateSchedule = async () => {
    if (!editScheduleFormData.employee_a) {
      setEditScheduleModalError('Vui lòng chọn ít nhất nhân viên A');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/work-schedule/${editingSchedule?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editScheduleFormData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Cập nhật phân công thành công!', 'success');
        handleCloseEditScheduleModal();
        fetchWorkSchedules();
      } else {
        setEditScheduleModalError(data.error || data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      setEditScheduleModalError('Lỗi kết nối server');
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    // Find the schedule to delete
    const schedule = workSchedules.find(s => s.id === id);
    if (!schedule) {
      showToast('Không tìm thấy phân công', 'error');
      return;
    }

    // Show confirmation modal
    setScheduleToDelete(schedule);
    setShowDeleteScheduleModal(true);
    setDeleteScheduleModalError('');
  };

  const handleConfirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/work-schedule/${scheduleToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showToast('Xóa phân công thành công!', 'success');
        fetchWorkSchedules();
        setShowDeleteScheduleModal(false);
        setScheduleToDelete(null);
      } else {
        setDeleteScheduleModalError(data.error || data.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setDeleteScheduleModalError('Lỗi kết nối server');
    }
  };

  const handleCancelDeleteSchedule = () => {
    setShowDeleteScheduleModal(false);
    setScheduleToDelete(null);
    setDeleteScheduleModalError('');
  };

  // Search functionality for work schedules
  useEffect(() => {
    let filtered = workSchedules;
    
    if (scheduleSearchTerm.trim() !== '') {
      filtered = workSchedules.filter(schedule =>
        schedule.employee_a_name?.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
        schedule.employee_b_name?.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
        schedule.employee_c_name?.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
        schedule.employee_d_name?.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
        schedule.id.toString().includes(scheduleSearchTerm)
      );
    }
    
    setFilteredSchedules(filtered);
  }, [scheduleSearchTerm, workSchedules]);

  // Employee search handlers
  const handleEmployeeSearch = (searchTerm: string, position: 'A' | 'B' | 'C' | 'D') => {
    // Get currently selected employee IDs from the appropriate form data
    const currentFormData = showAddScheduleModal ? scheduleFormData : editScheduleFormData;
    const selectedEmployeeIds = [
      currentFormData.employee_a,
      currentFormData.employee_b, 
      currentFormData.employee_c,
      currentFormData.employee_d
    ].filter(id => id > 0);

    // Get current position's employee ID to exclude it from the selected list
    let currentPositionEmployeeId = 0;
    switch (position) {
      case 'A': currentPositionEmployeeId = currentFormData.employee_a; break;
      case 'B': currentPositionEmployeeId = currentFormData.employee_b; break;
      case 'C': currentPositionEmployeeId = currentFormData.employee_c; break;
      case 'D': currentPositionEmployeeId = currentFormData.employee_d; break;
    }

    // Filter available employees excluding already selected ones (except current position)
    const filtered = availableEmployees.filter(emp => {
      const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const isAlreadySelected = selectedEmployeeIds.includes(emp.id) && emp.id !== currentPositionEmployeeId;
      return matchesSearch && !isAlreadySelected;
    });

    switch (position) {
      case 'A':
        setEmployeeSearchA(searchTerm);
        setFilteredEmployeesA(filtered);
        setShowDropdownA(searchTerm.length > 0);
        break;
      case 'B':
        setEmployeeSearchB(searchTerm);
        setFiltereredEmployeesB(filtered);
        setShowDropdownB(searchTerm.length > 0);
        break;
      case 'C':
        setEmployeeSearchC(searchTerm);
        setFilteredEmployeesC(filtered);
        setShowDropdownC(searchTerm.length > 0);
        break;
      case 'D':
        setEmployeeSearchD(searchTerm);
        setFilteredEmployeesD(filtered);
        setShowDropdownD(searchTerm.length > 0);
        break;
    }
  };

  // Function to determine if dropdown should appear above input (for bottom inputs)
  const getDropdownContainerClass = (position: 'A' | 'B' | 'C' | 'D') => {
    const baseClass = styles.searchDropdownContainer;
    // For position C and D (usually near bottom), show dropdown above
    if (position === 'C' || position === 'D') {
      return `${baseClass} ${styles.dropup}`;
    }
    return baseClass;
  };

  const handleSelectEmployee = (employee: User, position: 'A' | 'B' | 'C' | 'D') => {
    const fullName = `${employee.firstName} ${employee.lastName}`;
    
    // Check if this employee is already selected in another position
    const currentFormData = showAddScheduleModal ? scheduleFormData : editScheduleFormData;
    const selectedEmployeeIds = [
      currentFormData.employee_a,
      currentFormData.employee_b, 
      currentFormData.employee_c,
      currentFormData.employee_d
    ];

    // Get current position's employee ID to allow reselecting the same employee for the same position
    let currentPositionEmployeeId = 0;
    switch (position) {
      case 'A': currentPositionEmployeeId = currentFormData.employee_a; break;
      case 'B': currentPositionEmployeeId = currentFormData.employee_b; break;
      case 'C': currentPositionEmployeeId = currentFormData.employee_c; break;
      case 'D': currentPositionEmployeeId = currentFormData.employee_d; break;
    }

    // Check if employee is already selected in another position
    if (selectedEmployeeIds.includes(employee.id) && employee.id !== currentPositionEmployeeId) {
      const errorMsg = `Nhân viên ${fullName} đã được chọn ở vị trí khác. Vui lòng chọn nhân viên khác.`;
      if (showAddScheduleModal) {
        setAddScheduleModalError(errorMsg);
      } else {
        setEditScheduleModalError(errorMsg);
      }
      return;
    }

    // Clear any previous error
    if (showAddScheduleModal) {
      setAddScheduleModalError('');
    } else {
      setEditScheduleModalError('');
    }
    
    switch (position) {
      case 'A':
        setEmployeeSearchA(fullName);
        setShowDropdownA(false);
        if (showAddScheduleModal) {
          setScheduleFormData(prev => ({ ...prev, employee_a: employee.id }));
        } else {
          setEditScheduleFormData(prev => ({ ...prev, employee_a: employee.id }));
        }
        break;
      case 'B':
        setEmployeeSearchB(fullName);
        setShowDropdownB(false);
        if (showAddScheduleModal) {
          setScheduleFormData(prev => ({ ...prev, employee_b: employee.id }));
        } else {
          setEditScheduleFormData(prev => ({ ...prev, employee_b: employee.id }));
        }
        break;
      case 'C':
        setEmployeeSearchC(fullName);
        setShowDropdownC(false);
        if (showAddScheduleModal) {
          setScheduleFormData(prev => ({ ...prev, employee_c: employee.id }));
        } else {
          setEditScheduleFormData(prev => ({ ...prev, employee_c: employee.id }));
        }
        break;
      case 'D':
        setEmployeeSearchD(fullName);
        setShowDropdownD(false);
        if (showAddScheduleModal) {
          setScheduleFormData(prev => ({ ...prev, employee_d: employee.id }));
        } else {
          setEditScheduleFormData(prev => ({ ...prev, employee_d: employee.id }));
        }
        break;
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId: number) => {
    // Prevent users from deleting themselves
    if (userId === user?.id) {
      showToast('Bạn không thể xóa tài khoản của chính mình', 'error');
      return;
    }

    // Find the user to delete
    const userToDeleteData = users.find(user => user.id === userId);
    if (!userToDeleteData) {
      showToast('Không tìm thấy người dùng', 'error');
      return;
    }

    // Check if user is assigned to any work schedules
    const assignedSchedules = workSchedules.filter(schedule => 
      schedule.employee_a === userId || 
      schedule.employee_b === userId || 
      schedule.employee_c === userId || 
      schedule.employee_d === userId
    );

    // Set the user to delete and assigned schedules
    setUserToDelete(userToDeleteData);
    setUserAssignedSchedules(assignedSchedules);
    setDeleteModalError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    // Kiểm tra lại phân công trước khi xóa
    if (userAssignedSchedules.length > 0) {
      setDeleteModalError('Không thể xóa người dùng này vì họ đang được phân công trong các phiên làm việc. Vui lòng hủy phân công trước khi xóa.');
      return;
    }

    try {
      const response = await apiService.deleteUser(userToDelete.id);

      if (response.success) {
        showToast('Xóa người dùng thành công!', 'success');
        setShowDeleteModal(false);
        setUserToDelete(null);
        setUserAssignedSchedules([]);
        fetchUsers(); // Refresh user list
      } else {
        setDeleteModalError(response.error || response.message || 'Có lỗi xảy ra khi xóa người dùng');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteModalError('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setUserAssignedSchedules([]);
    setDeleteModalError('');
  };

  // === SERVER MANAGEMENT FUNCTIONS ===

  // Fetch servers data
  const fetchServers = async () => {
    setServersLoading(true);
    try {
      const response = await apiService.getServers();
      if (response.success && response.data) {
        setServers(response.data);
        setFilteredServers(response.data);
        console.log('✅ Đã tải thành công', response.data.length, 'máy chủ');
      } else {
        console.error('Failed to fetch servers:', response.error);
        showToast('Không thể tải danh sách máy chủ. Vui lòng thử lại.', 'error');
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
      showToast('Lỗi kết nối server. Vui lòng kiểm tra server có đang chạy không.', 'error');
    } finally {
      setServersLoading(false);
    }
  };

  // Server sorting functionality
  const handleServerSort = (field: keyof Server) => {
    if (field === serverSortField) {
      setServerSortDirection(serverSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setServerSortField(field);
      setServerSortDirection('asc');
    }
  };

  const getServerSortIcon = (field: keyof Server) => {
    if (field !== serverSortField) {
      return <i className="bi bi-chevron-expand"></i>;
    }
    return serverSortDirection === 'asc' ? <i className="bi bi-chevron-up"></i> : <i className="bi bi-chevron-down"></i>;
  };

  // Server search functionality
  useEffect(() => {
    let filtered = servers;
    
    if (serverSearchTerm.trim() !== '') {
      filtered = servers.filter(server =>
        server.server_name.toLowerCase().includes(serverSearchTerm.toLowerCase()) ||
        server.ip.toLowerCase().includes(serverSearchTerm.toLowerCase()) ||
        server.id.toString().includes(serverSearchTerm)
      );
    }
    
    // Apply sorting
    filtered = sortServers(filtered);
    setFilteredServers(filtered);
    setCurrentServerPage(1);
  }, [serverSearchTerm, servers, sortServers]);

  // Server pagination
  const indexOfLastServer = currentServerPage * serversPerPage;
  const indexOfFirstServer = indexOfLastServer - serversPerPage;
  const currentServers = filteredServers.slice(indexOfFirstServer, indexOfLastServer);

  // Add Server Modal Functions
  const handleShowAddServerModal = () => {
    setShowAddServerModal(true);
    setAddServerModalError('');
    setAddServerFormData({
      server_name: '',
      ip: ''
    });
  };

  const handleCloseAddServerModal = () => {
    setShowAddServerModal(false);
    setAddServerModalError('');
    setAddServerFormData({
      server_name: '',
      ip: ''
    });
  };

  const handleAddServerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddServerFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (addServerModalError) {
      setAddServerModalError('');
    }
  };

  const handleAddServer = async () => {
    // Reset error
    setAddServerModalError('');

    // Validation
    if (!addServerFormData.server_name || !addServerFormData.ip) {
      setAddServerModalError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(addServerFormData.ip)) {
      setAddServerModalError('Địa chỉ IP không hợp lệ!');
      return;
    }

    try {
      const response = await apiService.createServer(addServerFormData);

      if (response.success) {
        showToast('Thêm máy chủ mới thành công!', 'success');
        handleCloseAddServerModal();
        fetchServers(); // Refresh the server list
      } else {
        setAddServerModalError(response.error || 'Lỗi khi thêm máy chủ mới');
      }
    } catch (error) {
      console.error('Error adding server:', error);
      setAddServerModalError('Lỗi kết nối server. Vui lòng thử lại.');
    }
  };

  // Edit Server Modal Functions
  const handleEditServer = (server: Server) => {
    setEditingServer(server);
    setEditServerModalError('');
    setEditServerFormData({
      server_name: server.server_name,
      ip: server.ip
    });
    setShowEditServerModal(true);
  };

  const handleCloseEditServerModal = () => {
    setShowEditServerModal(false);
    setEditingServer(null);
    setEditServerModalError('');
    setEditServerFormData({
      server_name: '',
      ip: ''
    });
  };

  const handleEditServerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditServerFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (editServerModalError) {
      setEditServerModalError('');
    }
  };

  const handleSaveEditServer = async () => {
    if (!editingServer) return;

    // Reset error
    setEditServerModalError('');

    // Validation
    if (!editServerFormData.server_name || !editServerFormData.ip) {
      setEditServerModalError('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(editServerFormData.ip)) {
      setEditServerModalError('Địa chỉ IP không hợp lệ!');
      return;
    }

    try {
      const response = await apiService.updateServer(editingServer.id, editServerFormData);

      if (response.success) {
        showToast('Cập nhật máy chủ thành công!', 'success');
        handleCloseEditServerModal();
        fetchServers(); // Refresh the server list
      } else {
        setEditServerModalError(response.error || 'Lỗi khi cập nhật máy chủ');
      }
    } catch (error) {
      console.error('Error updating server:', error);
      setEditServerModalError('Lỗi kết nối server. Vui lòng thử lại.');
    }
  };

  // Delete Server Modal Functions
  const handleDeleteServer = (server: Server) => {
    setServerToDelete(server);
    setDeleteServerModalError('');
    setShowDeleteServerModal(true);
  };

  const handleConfirmDeleteServer = async () => {
    if (!serverToDelete) return;

    try {
      const response = await apiService.deleteServer(serverToDelete.id);

      if (response.success) {
        showToast('Xóa máy chủ thành công!', 'success');
        setShowDeleteServerModal(false);
        setServerToDelete(null);
        fetchServers(); // Refresh server list
      } else {
        setDeleteServerModalError(response.error || 'Có lỗi xảy ra khi xóa máy chủ');
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      setDeleteServerModalError('Có lỗi xảy ra khi xóa máy chủ');
    }
  };

  const handleCancelDeleteServer = () => {
    setShowDeleteServerModal(false);
    setServerToDelete(null);
    setDeleteServerModalError('');
  };

  // === MONTHLY WORK SCHEDULE FUNCTIONS ===

  // Fetch monthly schedules
  const fetchMonthlySchedules = useCallback(async () => {
    try {
      setMonthlySchedulesLoading(true);
      const response = await apiService.getMonthlySchedules();
      if (response.success && response.data) {
        setMonthlySchedules(response.data);
      } else {
        showToast('Không thể tải danh sách phân công hàng tháng', 'error');
      }
    } catch (error) {
      console.error('Error fetching monthly schedules:', error);
      showToast('Lỗi kết nối server', 'error');
    } finally {
      setMonthlySchedulesLoading(false);
    }
  }, []);

  // Fetch specific monthly schedule - VIẾT LẠI HOÀN TOÀN
  const fetchMonthlySchedule = useCallback(async (month: number, year: number) => {
    console.log('🔍 ==========================================');
    console.log('🔍 [Frontend] BẮT ĐẦU fetchMonthlySchedule');
    console.log(`🔍 [Frontend] Input params: month=${month}, year=${year}`);
    console.log('🔍 ==========================================');
    
    try {
      // Gọi API
      console.log('🔄 [Frontend] Calling API...');
      const response = await apiService.getMonthlySchedule(month, year);
      
      console.log('📡 [Frontend] ===== API RESPONSE DEBUG =====');
      console.log('📡 [Frontend] Response:', JSON.stringify(response, null, 2));
      console.log('📡 [Frontend] Response type:', typeof response);
      console.log('📡 [Frontend] Response.success:', response?.success);
      console.log('📡 [Frontend] Response.data:', response?.data);

      if (!response) {
        console.error('❌ [Frontend] RESPONSE IS NULL');
        setCurrentMonthlySchedule(null);
        return;
      }

      if (response.success && response.data) {
        console.log('✅ [Frontend] API SUCCESS - Processing data...');
        console.log('📊 [Frontend] Raw data:', JSON.stringify(response.data, null, 2));

        let finalData = response.data;

        // Debug schedule_data chi tiết
        console.log('🔍 [Frontend] ===== SCHEDULE_DATA DEBUG =====');
        console.log('🔍 [Frontend] schedule_data:', finalData.schedule_data);
        console.log('🔍 [Frontend] Type:', typeof finalData.schedule_data);
        console.log('🔍 [Frontend] Is array:', Array.isArray(finalData.schedule_data));
        console.log('🔍 [Frontend] Is null:', finalData.schedule_data === null);
        console.log('🔍 [Frontend] Is undefined:', finalData.schedule_data === undefined);

        // LOGIC MỚI - KHÔNG PARSE JSON NỮA
        // Backend đã parse rồi, chỉ cần kiểm tra và đảm bảo là array
        if (finalData.schedule_data) {
          if (Array.isArray(finalData.schedule_data)) {
            console.log('✅ [Frontend] Already an array with length:', finalData.schedule_data.length);
            console.log('✅ [Frontend] First item:', JSON.stringify(finalData.schedule_data[0]));
          } else if (typeof finalData.schedule_data === 'string') {
            try {
              console.log('🔧 [Frontend] Parsing JSON string...');
              console.log('🔧 [Frontend] Raw string:', (finalData.schedule_data as string).substring(0, 100));
              finalData.schedule_data = JSON.parse(finalData.schedule_data);
              console.log('✅ [Frontend] JSON parsed successfully, length:', finalData.schedule_data.length);
            } catch (parseError) {
              console.error('❌ [Frontend] JSON parse failed:', parseError);
              finalData.schedule_data = [];
            }
          } else {
            console.error('❌ [Frontend] schedule_data is not array or string, type:', typeof finalData.schedule_data);
            finalData.schedule_data = [];
          }
        } else {
          console.error('❌ [Frontend] schedule_data is null/undefined');
          finalData.schedule_data = [];
        }

        console.log('🎯 [Frontend] FINAL DATA TO SET:');
        console.log('🎯 [Frontend] ID:', finalData.id);
        console.log('🎯 [Frontend] Month/Year:', finalData.month + '/' + finalData.year);
        console.log('🎯 [Frontend] schedule_data type:', typeof finalData.schedule_data);
        console.log('🎯 [Frontend] schedule_data is array:', Array.isArray(finalData.schedule_data));
        console.log('🎯 [Frontend] schedule_data length:', Array.isArray(finalData.schedule_data) ? finalData.schedule_data.length : 'NOT_ARRAY');
        console.log('🎯 [Frontend] schedule_data content:', JSON.stringify(finalData.schedule_data));
        
        setCurrentMonthlySchedule(finalData);
        console.log('✅ [Frontend] State set successfully');
        
      } else {
        console.log('⚠️ [Frontend] API returned no data or error');
        console.log('⚠️ [Frontend] Success:', response.success);
        console.log('⚠️ [Frontend] Error:', response.error);
        setCurrentMonthlySchedule(null);
      }

      console.log('🔍 ==========================================');
      console.log('🔍 [Frontend] COMPLETED fetchMonthlySchedule');
      console.log('🔍 ==========================================');
      
    } catch (error) {
      console.error('🔍 ==========================================');
      console.error('❌ [Frontend] ERROR in fetchMonthlySchedule');
      console.error('❌ [Frontend] Error:', error);
      console.error('🔍 ==========================================');
      setCurrentMonthlySchedule(null);
    }
  }, []);

  // Fetch employee roles
  const fetchEmployeeRoles = useCallback(async () => {
    try {
      setEmployeeRolesLoading(true);
      const response = await apiService.getEmployeeRoles();
      
      if (response && response.success && response.data) {
        // Validate data structure before setting
        if (response.data && typeof response.data === 'object' && response.data.employee_a_name) {
          setEmployeeRoles(response.data); // Set data, not response
        } else if (response.data && (response.data as any).data && (response.data as any).data.employee_a_name) {
          // In case data is nested
          setEmployeeRoles((response.data as any).data);
        } else {
          console.error('❌ Invalid data structure:', response.data);
          setEmployeeRoles(null);
        }
        
        // Force re-render immediately
        setForceUpdate(prev => prev + 1);
      } else {
        console.warn('⚠️ No employee roles found:', response?.error || 'No data');
        setEmployeeRoles(null);
      }
    } catch (error) {
      console.error('❌ Error fetching employee roles:', error);
      setEmployeeRoles(null);
      showToast('Không thể tải vai trò nhân viên', 'error');
    } finally {
      setEmployeeRolesLoading(false);
    }
  }, [showToast]);

  // Debug useEffect để theo dõi employeeRoles state
  /* 
  useEffect(() => {
    console.log('🔄 employeeRoles state changed:', employeeRoles);
    if (employeeRoles) {
      console.log('📋 Employee names from state:', {
        A: employeeRoles.employee_a_name,
        B: employeeRoles.employee_b_name,
        C: employeeRoles.employee_c_name,
        D: employeeRoles.employee_d_name
      });
      console.log('🔍 State keys:', Object.keys(employeeRoles));
      console.log('🔍 State type:', typeof employeeRoles);
    }
  }, [employeeRoles]);
  */

  // Handle month/year change
  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setCurrentMonthlySchedule(null); // Reset state trước khi fetch
    fetchMonthlySchedule(month, year);
  };

  // Show create monthly schedule modal
  const handleShowCreateMonthlyScheduleModal = () => {
    setShowCreateMonthlyScheduleModal(true);
    setCreateMonthlyScheduleError('');
    setStartingRole('A'); // Reset về A
    fetchEmployeeRoles(); // Fetch employee roles khi mở modal
  };

  // Close create monthly schedule modal
  const handleCloseCreateMonthlyScheduleModal = () => {
    setShowCreateMonthlyScheduleModal(false);
    setCreateMonthlyScheduleError('');
    setStartingRole('A'); // Reset về A
  };

  // Generate automatic schedule
  const handleGenerateAutoSchedule = async () => {
    console.log('🎯 [Frontend] handleGenerateAutoSchedule called');
    console.log('📋 [Frontend] Parameters:', { selectedMonth, selectedYear, startingRole });
    
    try {
      console.log('🔄 [Frontend] Calling API generateAutoSchedule...');
      const response = await apiService.generateAutoSchedule(
        selectedMonth,
        selectedYear,
        1, // created_by - should be current user ID
        startingRole // Thêm tham số startingRole
      );

      console.log('✅ [Frontend] API response:', response);

      if (response.success) {
        console.log('🎉 [Frontend] API returned success!');
        showToast('Tạo phân công tự động thành công!', 'success');
        handleCloseCreateMonthlyScheduleModal();
        
        console.log('🔄 [Frontend] Fetching updated schedule data...');
        // Refresh data để hiển thị phân công mới
        await fetchMonthlySchedule(selectedMonth, selectedYear);
        fetchMonthlySchedules();
        console.log('✅ [Frontend] Data refresh completed');
      } else {
        console.error('❌ [Frontend] API returned error:', response.error);
        setCreateMonthlyScheduleError(response.error || 'Có lỗi xảy ra khi tạo phân công');
      }
    } catch (error) {
      console.error('❌ [Frontend] Exception in handleGenerateAutoSchedule:', error);
      setCreateMonthlyScheduleError('Lỗi kết nối server');
    }
  };

  // Edit day schedule
  const handleEditDaySchedule = (daySchedule: DailySchedule, dayIndex: number) => {
    setEditingDaySchedule(daySchedule);
    setEditingDayIndex(dayIndex);
    setEditDayScheduleData({...daySchedule});
    setEditDayScheduleError('');
    setShowEditDayScheduleModal(true);
  };

  // Close edit day schedule modal
  const handleCloseEditDayScheduleModal = () => {
    setShowEditDayScheduleModal(false);
    setEditingDaySchedule(null);
    setEditingDayIndex(-1);
    setEditDayScheduleError('');
  };

  // Save day schedule
  const handleSaveDaySchedule = async () => {
    if (!currentMonthlySchedule) return;

    try {
      const updatedScheduleData = [...currentMonthlySchedule.schedule_data];
      updatedScheduleData[editingDayIndex] = editDayScheduleData;

      const response = await apiService.updateMonthlySchedule(currentMonthlySchedule.id, {
        schedule_data: updatedScheduleData
      });

      if (response.success) {
        showToast('Cập nhật ca làm việc thành công!', 'success');
        handleCloseEditDayScheduleModal();
        fetchMonthlySchedule(selectedMonth, selectedYear);
      } else {
        setEditDayScheduleError(response.error || 'Có lỗi xảy ra khi cập nhật');
      }
    } catch (error) {
      console.error('Error saving day schedule:', error);
      setEditDayScheduleError('Lỗi kết nối server');
    }
  };

  // Delete monthly schedule
  const handleDeleteMonthlySchedule = async () => {
    if (!currentMonthlySchedule) return;

    if (!confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;

    try {
      const response = await apiService.deleteMonthlySchedule(currentMonthlySchedule.id);
      if (response.success) {
        showToast('Xóa phân công thành công!', 'success');
        setCurrentMonthlySchedule(null);
        fetchMonthlySchedules();
      } else {
        showToast(response.error || 'Có lỗi xảy ra khi xóa phân công', 'error');
      }
    } catch (error) {
      console.error('Error deleting monthly schedule:', error);
      showToast('Lỗi kết nối server', 'error');
    }
  };

  // Get employee name by role
  const getEmployeeNameByRole = (role: 'A' | 'B' | 'C' | 'D'): string => {
    if (!employeeRoles) return 'Chưa phân công';
    
    switch (role) {
      case 'A': return employeeRoles.employee_a_name || 'Chưa phân công';
      case 'B': return employeeRoles.employee_b_name || 'Chưa phân công';
      case 'C': return employeeRoles.employee_c_name || 'Chưa phân công';
      case 'D': return employeeRoles.employee_d_name || 'Chưa phân công';
      default: return 'Không xác định';
    }
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // Get shift name in Vietnamese
  const getShiftName = (shift: 'morning' | 'afternoon' | 'evening'): string => {
    switch (shift) {
      case 'morning': return 'Ca sáng';
      case 'afternoon': return 'Ca chiều';
      case 'evening': return 'Ca tối';
      default: return '';
    }
  };

  // Helper function to get next role in rotation (theo logic rotation ngược)
  const getNextRole = (startRole: 'A' | 'B' | 'C' | 'D', steps: number): 'A' | 'B' | 'C' | 'D' => {
    const roles: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const startIndex = roles.indexOf(startRole);
    // Logic rotation ngược: -steps thay vì +steps
    const nextIndex = (startIndex - steps + 4) % 4;
    return roles[nextIndex];
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'statistics':
        return (
          <div className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Thống kê hệ thống</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><i className="bi bi-people-fill"></i></div>
                <div className={styles.statContent}>
                  <h3>Tổng người dùng</h3>
                  <p className={styles.statNumber}>{users.length}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><i className="bi bi-shield-check"></i></div>
                <div className={styles.statContent}>
                  <h3>Người dùng hoạt động</h3>
                  <p className={styles.statNumber}>{users.filter(u => u.isActive).length}</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><i className="bi bi-gear-fill"></i></div>
                <div className={styles.statContent}>
                  <h3>Vai trò</h3>
                  <p className={styles.statNumber}>2</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><i className="bi bi-graph-up"></i></div>
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
                  <span className={styles.searchIcon}><i className="bi bi-search"></i></span>
                </div>
                <button 
                  onClick={fetchUsers}
                  className={styles.refreshButton}
                  disabled={usersLoading}
                >
                  <span className={styles.refreshIcon}><i className="bi bi-arrow-clockwise"></i></span>
                  {usersLoading ? 'Đang tải...' : 'Làm mới'}
                </button>
                <button className={styles.addUserButton} onClick={handleShowAddModal}>
                  <span className={styles.addIcon}><i className="bi bi-person-plus-fill"></i></span>
                  Thêm người dùng mới
                </button>
              </div>
            </div>
            
            <div className={styles.userTableContainer}>
              <div className={styles.tableInfo}>
                <span>Cập nhật theo thời gian thực</span>
                <span className={styles.lastUpdate}>
                  <i className="bi bi-arrow-clockwise"></i> Cập nhật gần nhất: {new Date().toLocaleTimeString('vi-VN')}
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
                                <i className="bi bi-pencil-square"></i> Sửa
                              </button>
                              <button className={styles.deleteButton} title="Xóa" onClick={() => handleDeleteUser(userData.id)}>
                                <i className="bi bi-trash3-fill"></i> Xóa
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
      case 'work-schedule':
        return (
          <div className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Quản lý phân công</h2>
            
            <div className={styles.userManagementHeader}>
              <div className={styles.userManagementActions}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm phân công..."
                    value={scheduleSearchTerm}
                    onChange={(e) => setScheduleSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  <span className={styles.searchIcon}><i className="bi bi-search"></i></span>
                </div>
                <button 
                  className={styles.addButton}
                  onClick={handleShowAddScheduleModal}
                >
                  <span className={styles.addIcon}><i className="bi bi-plus-circle-fill"></i></span>
                  Thêm phân công
                </button>
              </div>
            </div>

            {workSchedulesLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Đang tải danh sách phân công...</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nhân viên A</th>
                      <th>Nhân viên B</th>
                      <th>Nhân viên C</th>
                      <th>Nhân viên D</th>
                      <th>Ngày tạo</th>
                      <th>Cập nhật cuối</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                          {scheduleSearchTerm ? 'Không tìm thấy phân công nào phù hợp' : 'Chưa có phân công nào'}
                        </td>
                      </tr>
                    ) : (
                      filteredSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td>{schedule.id}</td>
                          <td>{schedule.employee_a_name || 'Chưa phân công'}</td>
                          <td>{schedule.employee_b_name || 'Chưa phân công'}</td>
                          <td>{schedule.employee_c_name || 'Chưa phân công'}</td>
                          <td>{schedule.employee_d_name || 'Chưa phân công'}</td>
                          <td>{formatDateTime(schedule.created_at)}</td>
                          <td>{schedule.updated_at ? formatDateTime(schedule.updated_at) : 'Chưa cập nhật'}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.editButton}
                                onClick={() => handleEditSchedule(schedule)}
                                title="Sửa phân công"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className={styles.deleteButton}
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                title="Xóa phân công"
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
      case 'server-management':
        return (
          <div className={styles.contentSection}>
            <div className={styles.userManagementHeader}>
              <h2 className={styles.sectionTitle}>Danh sách máy chủ</h2>
              <div className={styles.userManagementActions}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên máy chủ..."
                    value={serverSearchTerm}
                    onChange={(e) => setServerSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                  <span className={styles.searchIcon}><i className="bi bi-search"></i></span>
                </div>
                <button 
                  className={styles.refreshButton}
                  onClick={fetchServers}
                  disabled={serversLoading}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  {serversLoading ? 'Đang tải...' : 'Làm mới'}
                </button>
                <button 
                  className={styles.addButton}
                  onClick={handleShowAddServerModal}
                >
                  <i className="bi bi-plus-circle"></i>
                  Thêm máy chủ
                </button>
              </div>
            </div>

            <div className={styles.userTableContainer}>
              <div className={styles.tableInfo}>
                <span>Cập nhật theo thời gian thực</span>
                <span className={styles.lastUpdate}>
                  <i className="bi bi-arrow-clockwise"></i> Cập nhật gần nhất: {new Date().toLocaleTimeString('vi-VN')}
                </span>
              </div>
              
              {serversLoading ? (
                <div className={styles.loadingTable}>Đang tải dữ liệu...</div>
              ) : (
                <>
                  <table className={styles.userTable}>
                    <thead>
                      <tr>
                        <th onClick={() => handleServerSort('id')}>
                          ID {getServerSortIcon('id')}
                        </th>
                        <th onClick={() => handleServerSort('server_name')}>
                          Tên máy chủ {getServerSortIcon('server_name')}
                        </th>
                        <th onClick={() => handleServerSort('ip')}>
                          Địa chỉ IP {getServerSortIcon('ip')}
                        </th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serversLoading ? (
                        <tr>
                          <td colSpan={4} className={styles.loadingRow}>
                            <div className={styles.loadingSpinner}></div>
                            Đang tải danh sách máy chủ...
                          </td>
                        </tr>
                      ) : currentServers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className={styles.emptyRow}>
                            {serverSearchTerm ? 'Không tìm thấy máy chủ nào phù hợp' : 'Chưa có máy chủ nào'}
                          </td>
                        </tr>
                      ) : (
                        currentServers.map((server) => (
                          <tr key={server.id}>
                            <td>{server.id}</td>
                            <td>{server.server_name}</td>
                            <td>{server.ip}</td>
                            <td>
                              <div className={styles.actionButtons}>
                                <button 
                                  className={styles.editButton}
                                  onClick={() => handleEditServer(server)}
                                  title="Chỉnh sửa máy chủ"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className={styles.deleteButton}
                                  onClick={() => handleDeleteServer(server)}
                                  title="Xóa máy chủ"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Hiển thị {indexOfFirstServer + 1} - {Math.min(indexOfLastServer, filteredServers.length)} trên tổng số {filteredServers.length} máy chủ
                    </div>
                    <div className={styles.paginationButtons}>
                      <button 
                        onClick={() => setCurrentServerPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentServerPage === 1}
                        className={styles.paginationButton}
                      >
                        <i className="bi bi-chevron-left"></i>
                        Trước
                      </button>
                      
                      <span className={styles.paginationInfo}>
                        Trang {currentServerPage} / {Math.ceil(filteredServers.length / serversPerPage)} 
                        ({filteredServers.length} máy chủ)
                      </span>
                      
                      <button 
                        onClick={() => setCurrentServerPage(prev => Math.min(prev + 1, Math.ceil(filteredServers.length / serversPerPage)))}
                        disabled={currentServerPage === Math.ceil(filteredServers.length / serversPerPage)}
                        className={styles.paginationButton}
                      >
                        Sau
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
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
      case 'servers':
        return (
          <div className={styles.content}>
            <div className={styles.serversHeader}>
              <h2>Quản lý máy chủ</h2>
              <div className={styles.serversHeaderActions}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên máy chủ..."
                    value={serverSearchTerm}
                    onChange={(e) => setServerSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <button 
                  className={styles.refreshButton}
                  onClick={fetchServers}
                  disabled={serversLoading}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  {serversLoading ? 'Đang tải...' : 'Làm mới'}
                </button>
                <button 
                  className={styles.addButton}
                  onClick={handleShowAddServerModal}
                >
                  <i className="bi bi-plus-circle"></i>
                  Thêm máy chủ
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.userTable}>
                <thead>
                  <tr>
                    <th onClick={() => handleServerSort('id')}>
                      ID {getServerSortIcon('id')}
                    </th>
                    <th onClick={() => handleServerSort('server_name')}>
                      Tên máy chủ {getServerSortIcon('server_name')}
                    </th>
                    <th onClick={() => handleServerSort('ip')}>
                      Địa chỉ IP {getServerSortIcon('ip')}
                    </th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {serversLoading ? (
                    <tr>
                      <td colSpan={4} className={styles.loadingRow}>
                        <div className={styles.loadingSpinner}></div>
                        Đang tải danh sách máy chủ...
                      </td>
                    </tr>
                  ) : currentServers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.emptyRow}>
                        {serverSearchTerm ? 'Không tìm thấy máy chủ nào phù hợp' : 'Chưa có máy chủ nào'}
                      </td>
                    </tr>
                  ) : (
                    currentServers.map((server) => (
                      <tr key={server.id}>
                        <td>{server.id}</td>
                        <td>{server.server_name}</td>
                        <td>{server.ip}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.editButton}
                              onClick={() => handleEditServer(server)}
                              title="Chỉnh sửa máy chủ"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDeleteServer(server)}
                              title="Xóa máy chủ"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredServers.length > serversPerPage && (
              <div className={styles.pagination}>
                <button 
                  onClick={() => setCurrentServerPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentServerPage === 1}
                  className={styles.paginationButton}
                >
                  <i className="bi bi-chevron-left"></i>
                  Trước
                </button>
                
                <span className={styles.paginationInfo}>
                  Trang {currentServerPage} / {Math.ceil(filteredServers.length / serversPerPage)} 
                  ({filteredServers.length} máy chủ)
                </span>
                
                <button 
                  onClick={() => setCurrentServerPage(prev => Math.min(prev + 1, Math.ceil(filteredServers.length / serversPerPage)))}
                  disabled={currentServerPage === Math.ceil(filteredServers.length / serversPerPage)}
                  className={styles.paginationButton}
                >
                  Sau
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
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
      case 'monthly-work-schedule':
        return (
          <div className={styles.contentSection}>
            <div className={styles.userManagementHeader}>
              <h2 className={styles.sectionTitle}>Ca làm việc hàng tháng</h2>
              <div className={styles.userManagementActions}>
                <div className={styles.monthYearSelector}>
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
                    className={styles.monthSelect}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tháng {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                    className={styles.yearSelect}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                {currentMonthlySchedule && currentMonthlySchedule.schedule_data && currentMonthlySchedule.schedule_data.length > 0 ? (
                  <button 
                    className={styles.deleteButton}
                    onClick={handleDeleteMonthlySchedule}
                    title="Xóa phân công tháng này"
                  >
                    <i className="bi bi-trash3"></i>
                    Xóa phân công
                  </button>
                ) : (
                  <button 
                    className={styles.addButton}
                    onClick={handleShowCreateMonthlyScheduleModal}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Tạo phân công tháng
                  </button>
                )}
              </div>
            </div>

            {monthlySchedulesLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Đang tải phân công tháng {selectedMonth}/{selectedYear}...</p>
              </div>
            ) : currentMonthlySchedule ? (
              <div className={styles.monthlyScheduleContainer}>
                <div className={styles.scheduleHeader}>
                  <h3>Phân công tháng {selectedMonth}/{selectedYear}</h3>
                  <p>Tạo ngày: {formatDateTime(currentMonthlySchedule.created_at)}</p>
                  <p>ID: {currentMonthlySchedule.id}</p>
                </div>
                
                {/* DEBUG INFO - hiển thị thông tin debug */}
                <div style={{
                  background: '#f0f8ff', 
                  padding: '10px', 
                  margin: '10px 0', 
                  border: '1px solid #007bff',
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  <strong>🔍 DEBUG INFO:</strong><br/>
                  • schedule_data type: {typeof currentMonthlySchedule.schedule_data}<br/>
                  • schedule_data is array: {Array.isArray(currentMonthlySchedule.schedule_data) ? 'YES' : 'NO'}<br/>
                  • schedule_data length: {Array.isArray(currentMonthlySchedule.schedule_data) ? (currentMonthlySchedule.schedule_data as any[]).length : 'NOT_ARRAY'}<br/>
                  • schedule_data exists: {currentMonthlySchedule.schedule_data ? 'YES' : 'NO'}<br/>
                  • Raw data: {JSON.stringify(currentMonthlySchedule.schedule_data)?.substring(0, 100)}...
                </div>
                
                <div className={styles.scheduleCalendar}>
                  {/* ĐIỀU KIỆN RENDER MỚI - ĐƠN GIẢN HÓA */}
                  {currentMonthlySchedule?.schedule_data && 
                   Array.isArray(currentMonthlySchedule.schedule_data) && 
                   currentMonthlySchedule.schedule_data.length > 0 ? (
                    <>
                      <div style={{
                        background: '#d4edda', 
                        padding: '10px', 
                        margin: '10px 0',
                        border: '1px solid #28a745',
                        borderRadius: '5px'
                      }}>
                        ✅ <strong>Tìm thấy {(currentMonthlySchedule.schedule_data as any[]).length} ngày phân công!</strong>
                      </div>
                      
                      {/* RENDER TỪNG NGÀY - ĐƠN GIẢN HÓA */}
                      {currentMonthlySchedule.schedule_data.map((daySchedule: any, index: number) => {
                        console.log(`🔍 [Render] Rendering day ${index + 1}:`, daySchedule);
                        
                        if (!daySchedule || !daySchedule.shifts) {
                          console.error(`❌ [Render] Invalid day data at index ${index}:`, daySchedule);
                          return (
                            <div key={`error-day-${index}`} style={{
                              background: '#f8d7da',
                              padding: '10px',
                              margin: '5px 0',
                              borderRadius: '5px',
                              border: '1px solid #dc3545'
                            }}>
                              Lỗi dữ liệu ngày {index + 1}
                            </div>
                          );
                        }
                        
                        return (
                          <div key={`day-${daySchedule?.date || index}`} className={styles.dayCard} style={{
                            border: '2px solid #007bff',
                            margin: '10px',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa'
                          }}>
                            <div className={styles.dayHeader}>
                              <span className={styles.dayNumber}>
                                {daySchedule?.date || (index + 1)}
                              </span>
                              <button 
                                className={styles.editDayButton}
                                onClick={() => handleEditDaySchedule(daySchedule, index)}
                                title="Chỉnh sửa ca làm việc ngày này"
                              >
                                <i className="bi bi-pencil"></i> Sửa
                              </button>
                            </div>
                            
                            <div className={styles.shiftsContainer} style={{ marginTop: '10px' }}>
                              {/* RENDER CA SÁNG */}
                              <div className={styles.shiftRow} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px',
                                margin: '5px 0',
                                backgroundColor: '#fff3cd',
                                borderRadius: '4px',
                                border: '1px solid #ffeaa7'
                              }}>
                                <span className={styles.shiftLabel} style={{ fontWeight: 'bold' }}>
                                  ☀️ Ca sáng:
                                </span>
                                <span className={styles.employeeName}>
                                  {daySchedule?.shifts?.morning?.employee_name || 'Chưa phân công'}
                                </span>
                                <span className={styles.roleInfo} style={{ color: '#666' }}>
                                  (Vai trò: {daySchedule?.shifts?.morning?.role || 'N/A'})
                                </span>
                              </div>
                              
                              {/* RENDER CA CHIỀU */}
                              <div className={styles.shiftRow} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px',
                                margin: '5px 0',
                                backgroundColor: '#d1ecf1',
                                borderRadius: '4px',
                                border: '1px solid #bee5eb'
                              }}>
                                <span className={styles.shiftLabel} style={{ fontWeight: 'bold' }}>
                                  🌅 Ca chiều:
                                </span>
                                <span className={styles.employeeName}>
                                  {daySchedule?.shifts?.afternoon?.employee_name || 'Chưa phân công'}
                                </span>
                                <span className={styles.roleInfo} style={{ color: '#666' }}>
                                  (Vai trò: {daySchedule?.shifts?.afternoon?.role || 'N/A'})
                                </span>
                              </div>
                              
                              {/* RENDER CA TỐI */}
                              <div className={styles.shiftRow} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px',
                                margin: '5px 0',
                                backgroundColor: '#d4edda',
                                borderRadius: '4px',
                                border: '1px solid #c3e6cb'
                              }}>
                                <span className={styles.shiftLabel} style={{ fontWeight: 'bold' }}>
                                  🌙 Ca tối:
                                </span>
                                <span className={styles.employeeName}>
                                  {daySchedule?.shifts?.evening?.employee_name || 'Chưa phân công'}
                                </span>
                                <span className={styles.roleInfo} style={{ color: '#666' }}>
                                  (Vai trò: {daySchedule?.shifts?.evening?.role || 'N/A'})
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className={styles.emptySchedule}>
                      <div style={{
                        background: '#f8d7da', 
                        padding: '15px', 
                        margin: '10px 0',
                        border: '1px solid #dc3545',
                        borderRadius: '5px'
                      }}>
                        <h4>❌ Không có dữ liệu phân công hiển thị</h4>
                        <p><strong>Debug info:</strong></p>
                        <ul style={{textAlign: 'left', marginLeft: '20px'}}>
                          <li>currentMonthlySchedule exists: {currentMonthlySchedule ? 'YES' : 'NO'}</li>
                          <li>schedule_data exists: {currentMonthlySchedule?.schedule_data ? 'YES' : 'NO'}</li>
                          <li>schedule_data type: {typeof currentMonthlySchedule?.schedule_data}</li>
                          <li>schedule_data is array: {Array.isArray(currentMonthlySchedule?.schedule_data) ? 'YES' : 'NO'}</li>
                          <li>schedule_data length: {Array.isArray(currentMonthlySchedule?.schedule_data) ? (currentMonthlySchedule.schedule_data as any[]).length : 'NOT_ARRAY'}</li>
                        </ul>
                        <p><strong>Kiểm tra Console để thấy chi tiết lỗi!</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.emptySchedule}>
                <div className={styles.emptyIcon}>
                  <i className="bi bi-calendar-x"></i>
                </div>
                <h3>Chưa có phân công cho tháng {selectedMonth}/{selectedYear}</h3>
                <p>Tạo phân công tự động để bắt đầu quản lý ca làm việc hàng tháng</p>
                <button 
                  className={styles.createScheduleButton}
                  onClick={handleShowCreateMonthlyScheduleModal}
                >
                  <i className="bi bi-plus-circle"></i>
                  Tạo phân công tháng
                </button>
              </div>
            )}
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
              <span className={styles.menuIcon}><i className="bi bi-bar-chart-fill"></i></span>
              <span className={styles.menuText}>Thống kê hệ thống</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'users' ? styles.active : ''}`}
              onClick={() => handleMenuClick('users')}
            >
              <span className={styles.menuIcon}><i className="bi bi-person-lines-fill"></i></span>
              <span className={styles.menuText}>Quản lý người dùng</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'work-schedule' ? styles.active : ''}`}
              onClick={() => handleMenuClick('work-schedule')}
            >
              <span className={styles.menuIcon}><i className="bi bi-people-fill"></i></span>
              <span className={styles.menuText}>Quản lý phân công</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'monthly-work-schedule' ? styles.active : ''}`}
              onClick={() => handleMenuClick('monthly-work-schedule')}
            >
              <span className={styles.menuIcon}><i className="bi bi-calendar3"></i></span>
              <span className={styles.menuText}>Ca làm việc hàng tháng</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'server-management' ? styles.active : ''}`}
              onClick={() => handleMenuClick('server-management')}
            >
              <span className={styles.menuIcon}><i className="bi bi-server"></i></span>
              <span className={styles.menuText}>Quản lý máy chủ</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'roles' ? styles.active : ''}`}
              onClick={() => handleMenuClick('roles')}
            >
              <span className={styles.menuIcon}><i className="bi bi-shield-lock-fill"></i></span>
              <span className={styles.menuText}>Quản lý vai trò</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${activeMenu === 'admin-info' ? styles.active : ''}`}
              onClick={() => handleMenuClick('admin-info')}
            >
              <span className={styles.menuIcon}><i className="bi bi-person-circle"></i></span>
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
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {editModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{editModalError}</span>
                </div>
              )}
              
              <div className={styles.formRow}>
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
              
              <div className={styles.formRow}>
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
                  
                  <div className={styles.formRow}>
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
                  </div>
                </>
              )}

              {/* Show message if cannot change password */}
              {editingUser && !canChangePassword(editingUser) && editingUser.role_id === 1 && (
                <div className={styles.passwordRestriction}>
                  <p><i className="bi bi-exclamation-triangle-fill"></i> Bạn không thể đổi mật khẩu của Admin khác. Mỗi Admin chỉ có thể đổi mật khẩu của chính mình.</p>
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
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {addModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{addModalError}</span>
                </div>
              )}
              
              <div className={styles.formRow}>
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
              
              <div className={styles.formRow}>
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
              </div>

              <div className={styles.formRow}>
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

      {/* Add Work Schedule Modal */}
      {showAddScheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm phân công mới</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseAddScheduleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {addScheduleModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{addScheduleModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Nhân viên A:</label>
                <div className={getDropdownContainerClass('A')}>
                  <input
                    type="text"
                    value={employeeSearchA}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'A')}
                    placeholder="Tìm kiếm nhân viên A..."
                    className={styles.formInput}
                  />
                  {showDropdownA && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesA.length > 0 ? (
                        filteredEmployeesA.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'A')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên B:</label>
                <div className={getDropdownContainerClass('B')}>
                  <input
                    type="text"
                    value={employeeSearchB}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'B')}
                    placeholder="Tìm kiếm nhân viên B..."
                    className={styles.formInput}
                  />
                  {showDropdownB && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesB.length > 0 ? (
                        filteredEmployeesB.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'B')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên C:</label>
                <div className={getDropdownContainerClass('C')}>
                  <input
                    type="text"
                    value={employeeSearchC}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'C')}
                    placeholder="Tìm kiếm nhân viên C..."
                    className={styles.formInput}
                  />
                  {showDropdownC && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesC.length > 0 ? (
                        filteredEmployeesC.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'C')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên D:</label>
                <div className={getDropdownContainerClass('D')}>
                  <input
                    type="text"
                    value={employeeSearchD}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'D')}
                    placeholder="Tìm kiếm nhân viên D..."
                    className={styles.formInput}
                  />
                  {showDropdownD && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesD.length > 0 ? (
                        filteredEmployeesD.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'D')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseAddScheduleModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleAddSchedule}
              >
                Thêm phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Work Schedule Modal */}
      {showEditScheduleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Sửa phân công</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseEditScheduleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {editScheduleModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{editScheduleModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Nhân viên A:</label>
                <div className={getDropdownContainerClass('A')}>
                  <input
                    type="text"
                    value={employeeSearchA}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'A')}
                    placeholder="Tìm kiếm nhân viên A..."
                    className={styles.formInput}
                  />
                  {showDropdownA && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesA.length > 0 ? (
                        filteredEmployeesA.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'A')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên B:</label>
                <div className={getDropdownContainerClass('B')}>
                  <input
                    type="text"
                    value={employeeSearchB}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'B')}
                    placeholder="Tìm kiếm nhân viên B..."
                    className={styles.formInput}
                  />
                  {showDropdownB && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesB.length > 0 ? (
                        filteredEmployeesB.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'B')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên C:</label>
                <div className={getDropdownContainerClass('C')}>
                  <input
                    type="text"
                    value={employeeSearchC}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'C')}
                    placeholder="Tìm kiếm nhân viên C..."
                    className={styles.formInput}
                  />
                  {showDropdownC && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesC.length > 0 ? (
                        filteredEmployeesC.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'C')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Nhân viên D:</label>
                <div className={getDropdownContainerClass('D')}>
                  <input
                    type="text"
                    value={employeeSearchD}
                    onChange={(e) => handleEmployeeSearch(e.target.value, 'D')}
                    placeholder="Tìm kiếm nhân viên D..."
                    className={styles.formInput}
                  />
                  {showDropdownD && (
                    <div className={styles.searchDropdown}>
                      {filteredEmployeesD.length > 0 ? (
                        filteredEmployeesD.map((employee) => (
                          <div
                            key={employee.id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEmployee(employee, 'D')}
                          >
                            {employee.firstName} {employee.lastName} ({employee.username})
                          </div>
                        ))
                      ) : (
                        <div className={styles.dropdownNoResult}>
                          Không tìm thấy kết quả trùng khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseEditScheduleModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleUpdateSchedule}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.warningIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                Xác nhận xóa người dùng
              </div>
              <button className={styles.closeButton} onClick={handleCancelDelete}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              {deleteModalError && (
                <div className={styles.errorAlert}>
                  {deleteModalError}
                </div>
              )}
              
              <p>Bạn có chắc chắn muốn xóa người dùng sau?</p>
              
              <div className={styles.userInfoBox}>
                <div><strong>Họ tên:</strong> {userToDelete.firstName} {userToDelete.lastName}</div>
                <div><strong>Tên đăng nhập:</strong> {userToDelete.username}</div>
                <div><strong>Email:</strong> {userToDelete.email}</div>
              </div>

              {/* Warning if user is assigned to work schedules */}
              {userAssignedSchedules.length > 0 && (
                <div className={styles.scheduleWarning}>
                  <div className={styles.warningTitle}>
                    <span className={styles.warningIcon}><i className="bi bi-slash-circle-fill"></i></span>
                    Không thể xóa người dùng này
                  </div>
                  <p><strong>Lý do:</strong> Người dùng này hiện đang được phân công trong {userAssignedSchedules.length} phiên làm việc:</p>
                  <ul className={styles.scheduleList}>
                    {userAssignedSchedules.map(schedule => (
                      <li key={schedule.id} className={styles.scheduleItem}>
                        <strong>ID Phiên:</strong> {schedule.id}
                        {schedule.activation_date && (
                          <>
                            {' - '}
                            <strong>Ngày kích hoạt:</strong> {new Date(schedule.activation_date).toLocaleDateString('vi-VN')}
                          </>
                        )}
                        {' - '}
                        <strong>Trạng thái:</strong> {schedule.active ? 'Đang hoạt động' : 'Không hoạt động'}
                      </li>
                    ))}
                  </ul>
                  <p className={styles.warningNote}>
                    <strong>Giải pháp:</strong> Vui lòng hủy tất cả phân công của người dùng này trước khi xóa.
                  </p>
                </div>
              )}
              
              <div className={styles.warningMessage}>
                <strong><i className="bi bi-exclamation-triangle-fill"></i> Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleCancelDelete}>
                Hủy
              </button>
              {userAssignedSchedules.length > 0 ? (
                <button className={styles.disabledButton} disabled>
                  Không thể xóa
                </button>
              ) : (
                <button className={styles.deleteConfirmButton} onClick={handleConfirmDelete}>
                  Xóa người dùng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Server Modal */}
      {showAddServerModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm máy chủ mới</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseAddServerModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {addServerModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{addServerModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Tên máy chủ:</label>
                <input
                  type="text"
                  name="server_name"
                  value={addServerFormData.server_name}
                  onChange={handleAddServerFormChange}
                  className={styles.formInput}
                  placeholder="Nhập tên máy chủ"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Địa chỉ IP:</label>
                <input
                  type="text"
                  name="ip"
                  value={addServerFormData.ip}
                  onChange={handleAddServerFormChange}
                  className={styles.formInput}
                  placeholder="Nhập địa chỉ IP (ví dụ: 192.168.1.100)"
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseAddServerModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleAddServer}
              >
                Thêm máy chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Server Modal */}
      {showEditServerModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Sửa thông tin máy chủ</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseEditServerModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {editServerModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{editServerModalError}</span>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label>Tên máy chủ:</label>
                <input
                  type="text"
                  name="server_name"
                  value={editServerFormData.server_name}
                  onChange={handleEditServerFormChange}
                  className={styles.formInput}
                  placeholder="Nhập tên máy chủ"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Địa chỉ IP:</label>
                <input
                  type="text"
                  name="ip"
                  value={editServerFormData.ip}
                  onChange={handleEditServerFormChange}
                  className={styles.formInput}
                  placeholder="Nhập địa chỉ IP (ví dụ: 192.168.1.100)"
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseEditServerModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSaveEditServer}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Server Confirmation Modal */}
      {showDeleteServerModal && serverToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.warningIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                Xác nhận xóa máy chủ
              </div>
              <button className={styles.closeButton} onClick={handleCancelDeleteServer}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              {deleteServerModalError && (
                <div className={styles.errorAlert}>
                  {deleteServerModalError}
                </div>
              )}
              
              <p>Bạn có chắc chắn muốn xóa máy chủ sau?</p>
              
              <div className={styles.userInfoBox}>
                <div><strong>Tên máy chủ:</strong> {serverToDelete.server_name}</div>
                <div><strong>Địa chỉ IP:</strong> {serverToDelete.ip}</div>
              </div>
              
              <div className={styles.warningMessage}>
                <strong><i className="bi bi-exclamation-triangle-fill"></i> Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleCancelDeleteServer}>
                Hủy
              </button>
              <button className={styles.deleteConfirmButton} onClick={handleConfirmDeleteServer}>
                Xóa máy chủ
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
              {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
              {toast.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
              {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
            </span>
            <span className={styles.toastMessage}>{toast.message}</span>
            <button 
              className={styles.toastClose}
              onClick={hideToast}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Delete Schedule Confirmation Modal */}
      {showDeleteScheduleModal && scheduleToDelete && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.deleteScheduleModal}`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.warningIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                Xác nhận xóa phân công
              </div>
              <button className={styles.closeButton} onClick={handleCancelDeleteSchedule}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              {deleteScheduleModalError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{deleteScheduleModalError}</span>
                </div>
              )}
              
              <p>Bạn có chắc chắn muốn xóa phân công này?</p>
              
              <div className={styles.userInfoBox}>
                <div><strong>ID Phân công:</strong> {scheduleToDelete.id}</div>
                <div><strong>Nhân viên A:</strong> {scheduleToDelete.employee_a_name || 'Không xác định'}</div>
                <div><strong>Nhân viên B:</strong> {scheduleToDelete.employee_b_name || 'Không xác định'}</div>
                <div><strong>Nhân viên C:</strong> {scheduleToDelete.employee_c_name || 'Không xác định'}</div>
                <div><strong>Nhân viên D:</strong> {scheduleToDelete.employee_d_name || 'Không xác định'}</div>
                <div><strong>Trạng thái:</strong> {scheduleToDelete.active ? 'Đang hoạt động' : 'Không hoạt động'}</div>
                <div><strong>Ngày tạo:</strong> {formatDateTime(scheduleToDelete.created_at)}</div>
              </div>
              
              <div className={styles.warningMessage}>
                <strong><i className="bi bi-exclamation-triangle-fill"></i> Cảnh báo:</strong> Hành động này không thể hoàn tác!
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={handleCancelDeleteSchedule}>
                Hủy
              </button>
              <button className={styles.deleteConfirmButton} onClick={handleConfirmDeleteSchedule}>
                Xóa phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Monthly Schedule Modal */}
      {showCreateMonthlyScheduleModal && (
        <div className={styles.modalOverlay} key={employeeRoles ? 'with-data' : 'no-data'}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Tạo phân công tháng {selectedMonth}/{selectedYear}</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseCreateMonthlyScheduleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {createMonthlyScheduleError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{createMonthlyScheduleError}</span>
                </div>
              )}
              
              <div className={styles.scheduleInfo}>
                <p><strong>Tháng:</strong> {selectedMonth}/{selectedYear}</p>
                <p><strong>Số ngày:</strong> {getDaysInMonth(selectedMonth, selectedYear)} ngày</p>
                <p><strong>Ca làm việc:</strong> Ca sáng, Ca chiều, Ca tối</p>
              </div>

              {/* Debug info */}
              {/* {process.env.NODE_ENV === 'development' && (
                <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
                  <strong>Debug:</strong><br />
                  employeeRolesLoading: {employeeRolesLoading.toString()}<br />
                  employeeRoles: {employeeRoles ? 'có dữ liệu' : 'null'}<br />
                  {employeeRoles && (
                    <>
                      A: {employeeRoles.employee_a_name || 'undefined'}<br />
                      B: {employeeRoles.employee_b_name || 'undefined'}<br />
                      C: {employeeRoles.employee_c_name || 'undefined'}<br />
                      D: {employeeRoles.employee_d_name || 'undefined'}<br />
                      Raw data: {JSON.stringify(employeeRoles)}<br />
                      Property check A: {typeof employeeRoles.employee_a_name} = "{employeeRoles.employee_a_name}"<br />
                      Property check B: {typeof employeeRoles.employee_b_name} = "{employeeRoles.employee_b_name}"<br />
                      Bracket access A: {employeeRoles['employee_a_name']}<br />
                      Bracket access B: {employeeRoles['employee_b_name']}<br />
                      Object keys: {Object.keys(employeeRoles).join(', ')}<br />
                      Direct access test: {employeeRoles.employee_a_name ? 'HAS VALUE' : 'NO VALUE'}<br />
                      State reference: {employeeRoles === null ? 'NULL' : 'NOT NULL'}<br />
                      Condition check: {(employeeRoles.employee_a_name || employeeRoles.employee_b_name || employeeRoles.employee_c_name || employeeRoles.employee_d_name) ? 'TRUE' : 'FALSE'}
                    </>
                  )}
                </div>
              )} */}

              {/* Thông tin về phân công hiện tại */}
              <div className={styles.formGroup}>
                <label>
                  <i className="bi bi-info-circle"></i>
                  Lưu ý quan trọng:
                </label>
                <div className={styles.scheduleNote}>
                  <p>
                    Phân công vai trò A, B, C, D được thiết lập từ phần <strong>"Quản lý phân công"</strong>. 
                    Nếu bạn muốn thay đổi nhân viên đảm nhận các vai trò này, vui lòng:
                  </p>
                  <ol>
                    <li>Vào menu <strong>"Quản lý phân công"</strong></li>
                    <li>Chỉnh sửa hoặc tạo phân công mới với nhân viên mong muốn</li>
                    <li>Quay lại đây để tạo ca làm việc hàng tháng</li>
                  </ol>
                </div>
              </div>

              {employeeRolesLoading ? (
                <div className={styles.formGroup}>
                  <label>Vai trò nhân viên hiện tại:</label>
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải vai trò nhân viên...</p>
                  </div>
                </div>
              ) : employeeRoles && (employeeRoles.employee_a_name || employeeRoles.employee_b_name || employeeRoles.employee_c_name || employeeRoles.employee_d_name) ? (
                <div className={styles.formGroup}>
                  <label>Vai trò nhân viên hiện tại:</label>
                  <div className={styles.employeeRolesContainer}>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò A:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_a_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò B:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_b_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò C:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_c_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò D:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_d_name || 'Chưa phân công'}</span>
                    </div>
                  </div>
                </div>
              ) : employeeRoles ? (
                <div className={styles.formGroup}>
                  <label>Vai trò nhân viên hiện tại:</label>
                  <div className={styles.employeeRolesContainer}>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò A:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_a_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò B:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_b_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò C:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_c_name || 'Chưa phân công'}</span>
                    </div>
                    <div className={styles.roleItem}>
                      <span className={styles.roleLabel}>Vai trò D:</span>
                      <span className={styles.employeeName}>{employeeRoles.employee_d_name || 'Chưa phân công'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Vai trò nhân viên hiện tại:</label>
                  <div className={styles.errorAlert}>
                    <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                    <span className={styles.errorMessage}>
                      Chưa có phân công vai trò A,B,C,D nào. 
                      <br />
                      Vui lòng vào <strong>"Quản lý phân công"</strong> để thiết lập phân công vai trò trước khi tạo ca làm việc hàng tháng.
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Chọn vai trò làm ca sáng ngày 1:</label>
                <select
                  value={startingRole}
                  onChange={(e) => setStartingRole(e.target.value as 'A' | 'B' | 'C' | 'D')}
                  className={styles.formSelect}
                  disabled={!employeeRoles}
                >
                  <option value="A">Vai trò A - {employeeRoles?.employee_a_name || 'Chưa phân công'}</option>
                  <option value="B">Vai trò B - {employeeRoles?.employee_b_name || 'Chưa phân công'}</option>
                  <option value="C">Vai trò C - {employeeRoles?.employee_c_name || 'Chưa phân công'}</option>
                  <option value="D">Vai trò D - {employeeRoles?.employee_d_name || 'Chưa phân công'}</option>
                </select>
              </div>

              <div className={styles.scheduleNote}>
                <div className={styles.noteTitle}>
                  <i className="bi bi-info-circle"></i>
                  Quy tắc phân công tự động:
                </div>
                {startingRole && employeeRoles ? (
                  <ul>
                    <li>Ngày 1: {startingRole} (sáng), {getNextRole(startingRole, -1)} (chiều), {getNextRole(startingRole, -2)} (tối) - {getNextRole(startingRole, -3)} nghỉ</li>
                    <li>Ngày 2: {getNextRole(startingRole, -3)} (sáng), {startingRole} (chiều), {getNextRole(startingRole, -1)} (tối) - {getNextRole(startingRole, -2)} nghỉ</li>
                    <li>Ngày 3: {getNextRole(startingRole, -2)} (sáng), {getNextRole(startingRole, -3)} (chiều), {startingRole} (tối) - {getNextRole(startingRole, -1)} nghỉ</li>
                    <li>Ngày 4: {getNextRole(startingRole, -1)} (sáng), {getNextRole(startingRole, -2)} (chiều), {getNextRole(startingRole, -3)} (tối) - {startingRole} nghỉ</li>
                    <li>Chu kỳ 4 ngày sẽ lặp lại cho đến hết tháng</li>
                  </ul>
                ) : (
                  <p>Vui lòng thiết lập phân công vai trò A,B,C,D trước trong "Quản lý phân công"</p>
                )}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseCreateMonthlyScheduleModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleGenerateAutoSchedule}
                disabled={!employeeRoles}
              >
                Tạo phân công tự động
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Day Schedule Modal */}
      {showEditDayScheduleModal && editingDaySchedule && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Chỉnh sửa ca làm việc - Ngày {editingDaySchedule.date}/{selectedMonth}/{selectedYear}</h3>
              <button 
                className={styles.closeButton}
                onClick={handleCloseEditDayScheduleModal}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {editDayScheduleError && (
                <div className={styles.errorAlert}>
                  <span className={styles.errorIcon}><i className="bi bi-exclamation-triangle-fill"></i></span>
                  <span className={styles.errorMessage}>{editDayScheduleError}</span>
                </div>
              )}
              
              {(['morning', 'afternoon', 'evening'] as const).map(shiftType => (
                <div key={shiftType} className={styles.formGroup}>
                  <label>{getShiftName(shiftType)}:</label>
                  <select
                    value={editDayScheduleData.shifts[shiftType].role || ''}
                    onChange={(e) => {
                      const role = e.target.value as 'A' | 'B' | 'C' | 'D';
                      setEditDayScheduleData(prev => ({
                        ...prev,
                        shifts: {
                          ...prev.shifts,
                          [shiftType]: {
                            role: role,
                            employee_name: role ? getEmployeeNameByRole(role) : ''
                          }
                        }
                      }));
                    }}
                    className={styles.formSelect}
                  >
                    <option value="">Chưa phân công</option>
                    <option value="A">Vai trò A - {employeeRoles?.employee_a_name || 'Chưa phân công'}</option>
                    <option value="B">Vai trò B - {employeeRoles?.employee_b_name || 'Chưa phân công'}</option>
                    <option value="C">Vai trò C - {employeeRoles?.employee_c_name || 'Chưa phân công'}</option>
                    <option value="D">Vai trò D - {employeeRoles?.employee_d_name || 'Chưa phân công'}</option>
                  </select>
                </div>
              ))}

              <div className={styles.scheduleNote}>
                <div className={styles.noteTitle}>
                  <i className="bi bi-exclamation-triangle"></i>
                  Lưu ý:
                </div>
                <p>Việc thay đổi ca làm việc có thể ảnh hưởng đến lịch trình của nhân viên. Vui lòng thông báo cho nhân viên về sự thay đổi.</p>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={handleCloseEditDayScheduleModal}
              >
                Hủy
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSaveDaySchedule}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 