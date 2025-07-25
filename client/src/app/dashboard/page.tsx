'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './dashboard.module.css';
import { apiService, Server, CreateServerData, UpdateServerData } from '../lib/api';

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

  const router = useRouter();

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

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId === 'users') {
      fetchUsers();
    } else if (menuId === 'work-schedule') {
      fetchWorkSchedules();
    } else if (menuId === 'server-management') {
      fetchServers();
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
    </div>
  );
} 