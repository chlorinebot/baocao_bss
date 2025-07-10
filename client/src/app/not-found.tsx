'use client';

import Link from 'next/link';
import styles from './not-found.module.css';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [countdown, setCountdown] = useState(30);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.container}>
      {/* Background Animation */}
      <div className={styles.backgroundAnimation}>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
        <div className={styles.floatingShape}></div>
      </div>

      {/* Interactive Cursor */}
      <div 
        className={styles.cursor}
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
        }}
      ></div>

      <div className={styles.content}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <img
              src="/img/logo_telsoft.jpg"
              alt="TELSOFT Logo"
              className={styles.logo}
              onError={(e) => {
                console.log('Logo load error:', e);
                // Fallback to text logo if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = 'TELSOFT';
                fallback.className = styles.logoFallback;
                target.parentNode?.appendChild(fallback);
              }}
              onLoad={() => {
                console.log('Logo loaded successfully');
              }}
            />
          </div>
        </div>

        {/* Error Section */}
        <div className={styles.errorSection}>
          <div className={styles.errorNumber}>
            <span className={styles.digit}>4</span>
            <span className={styles.digit}>0</span>
            <span className={styles.digit}>4</span>
          </div>
          
          {/* Animated Error Icon */}
          <div className={styles.errorIcon}>
            <div className={styles.face}>
              <div className={styles.eye}></div>
              <div className={styles.eye}></div>
              <div className={styles.mouth}></div>
            </div>
          </div>

          {/* Glitch Effect */}
          <div className={styles.glitchOverlay}>
            <span className={styles.glitchText}>ERROR</span>
            <span className={styles.glitchText}>ERROR</span>
            <span className={styles.glitchText}>ERROR</span>
          </div>
        </div>

        {/* Message Section */}
        <div className={styles.messageSection}>
          <h1 className={styles.title}>
            <span className={styles.titleWord}>Trang</span>
            <span className={styles.titleWord}>không</span>
            <span className={styles.titleWord}>tồn</span>
            <span className={styles.titleWord}>tại</span>
          </h1>
          <p className={styles.description}>
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
            <br />
            <span className={styles.subDescription}>Đừng lo lắng, chúng tôi sẽ giúp bạn tìm đường về!</span>
          </p>
          
          {/* Auto redirect countdown */}
          <div className={styles.countdown}>
            <p>Tự động chuyển hướng về trang chủ sau</p>
            <div className={styles.timer}>
              <i className="bi bi-arrow-clockwise"></i>
              <span>{countdown}</span>
              <span>giây</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            <i className="bi bi-house-door"></i>
            Về trang chủ
            <div className={styles.buttonRipple}></div>
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            <i className="bi bi-box-arrow-in-right"></i>
            Đăng nhập
            <div className={styles.buttonRipple}></div>
          </Link>
        </div>

        {/* Suggestions */}
        <div className={styles.suggestions}>
          <h3>
            <i className="bi bi-lightbulb"></i>
            Có thể bạn đang tìm kiếm:
          </h3>
          <ul>
            <li>
              <Link href="/" className={styles.suggestionLink}>
                <i className="bi bi-house"></i>
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={styles.suggestionLink}>
                <i className="bi bi-speedometer2"></i>
                Bảng điều khiển
              </Link>
            </li>
            <li>
              <Link href="/user" className={styles.suggestionLink}>
                <i className="bi bi-person-circle"></i>
                Trang cá nhân
              </Link>
            </li>
            <li>
              <Link href="/login" className={styles.suggestionLink}>
                <i className="bi bi-box-arrow-in-right"></i>
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>

        {/* Fun Facts */}
        <div className={styles.funFact}>
          <div className={styles.funFactIcon}>
            <i className="bi bi-emoji-smile"></i>
          </div>
          <p>
            <strong>Bạn có biết?</strong> Mã lỗi 404 xuất phát từ số phòng tại CERN nơi máy chủ web đầu tiên được đặt!
          </p>
        </div>
      </div>

      {/* Particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.particle}></div>
        ))}
      </div>
    </div>
  );
}