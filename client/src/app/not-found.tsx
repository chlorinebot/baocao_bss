'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <img 
            src="/img/logo_telsoft.jpg" 
            alt="TELSOFT" 
            className={styles.logo}
          />
        </div>

        {/* 404 Animation */}
        <div className={styles.errorSection}>
          <div className={styles.errorNumber}>
            <span className={styles.digit}>4</span>
            <span className={styles.digit}>0</span>
            <span className={styles.digit}>4</span>
          </div>
          
          <div className={styles.errorIcon}>
            <div className={styles.face}>
              <div className={styles.eye}></div>
              <div className={styles.eye}></div>
              <div className={styles.mouth}></div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className={styles.messageSection}>
          <h1 className={styles.title}>Oops! Trang không tồn tại</h1>
          <p className={styles.description}>
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
          </p>
          
          {/* Countdown */}
          <div className={styles.countdown}>
            <p>Tự động chuyển về trang chủ sau <span className={styles.timer}>{countdown}</span> giây</p>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            onClick={handleGoHome}
            className={styles.primaryButton}
          >
            <span>🏠</span>
            Về trang chủ
          </button>
          
          <button 
            onClick={handleGoBack}
            className={styles.secondaryButton}
          >
            <span>↩️</span>
            Quay lại
          </button>
        </div>

        {/* Suggestions */}
        <div className={styles.suggestions}>
          <h3>Có thể bạn đang tìm:</h3>
          <ul>
            <li>
              <a href="/" className={styles.suggestionLink}>
                🏠 Trang chủ
              </a>
            </li>
            <li>
              <a href="/login" className={styles.suggestionLink}>
                🔐 Đăng nhập
              </a>
            </li>
            <li>
              <a href="/register" className={styles.suggestionLink}>
                📝 Đăng ký
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
      </div>
    </div>
  );
} 