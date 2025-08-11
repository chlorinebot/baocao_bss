export default function LienHeHoTroPage() {
  const contacts = [
    { name: 'anh Phan Xuân Đạt', role: 'BSS LEADER', phone: '0904 568 282' },
    { name: 'Kim Văn Tuấn', role: 'ADMIN Hệ thống, CSDL, Ứng dụng, Mạng của BSS DCM', phone: '0973 336 178' },
  ];

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-headset text-danger" style={{ fontSize: 28 }} />
          <h1 className="h3 m-0">Liên hệ hỗ trợ</h1>
        </div>

        <p className="text-secondary mb-4">
          Bạn cần hỗ trợ gì? Hãy liên hệ cho các số điện thoại dưới đây của chúng tôi để được hỗ trợ đầy đủ nhất. Xin cảm ơn!
        </p>

        <div className="row g-3">
          {contacts.map((c, idx) => (
            <div className="col-12 col-md-6 col-lg-4" key={idx}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                      <i className="bi bi-person-fill" />
                    </div>
                    <div>
                      <div className="fw-semibold">{c.name}</div>
                      <div className="small text-secondary">{c.role}</div>
                    </div>
                  </div>

                  <a
                    href={`tel:${c.phone.replace(/\s/g, '')}`}
                    className="btn btn-outline-danger rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-telephone-fill" />
                    <span>{c.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-secondary">
          <div className="small mb-2">Gợi ý chỉnh sửa:</div>
          <ul className="small ps-3 mb-0">
            <li>Đổi số điện thoại theo định dạng quốc gia nếu cần (+84...).</li>
            <li>Thêm/giảm số lượng ADMIN bằng cách sửa mảng contacts trong file trang này.</li>
            <li>Có thể thêm các kênh khác: Zalo, Email, Microsoft Teams...</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 