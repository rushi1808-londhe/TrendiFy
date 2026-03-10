import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, productAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner } from '../../components/Spinner';

const STATUS_BADGE = {
  PENDING: 'badge-pending', PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
};

export default function AdminDashboard() {
  const [stats,  setStats]  = useState(null);
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, stockRes] = await Promise.all([
          orderAPI.getStats(),
          orderAPI.getAll(0, 5),
          productAPI.getLowStock(5),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data?.content || []);
        setLowStock(stockRes.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const statCards = stats ? [
    { val: `$${Number(stats.totalRevenue || 0).toFixed(0)}`, lbl: 'Total Revenue', icon: 'bi-currency-dollar', color: 'var(--gold)' },
    { val: stats.totalOrders,       lbl: 'Total Orders',   icon: 'bi-receipt',     color: 'var(--info)' },
    { val: stats.pendingOrders,     lbl: 'Pending',        icon: 'bi-hourglass',   color: 'var(--warning)' },
    { val: stats.deliveredOrders,   lbl: 'Delivered',      icon: 'bi-check-circle',color: 'var(--success)' },
    { val: stats.totalProducts,     lbl: 'Products',       icon: 'bi-box-seam',    color: 'var(--slate)' },
    { val: stats.totalUsers,        lbl: 'Users',          icon: 'bi-people',      color: 'var(--info)' },
  ] : [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin" />
      <div className="tf-dash-content">
        <div className="mb-4">
          <h1 className="tf-page-title">Dashboard</h1>
          <p className="tf-page-sub">Welcome back — here's an overview</p>
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
              <div className="col-lg-7">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>Recent Orders</h5>
                  <button className="btn btn-outline-ink btn-sm" onClick={() => navigate('/admin/orders')}>
                    View All
                  </button>
                </div>
                <div className="tf-table-wrap">
                  <table className="tf-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={4} className="text-center" style={{ color: 'var(--slate)', padding: '2rem' }}>No orders yet</td></tr>
                      ) : orders.map(o => (
                        <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                          <td style={{ fontWeight: 700, fontSize: '.82rem' }}>{o.orderNumber}</td>
                          <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{o.user?.fullName}</td>
                          <td style={{ fontWeight: 700 }}>${o.totalAmount?.toFixed(2)}</td>
                          <td><span className={`tf-badge ${STATUS_BADGE[o.status]}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low stock */}
              <div className="col-lg-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0 }}>
                    <i className="bi bi-exclamation-triangle me-2" style={{ color: 'var(--warning)' }} />
                    Low Stock
                  </h5>
                  <button className="btn btn-outline-ink btn-sm" onClick={() => navigate('/admin/inventory')}>
                    View All
                  </button>
                </div>
                <div className="tf-table-wrap">
                  <table className="tf-table">
                    <thead>
                      <tr><th>Product</th><th>Stock</th></tr>
                    </thead>
                    <tbody>
                      {lowStock.length === 0 ? (
                        <tr><td colSpan={2} className="text-center" style={{ color: 'var(--slate)', padding: '2rem' }}>
                          <i className="bi bi-check-circle me-2" style={{ color: 'var(--success)' }} />All stocked
                        </td></tr>
                      ) : lowStock.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontSize: '.82rem', fontWeight: 600 }}>{p.name}</td>
                          <td>
                            <span style={{
                              fontWeight: 800,
                              color: p.stockQuantity === 0 ? 'var(--danger)' : 'var(--warning)',
                            }}>
                              {p.stockQuantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
