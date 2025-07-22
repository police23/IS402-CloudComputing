import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ZaloPayResultPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Có thể gọi API xác nhận trạng thái thanh toán ở đây nếu cần
    const timer = setTimeout(() => {
      navigate('/order-success');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#38d9a9', fontSize: '2.2rem', marginBottom: 16 }}>Thanh toán thành công!</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>Bạn sẽ được chuyển về trang xác nhận đơn hàng trong giây lát...</p>
    </div>
  );
}

export default ZaloPayResultPage;
