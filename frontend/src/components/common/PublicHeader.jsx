import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PublicHeader.css';
import logo from '../../assets/img/logo.png';
import { useAuth } from '../../contexts/AuthContext';

function PublicHeader() {
  const navigate = useNavigate();
  const { user, logout, cartItemCount } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  // Lấy chữ cái đầu
  const getInitial = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  // Đóng menu khi click ra ngoài
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="homepage-header">
      <div className="header-logo" onClick={() => navigate('/')}> 
        <img src={logo} alt="Nhà Sách Cánh Diều" className="header-logo-img" />
      </div>
      <nav className="header-nav">
        <span onClick={() => navigate('/')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Trang chủ
        </span>
        <span onClick={() => navigate('/books')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          Sách
        </span>
        <span onClick={() => navigate('/about')}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Giới thiệu
        </span>
      </nav>
      <div className="header-icons">
        <span className="header-icon cart-icon" title="Giỏ hàng" onClick={() => navigate('/cart')}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L21 13M7 13V6a1 1 0 011-1h6a1 1 0 011 1v7"/></svg>
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </span>
        {user ? (
          <div className="header-user-menu" ref={menuRef} style={{ position: 'relative', marginLeft: 12 }}>
            <div
              className="header-avatar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                background: '#6ec6c6',
                color: '#fff',
                borderRadius: '50%',
                width: 36,
                height: 36,
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 18,
                marginRight: 8
              }}
              onClick={() => setShowMenu((v) => !v)}
            >
              {getInitial(user.full_name || user.username)}
            </div>
            <span
              style={{ fontWeight: 500, color: '#095e5a', cursor: 'pointer' }}
              onClick={() => setShowMenu((v) => !v)}
            >
              {user.full_name || user.username}
            </span>
            {showMenu && (
              <div
                className="header-user-dropdown"
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  borderRadius: 8,
                  minWidth: 180,
                  zIndex: 1000
                }}
              >
                <div
                  style={{ padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onClick={() => { setShowMenu(false); navigate('/account'); }}
                >
                  Thông tin tài khoản
                </div>
                <div
                  style={{ padding: '12px 18px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onClick={() => { setShowMenu(false); navigate('/my-orders'); }}
                >
                  Đơn hàng của tôi
                </div>
                <div
                  style={{ padding: '12px 18px', cursor: 'pointer', color: '#d32f2f' }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="header-login-btn" onClick={() => navigate('/login')}>Đăng nhập</button>
        )}
      </div>
    </header>
  );
}

export default PublicHeader;
