'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './login.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo);
          // Chuyển hướng dựa trên role
          if (user.role_id === 1) {
            router.push('/dashboard');
          } else {
            router.push('/user');
          }
          return;
        } catch {
          // Nếu userInfo không hợp lệ, xóa token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthStatus();

    // Kiểm tra nếu user vừa được redirect từ register page
    const fromRegister = searchParams.get('from') === 'register';
    if (fromRegister) {
      setWelcomeMessage('Chào mừng! Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập!');
      // Clear welcome message sau 10 giây
      setTimeout(() => {
        setWelcomeMessage('');
      }, 10000);
    }
  }, [searchParams, router]);

  // Hiển thị loading trong khi kiểm tra auth
  if (isCheckingAuth) {
    return (
      <div className={`${styles.container} telsoft-gradient-static`}>
        <div className={styles.loginCard}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang kiểm tra trạng thái đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    
    if (formData.username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }
    
    if (formData.password.trim().length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Trim whitespace from inputs
      const trimmedData = {
        username: formData.username.trim(),
        password: formData.password.trim()
      };

      console.log('🚀 Đang gửi request đăng nhập...');
      
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Response nhận được:', data);

      if (data.success) {
        console.log('✅ Đăng nhập thành công!');
        
        // Lưu token và thông tin user
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        
        // Chuyển hướng dựa trên role
        if (data.user.role_id === 1) {
          router.push('/dashboard');
        } else {
          router.push('/user');
        }
      } else {
        console.log('❌ Đăng nhập thất bại:', data.message);
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Lỗi khi đăng nhập:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.');
        } else if (error.message.includes('HTTP error')) {
          setError('Server đang gặp sự cố. Vui lòng thử lại sau.');
        } else {
          setError('Có lỗi xảy ra. Vui lòng thử lại.');
        }
      } else {
        setError('Lỗi không xác định. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} telsoft-gradient-static`}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <Image
              src="/img/logo_telsoft.jpg"
              alt="TELSOFT Logo"
              width={140}
              height={56}
              className={styles.headerLogo}
              priority
            />
          </div>
          <h1 className={styles.title}>Đăng Nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại!</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {welcomeMessage && (
            <div className={styles.welcome}>
              {welcomeMessage}
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            <i className="bi bi-box-arrow-in-right"></i>
            {isLoading ? 'Đang đăng nhập...' : ' Đăng Nhập'}
          </button>

          <div className={styles.footer}>
          <p className={styles.linkText}>
            Bằng cách đăng nhập vào đây, bạn đã chấp nhận 
            <Link href="/dieu-khoan-dich-vu" className={styles.link}> điều khoản và dịch vụ</Link> của phần mềm này!
            </p>
          <p className={styles.linkText}>
            Bạn quên mật khẩu? Vui lòng liên hệ đến quản trị viên để được cấp lại mật khẩu.
            </p>
            <p className={styles.linkText}>
              Chưa có tài khoản?{' '}
              <Link href="/register" className={styles.link}>
                Đăng ký ngay
              </Link>
            </p>
          </div>
          
        </form>
      </div>
      <footer>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={`${styles.container} telsoft-gradient-static`}>
        <div className={styles.loginCard}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 