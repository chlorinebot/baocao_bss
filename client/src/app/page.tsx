import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={`${styles.container} telsoft-gradient`}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            <span className="welcome-text-white">Chào mừng đến với</span>
            <br />
            <span className="title-animated-gradient">
              Hệ thống quản lý báo cáo BSS-MBF của{' '}
            </span>
            <div className={styles.logoContainer}>
              <Image
                src="/img/logo_telsoft.jpg"
                alt="TELSOFT Logo"
                width={200}
                height={80}
                className={styles.logo}
                priority
              />
            </div>
          </h1>
          <p className={styles.description}>
            Hệ thống đăng nhập và quản lý người dùng hiện đại với giao diện thân thiện và bảo mật cao.
          </p>
          <div className={styles.actions}>
            <Link href="/login" className={styles.loginButton}>
              Đăng nhập
            </Link>
            <Link href="/register" className={styles.registerButton}>
              Đăng ký
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Bảo mật cao</h3>
            <p>Hệ thống bảo mật đa lớp với mã hóa mạnh mẽ</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Hiệu suất tối ưu</h3>
            <p>Giao diện nhanh chóng và responsive trên mọi thiết bị</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>👥</div>
            <h3>Quản lý người dùng</h3>
            <p>Công cụ quản lý tài khoản và phân quyền linh hoạt</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2024 By KimTuan to 
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
