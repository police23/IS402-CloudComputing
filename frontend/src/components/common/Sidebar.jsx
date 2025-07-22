import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, NavLink } from 'react-router-dom';
import logo from '../../assets/img/logo.png';
import { useAuthorization } from '../../contexts/AuthorizationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ menuItems, onCollapse }) => {
  const { hasPermission } = useAuthorization();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (onCollapse) onCollapse(collapsed);
  }, [collapsed, onCollapse]);

  // Determine the base path based on the current URL
  const basePath = location.pathname.startsWith('/admin')
    ? '/admin'
    : location.pathname.startsWith('/sales')
      ? '/sales'
      : location.pathname.startsWith('/inventory')
        ? '/inventory'
        : location.pathname.startsWith('/order-manager')
          ? '/order-manager'
          : location.pathname.startsWith('/shipper')
            ? '/shipper'
            : '';

  // Lọc các menu item dựa trên quyền truy cập (nếu cần)
  const filteredMenuItems = hasPermission 
    ? menuItems.filter(item => hasPermission(item.path))
    : menuItems;

  // Toggle sidebar collapse
  const handleToggle = () => setCollapsed((prev) => !prev);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src={logo} alt="Nhà Sách Cánh Diều" />
      </div>
      <nav>
        <ul className="sidebar-menu" style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={`${basePath}/${item.path}`} 
                className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && <span className="menu-text">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-toggle-btn"
          onClick={handleToggle}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
};

export default Sidebar;
