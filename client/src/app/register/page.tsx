'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import { apiService, type RegisterData } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthday: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeResponsibility, setAgreeResponsibility] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
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
        } catch (error) {
          // Nếu userInfo không hợp lệ, xóa token
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [router]);

  // Hiển thị loading trong khi kiểm tra auth
  if (isCheckingAuth) {
    return (
      <div className={`${styles.container} telsoft-gradient-static`}>
        <div className={styles.registerCard}>
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
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    // Reset errors
    setError('');

    // Validate required fields
    if (!formData.firstName.trim()) {
      setError('Vui lòng nhập họ');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Vui lòng nhập tên');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không đúng định dạng');
      return false;
    }

    // Validate username (không có khoảng trắng, ít nhất 3 ký tự)
    if (formData.username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return false;
    }
    if (formData.username.includes(' ')) {
      setError('Tên đăng nhập không được chứa khoảng trắng');
      return false;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Validate password confirmation
    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    // Validate agreement checkboxes
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản và dịch vụ');
      return false;
    }

    if (!agreeResponsibility) {
      setError('Vui lòng xác nhận chịu trách nhiệm với hành vi của mình');
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
    setSuccess('');
    setIsRedirecting(false);

    try {
      // Prepare data for API (remove empty birthday if not provided)
      const submitData: RegisterData = {
        ...formData,
        birthday: formData.birthday || undefined
      };

      const response = await apiService.register(submitData);

      if (response.success) {
        setIsRedirecting(true);
        setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        
        // Redirect đến login page với query parameter
        setTimeout(() => {
          router.push('/login?from=register');
        }, 2000);
      } else {
        setError(response.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Có lỗi không mong muốn xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} telsoft-gradient-static`}>
      <div className={styles.registerCard}>
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
          <h1 className={styles.title}>Đăng Ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success && (
            <div className={`${styles.success} ${isRedirecting ? styles.redirecting : ''}`}>
              {success}
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.label}>
                Họ *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập họ"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Tên *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập tên"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Tên đăng nhập *
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
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="birthday" className={styles.label}>
              Ngày sinh
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Mật khẩu *
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
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Nhập lại mật khẩu"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.agreementSection}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={styles.checkbox}
                disabled={isLoading}
              />
              <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                Tôi đồng ý với <span className={styles.termsLink}>điều khoản và dịch vụ</span> của phần mềm này
              </label>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="agreeResponsibility"
                checked={agreeResponsibility}
                onChange={(e) => setAgreeResponsibility(e.target.checked)}
                className={styles.checkbox}
                disabled={isLoading}
              />
              <label htmlFor="agreeResponsibility" className={styles.checkboxLabel}>
                Tôi đồng ý chịu trách nhiệm với mọi thứ tôi gây ra sau khi đăng ký
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            <i className="bi bi-person-plus-fill"></i>
            {isLoading ? 'Đang đăng ký...' : '  Đăng Ký'}
          </button>

          <div className={styles.footer}>
            <p className={styles.linkText}>
              Đã có tài khoản?{' '}
              <Link href="/login" className={styles.link}>
                Đăng nhập ngay
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