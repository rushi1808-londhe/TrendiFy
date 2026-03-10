import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, userAPI, productAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner } from '../../components/Spinner';

export default function SuperAdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, adminsRes] = await Promise.all([
          orderAPI.getStats(),
          orderAPI.getAll(0, 6),
          userAPI.getAdmins(),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data?.content || []);
        setAdmins(adminsRes.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const statCards = stats ? [
    { val: `$${Number(stats.totalRevenue || 0).toLocaleString()}`, lbl: 'Total Revenue',    icon: 'bi-graph-up-arrow', color: 'var(--gold)' },
    { val: stats.totalOrders,     lbl: 'Total Orders',    icon: 'bi-receipt',       color: 'var(--info)' },
    { val: stats.totalProducts,   lbl: 'Products',        icon: 'bi-box-seam',      color: 'var(--slate)' },
    { val: stats.totalUsers,      lbl: 'Users',           icon: 'bi-people',        color: 'var(--success)' },
    { val: stats.pendingOrders,   lbl: 'Pending Orders',  icon: 'bi-hourglass',     color: 'var(--warning)' },
    { val: stats.deliveredOrders, lbl: 'Delivered',       icon: 'bi-check-circle',  color: 'var(--success)' },
  ] : [];

  const STATUS_BADGE = {
    PENDING: 'badge-pending', PROCESSING: 'badge-processing',
    SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin" />
      <div className="tf-dash-content">
        <div className="mb-4">
          <h1 className="tf-page-title">Platform Overview</h1>
          <p className="tf-page-sub">Super Admin — full platform control</p>
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* Stats */}
            <div className="row g-3 mb-5">
              {statCards.map(s => (
                <div key={s.lbl} className="col-6 col-xl-4">
                  <div className="stat-card">
                    <div className="stat-card-val">{s.val}</div>
                    <div className="stat-card-lbl">{s.lbl}</div>
                    <i className={`bi ${s.icon} stat-card-icon`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              {/* Recent orders */}
              <div className="col-lg-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Recent Orders</h5>
                  <button className="btn btn-outline-ink btn-sm" onClick={() => navigate('/superadmin/orders')}>
                    View All
                  </button>
                </div>
                <div className="tf-table-wrap">
                  <table className="tf-table">
                    <thead>
                      <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700, fontSize: '.82rem' }}>{o.orderNumber}</td>
                          <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{o.user?.fullName}</td>
                          <td style={{ color: 'var(--slate)', fontSize: '.78rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 700 }}>${o.totalAmount?.toFixed(2)}</td>
                          <td><span className={`tf-badge ${STATUS_BADGE[o.status]}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admins */}
              <div className="col-lg-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Admins</h5>
                  <button className="btn btn-outline-ink btn-sm" onClick={() => navigate('/superadmin/admins')}>
                    Manage
                  </button>
                </div>
                <div className="d-flex flex-column gap-2">
                  {admins.slice(0, 5).map(a => (
                    <div key={a.id} className="tf-card p-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 36, height: 36, background: 'var(--ink)', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {a.fullName?.[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{a.fullName}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--slate)' }}>{a.email}</div>
                      </div>
                      <span className={`tf-badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Actions</h5>
              <div className="d-flex flex-wrap gap-3">
                {[
                  { label: 'Create Admin',      icon: 'bi-person-plus', path: '/superadmin/admins' },
                  { label: 'Add Category',      icon: 'bi-tag-fill',    path: '/superadmin/categories' },
                  { label: 'View All Users',    icon: 'bi-people-fill', path: '/superadmin/users' },
                  { label: 'Analytics',         icon: 'bi-bar-chart',   path: '/superadmin/analytics' },
                ].map(action => (
                  <button key={action.label} className="btn btn-outline-ink d-flex align-items-center gap-2"
                    onClick={() => navigate(action.path)}>
                    <i className={`bi ${action.icon}`} style={{ color: 'var(--gold)' }} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
