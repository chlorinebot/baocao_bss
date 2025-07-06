'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={`${styles.container} telsoft-gradient`}>
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <Image
            src="/img/logo_telsoft.jpg"
            alt="TELSOFT Logo"
            width={150}
            height={60}
            className={styles.logo}
          />
        </div>
        
        <div className={styles.errorCode}>404</div>
        
        <div className={styles.errorMessage}>
          <h1>Trang không tồn tại</h1>
          <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        </div>
        
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            <i className="bi bi-house-fill"></i>
            Về trang chủ
          </Link>
          <Link href="/login" className={styles.loginButton}>
            <i className="bi bi-box-arrow-in-right"></i>
            Đăng nhập
          </Link>
        </div>
        
        <div className={styles.illustration}>
          <div className={styles.notFoundIcon}>
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
        </div>
      </div>
    </div>
  );
} 