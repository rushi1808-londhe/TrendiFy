import { useState, useEffect } from 'react';
import { orderAPI, productAPI, userAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner } from '../../components/Spinner';

export default function Analytics() {
  const [stats,      setStats]      = useState(null);
  const [topProducts,setTopProducts] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, topRes] = await Promise.all([
          orderAPI.getStats(),
          productAPI.getTopSelling(8),
        ]);
        setStats(statsRes.data);
        setTopProducts(topRes.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin/analytics" />
      <div className="tf-dash-content"><Spinner /></div>
    </div>
  );

  const orderBreakdown = stats ? [
    { label: 'Pending',    val: stats.pendingOrders,    color: '#d68910', pct: (stats.pendingOrders    / stats.totalOrders) * 100 },
    { label: 'Processing', val: stats.processingOrders, color: '#1a6fa8', pct: (stats.processingOrders / stats.totalOrders) * 100 },
    { label: 'Shipped',    val: stats.shippedOrders,    color: '#1558a0', pct: (stats.shippedOrders    / stats.totalOrders) * 100 },
    { label: 'Delivered',  val: stats.deliveredOrders,  color: '#1e8449', pct: (stats.deliveredOrders  / stats.totalOrders) * 100 },
    { label: 'Cancelled',  val: stats.cancelledOrders,  color: '#c0392b', pct: (stats.cancelledOrders  / stats.totalOrders) * 100 },
  ] : [];

  const maxSales = topProducts.length ? Math.max(...topProducts.map(p => p.totalSales || 0)) : 1;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin/analytics" />
      <div className="tf-dash-content">
        <div className="mb-5">
          <h1 className="tf-page-title">Analytics</h1>
          <p className="tf-page-sub">Platform performance at a glance</p>
        </div>

        {/* KPI Cards */}
        <div className="row g-3 mb-5">
          {[
            { val: `$${Number(stats?.totalRevenue || 0).toLocaleString()}`, lbl: 'Total Revenue',   icon: 'bi-graph-up', sub: 'All time' },
            { val: stats?.totalOrders,       lbl: 'Total Orders',   icon: 'bi-receipt',    sub: 'All time' },
            { val: stats?.totalProducts,     lbl: 'Active Products',icon: 'bi-box-seam',   sub: 'In catalogue' },
            { val: stats?.totalUsers,        lbl: 'Registered Users',icon: 'bi-people',    sub: 'All roles' },
          ].map(s => (
            <div key={s.lbl} className="col-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-card-val">{s.val}</div>
                <div className="stat-card-lbl">{s.lbl}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(122,116,112,.7)', marginTop: '.2rem' }}>{s.sub}</div>
                <i className={`bi ${s.icon} stat-card-icon`} />
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* Order status breakdown */}
          <div className="col-lg-5">
            <div className="tf-card p-4">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.4rem' }}>
                Order Status Breakdown
              </h5>
              {orderBreakdown.map(s => (
                <div key={s.label} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: '.8rem', fontWeight: 800, color: s.color }}>{s.val}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--mist)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.max(s.pct, 0).toFixed(1)}%`,
                      background: s.color, borderRadius: 4,
                      transition: 'width 1s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'var(--slate)', marginTop: '.2rem' }}>
                    {isNaN(s.pct) ? 0 : s.pct.toFixed(1)}% of total orders
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top selling products */}
          <div className="col-lg-7">
            <div className="tf-card p-4">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.4rem' }}>
                Top Selling Products
              </h5>
              {topProducts.length === 0 ? (
                <div className="tf-empty"><p>No sales data yet</p></div>
              ) : topProducts.map((p, i) => (
                <div key={p.id} className="d-flex align-items-center gap-3 mb-3">
                  <span style={{ width: 22, color: 'var(--slate)', fontSize: '.75rem', fontWeight: 700, flexShrink: 0, textAlign: 'right' }}>
                    #{i + 1}
                  </span>
                  {p.imageUrls?.[0] && (
                    <img src={p.imageUrls[0]} alt={p.name}
                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.name}</div>
                    <div style={{ height: 6, background: 'var(--mist)', borderRadius: 3, marginTop: '.3rem', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${((p.totalSales || 0) / maxSales) * 100}%`,
                        background: 'var(--gold)',
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '.9rem', minWidth: 40, textAlign: 'right' }}>
                    {p.totalSales || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary stats */}
          <div className="col-12">
            <div className="tf-card p-4">
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
                Order Pipeline
              </h5>
              <div className="d-flex gap-0" style={{ height: 48, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {orderBreakdown.filter(s => s.val > 0).map(s => (
                  <div key={s.label}
                    style={{
                      flex: s.val, background: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.7rem', color: 'white', fontWeight: 700,
                      overflow: 'hidden',
                      transition: 'flex 1s ease',
                    }}>
                    {s.pct > 8 ? `${s.label} ${s.val}` : ''}
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3 mt-2 flex-wrap">
                {orderBreakdown.map(s => (
                  <div key={s.label} className="d-flex align-items-center gap-1">
                    <div style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }} />
                    <span style={{ fontSize: '.72rem', color: 'var(--slate)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
