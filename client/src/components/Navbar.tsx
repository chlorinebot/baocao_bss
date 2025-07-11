'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link href="/dashboard" className="navbar-brand d-flex align-items-center">
          <img
            src="/bss-logo.png"
            alt="BSS Logo"
            className="me-2"
            style={{ height: '30px' }}
          />
          <span className="fw-bold text-primary">BSS DCM</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                href="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                <i className="bi bi-speedometer2 me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/reports"
                className={`nav-link ${pathname.startsWith('/reports') ? 'active' : ''}`}
              >
                <i className="bi bi-file-text me-1"></i>
                Báo cáo
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/users"
                className={`nav-link ${pathname.startsWith('/users') ? 'active' : ''}`}
              >
                <i className="bi bi-people me-1"></i>
                Người dùng
              </Link>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            className="btn btn-outline-danger"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
} 