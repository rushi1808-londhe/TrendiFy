import { useState, useEffect } from 'react';
import { orderAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
const STATUS_BADGE = {
  PENDING: 'badge-pending', PROCESSING: 'badge-processing',
  SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
};

export default function OrderManagement() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll(page, 15);
      setOrders(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const res = await orderAPI.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      showToast(`Order status updated to ${status}`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setUpdating(null); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/orders" />
      <div className="tf-dash-content">
        <div className="mb-4">
          <h1 className="tf-page-title">Order Management</h1>
          <p className="tf-page-sub">View and update all customer orders</p>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="d-flex flex-column gap-3">
              {orders.length === 0 ? (
                <div className="tf-empty">
                  <i className="bi bi-receipt tf-empty-icon" />
                  <h5>No orders yet</h5>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className="tf-card">
                  <div className="p-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
                    style={{ cursor: 'pointer', borderBottom: expanded === order.id ? '1px solid var(--mist)' : 'none' }}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{order.orderNumber}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--slate)' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ fontSize: '.82rem', color: 'var(--slate)' }}>
                        <i className="bi bi-person me-1" />{order.user?.fullName}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      {/* Status selector */}
                      <select
                        className="tf-input"
                        style={{ width: 'auto', padding: '.3rem .7rem', fontSize: '.78rem' }}
                        value={order.status}
                        disabled={updating === order.id}
                        onClick={e => e.stopPropagation()}
                        onChange={e => handleStatusChange(order.id, e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {updating === order.id && (
                        <span className="spinner-border spinner-border-sm" style={{ color: 'var(--gold)' }} />
                      )}
                      <span style={{ fontWeight: 800 }}>${order.totalAmount?.toFixed(2)}</span>
                      <i className={`bi bi-chevron-${expanded === order.id ? 'up' : 'down'}`} style={{ color: 'var(--slate)' }} />
                    </div>
                  </div>

                  {expanded === order.id && (
                    <div className="p-3">
                      <div className="row g-3">
                        <div className="col-md-7">
                          <table className="tf-table" style={{ fontSize: '.82rem' }}>
                            <thead>
                              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                            </thead>
                            <tbody>
                              {order.items?.map(item => (
                                <tr key={item.id}>
                                  <td style={{ fontWeight: 600 }}>{item.productName}</td>
                                  <td>{item.quantity}</td>
                                  <td>${item.unitPrice?.toFixed(2)}</td>
                                  <td style={{ fontWeight: 700 }}>${item.totalPrice?.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-5">
                          <div style={{ fontSize: '.82rem', color: 'var(--slate)', lineHeight: 2 }}>
                            <div><b>Ship to:</b> {order.shippingFullName}</div>
                            <div>{order.shippingAddress}, {order.shippingCity}</div>
                            <div><b>Phone:</b> {order.shippingPhone}</div>
                            <div><b>Payment:</b> {order.paymentMethod?.replace(/_/g,' ')}</div>
                            <div><b>Subtotal:</b> ${order.subtotal?.toFixed(2)}</div>
                            <div><b>Shipping:</b> {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</div>
                            {order.notes && <div><b>Notes:</b> {order.notes}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`btn btn-sm ${i === page ? 'btn-ink' : 'btn-outline-ink'}`}
                    onClick={() => setPage(i)}>{i+1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
