'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Lấy username từ localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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

  // Xác định ca trực dựa vào giờ hiện tại
  const getShift = () => {
    const hour = currentTime.getHours();
    if (hour >= 14 && hour < 22) {
      return 'Ca Chiều (14:00 - 22:00)';
    } else if (hour >= 6 && hour < 14) {
      return 'Ca Sáng (06:00 - 14:00)';
    } else {
      return 'Ca Đêm (22:00 - 06:00)';
    }
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
        <div className="d-flex align-items-center flex-grow-1 justify-content-center gap-4">
          <div className="d-flex align-items-center">
            <span className="text-muted me-2">Vai trò:</span>
            <span className="fw-medium">Nhân viên A</span>
          </div>

          <div className="d-flex align-items-center">
            <i className="bi bi-clock me-2 text-primary"></i>
            <span className="fw-medium">{getShift()}</span>
          </div>

          <div className="d-flex align-items-center">
            <span className="fw-medium">
              {formatTime(currentTime)} {formatDate(currentTime)} (GMT+7)
            </span>
          </div>
        </div>

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