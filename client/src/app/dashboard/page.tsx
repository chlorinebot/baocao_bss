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
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Giả lập fetch user data (sẽ cần implement API ở server)
    const fetchUserData = async () => {
      try {
        // Tạm thời sử dụng dữ liệu mẫu
        setUser({
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          birthday: '1990-01-01',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
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
          <h1 className={styles.title}>Dashboard</h1>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Đăng xuất
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.welcomeCard}>
          <h2 className={styles.welcomeTitle}>
            Chào mừng, {user.firstName} {user.lastName}!
          </h2>
          <p className={styles.welcomeText}>
            Bạn đã đăng nhập thành công vào hệ thống.
          </p>
        </div>

        <div className={styles.userInfo}>
          <h3 className={styles.sectionTitle}>Thông tin tài khoản</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Tên đăng nhập:</label>
              <span>{user.username}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Họ tên:</label>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Ngày sinh:</label>
              <span>{user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Trạng thái:</label>
              <span className={user.isActive ? styles.active : styles.inactive}>
                {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Ngày tạo:</label>
              <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 