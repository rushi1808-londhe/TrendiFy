import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar({ active }) {
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();

  const go = (path) => navigate(path);

  const adminLinks = [
    { label: 'Dashboard',   icon: 'bi-grid-1x2',      path: '/admin' },
    { label: 'Products',    icon: 'bi-box-seam',       path: '/admin/products' },
    { label: 'Orders',      icon: 'bi-receipt',        path: '/admin/orders' },
    { label: 'Inventory',   icon: 'bi-clipboard-data', path: '/admin/inventory' },
  ];

  const superLinks = [
    { label: 'Dashboard',   icon: 'bi-grid-1x2',      path: '/superadmin' },
    { label: 'Admin Mgmt',  icon: 'bi-person-badge',   path: '/superadmin/admins' },
    { label: 'Categories',  icon: 'bi-tag',            path: '/superadmin/categories' },
    { label: 'All Users',   icon: 'bi-people',         path: '/superadmin/users' },
    { label: 'Analytics',   icon: 'bi-bar-chart-line', path: '/superadmin/analytics' },
    { label: 'All Orders',  icon: 'bi-receipt',        path: '/superadmin/orders' },
  ];

  const links = isSuperAdmin() ? superLinks : adminLinks;

  return (
    <div className="tf-sidebar d-flex flex-column">
      <div className="tf-sidebar-brand">
        Trendi<span>Fy</span>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: '1rem', fontWeight: 600 }}>
          {user?.fullName}
        </div>
        <div style={{ fontSize: '.7rem', color: 'var(--gold)', marginTop: '.2rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          {user?.role?.replace('_', ' ')}
        </div>
      </div>

      <div className="tf-sidebar-section">Navigation</div>

      <nav className="flex-grow-1">
        {links.map(link => (
          <div
            key={link.path}
            className={`tf-sidebar-link ${active === link.path ? 'active' : ''}`}
            onClick={() => go(link.path)}
          >
            <i className={`bi ${link.icon}`} />
            {link.label}
          </div>
        ))}
      </nav>

      <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <div className="tf-sidebar-link" onClick={() => { logout(); navigate('/login'); }}>
          <i className="bi bi-box-arrow-right" />
          Logout
        </div>
      </div>
    </div>
  );
}
