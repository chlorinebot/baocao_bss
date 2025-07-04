import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống quản lý người dùng",
  description: "Hệ thống đăng nhập và đăng ký hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        {children}
        
        {/* Script để ẩn Next.js dev indicator */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function hideDevIndicator() {
                  // Ẩn tất cả các element có thể là dev indicator
                  const selectors = [
                    '#__next-build-watcher',
                    '[data-nextjs-toast-wrapper]',
                    '[data-nextjs-dialog-overlay]',
                    'nextjs-portal',
                    'div[style*="position: fixed"][style*="bottom: 10px"][style*="right: 10px"]',
                    'div[style*="position: fixed"][style*="z-index: 9000"]'
                  ];
                  
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                      if (el) {
                        el.style.display = 'none';
                        el.remove();
                      }
                    });
                  });
                }
                
                // Chạy ngay lập tức
                hideDevIndicator();
                
                // Chạy sau khi DOM load
                document.addEventListener('DOMContentLoaded', hideDevIndicator);
                
                // Chạy định kỳ để bắt các element được tạo sau
                setInterval(hideDevIndicator, 1000);
                
                // Observer để bắt các thay đổi DOM
                const observer = new MutationObserver(hideDevIndicator);
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
