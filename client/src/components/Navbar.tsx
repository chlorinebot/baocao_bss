'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Thêm interface cho props
interface ShiftInfo {
  shift: string;
  time: string;
  status: 'loading' | 'working' | 'not-working' | 'off' | 'not-assigned' | 'assigned';
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role_id: number;
}

interface NavbarProps {
  userInfo?: UserInfo;
  userRole?: string;
  shiftInfo?: ShiftInfo;
  showUserInfo?: boolean;
}

export default function Navbar({ 
  userInfo, 
  userRole, 
  shiftInfo, 
  showUserInfo = true 
}: NavbarProps = {}) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [localUserInfo, setLocalUserInfo] = useState<UserInfo | null>(null);
  const [localUserRole, setLocalUserRole] = useState<string>('');
  const [localShiftInfo, setLocalShiftInfo] = useState<ShiftInfo | null>(null);

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Nếu không có props, lấy thông tin từ localStorage và API
    if (!userInfo && showUserInfo) {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        try {
          const parsedUserInfo = JSON.parse(userInfoStr);
          setLocalUserInfo(parsedUserInfo);
          
          // Lấy thông tin vai trò và ca làm việc
          fetchUserRoleAndShift(parsedUserInfo.id);
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
      }
    }

    return () => clearInterval(timer);
  }, [userInfo, showUserInfo]);

  // Hàm lấy thông tin vai trò và ca làm việc
  const fetchUserRoleAndShift = async (userId: number) => {
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:3000`;
      // Lấy vai trò
      const roleResponse = await fetch(`${BASE}/work-schedule/user/${userId}/role`);
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        if (roleData.success) {
          setLocalUserRole(roleData.data.role || 'Chưa được phân công');
        }
      }

      // Kiểm tra quyền tạo báo cáo để lấy thông tin ca làm việc chi tiết
      const token = localStorage.getItem('token');
      const permissionResponse = await fetch(`/api/reports/can-create/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (permissionResponse.ok) {
        const permissionData = await permissionResponse.json();
        setLocalShiftInfo({
          shift: permissionData.currentShift || 'Chưa được phân công',
          time: permissionData.shiftTime || '',
          status: permissionData.isWorkingTime ? 'working' : 
                  permissionData.canCreate ? 'assigned' : 'not-working'
        });
      }
    } catch (error) {
      console.error('Error fetching user role and shift:', error);
      setLocalUserRole('Chưa được phân công');
      setLocalShiftInfo({
        shift: 'Không xác định',
        time: '',
        status: 'not-assigned'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    
    // Xóa cookie token
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    console.log('🍪 Đã xóa token cookie khi đăng xuất');
    
    router.push('/login');
  };

  // Format thời gian
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Format ngày tháng
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Lấy thông tin hiển thị từ props hoặc local state
  const displayUserInfo = userInfo || localUserInfo;
  const displayUserRole = userRole || localUserRole;
  const displayShiftInfo = shiftInfo || localShiftInfo;

  // Hàm hiển thị thông tin ca làm việc
  const renderShiftInfo = () => {
    if (!displayShiftInfo) {
      return (
        <div className="d-flex align-items-center">
          <i className="bi bi-clock me-2 text-muted"></i>
          <span className="text-muted">Đang tải thông tin ca...</span>
        </div>
      );
    }

    const { shift, time, status } = displayShiftInfo;
    
    // Màu sắc theo trạng thái
    const getStatusColor = () => {
      switch (status) {
        case 'working': return '#28a745'; // xanh lá
        case 'not-working': return '#dc3545'; // đỏ
        case 'assigned': return '#007bff'; // xanh dương
        case 'off': return '#6c757d'; // xám
        case 'loading': return '#ffc107'; // vàng
        default: return '#6c757d'; // xám
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'working': return '- Đang trong ca';
        case 'not-working': return '- Chưa đến giờ';
        case 'assigned': return '- Đã được phân công';
        case 'off': return '- Đang nghỉ';
        case 'loading': return '- Đang kiểm tra';
        default: return '';
      }
    };

    return (
      <div className="d-flex align-items-center">
        <i className="bi bi-clock me-2 text-primary"></i>
        <span className="fw-medium me-2">{shift}</span>
        {time && <span className="text-muted me-2">({time})</span>}
        <span 
          className="fw-medium" 
          style={{ color: getStatusColor(), fontSize: '0.9em' }}
        >
          {getStatusText()}
        </span>
      </div>
    );
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm">
      <div className="container-fluid px-4">
        {/* Logo */}
        <Link href="/dashboard" className="navbar-brand">
          <div className="d-flex align-items-center">
            <Image
              src="/img/logo_telsoft.jpg"
              alt="TELSOFT Logo"
              width={200}
              height={40}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>

        {/* Thông tin ca trực và thời gian */}
        {showUserInfo && (
          <div className="d-flex align-items-center flex-grow-1 justify-content-center gap-4">
            <div className="d-flex align-items-center">
              <span className="text-muted me-2">Vai trò:</span>
              <span className="fw-medium">{displayUserRole || 'Đang tải...'}</span>
            </div>

            {renderShiftInfo()}

            <div className="d-flex align-items-center">
              <span className="fw-medium">
                {formatTime(currentTime)} {formatDate(currentTime)} (GMT+7)
              </span>
            </div>
          </div>
        )}

        {/* Nút đăng xuất */}
        <button
          onClick={handleLogout}
          className="btn btn-danger ms-3"
        >
          Đăng Xuất
        </button>
      </div>
    </nav>
  );
} 