import { useState, useEffect } from 'react';
import { orderAPI } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import Footer from '../../components/Footer';


const STATUS_BADGE = {
  PENDING:    'badge-pending',
  PROCESSING: 'badge-processing',
  SHIPPED:    'badge-shipped',
  DELIVERED:  'badge-delivered',
  CANCELLED:  'badge-cancelled',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await orderAPI.getMyOrders();
        setOrders(res.data || []);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(orderId);
    try {
      const res = await orderAPI.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      showToast('Order cancelled', 'warning');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 py-5">
        <div className="container">
          <h1 className="tf-page-title mb-1">My Orders</h1>
          <p className="tf-page-sub mb-4">Track and manage your purchases</p>

          {loading ? (
            <Spinner />
          ) : orders.length === 0 ? (
            <div className="tf-empty">
              <i className="bi bi-receipt tf-empty-icon" />
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>No orders yet</h5>
              <p>Your order history will appear here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {orders.map(order => (
                <div key={order.id} className="tf-card">
                  {/* Header */}
                  <div className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-2"
                    style={{ borderBottom: expanded === order.id ? '1px solid var(--mist)' : 'none', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                        {order.orderNumber}
                      </div>
                      <div style={{ fontSize: '.78rem', color: 'var(--slate)', marginTop: '.2rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <span className={`tf-badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>${order.totalAmount?.toFixed(2)}</span>
                      <i className={`bi bi-chevron-${expanded === order.id ? 'up' : 'down'}`} style={{ color: 'var(--slate)' }} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === order.id && (
                    <div className="p-4">
                      <div className="row g-4">
                        <div className="col-md-7">
                          <h6 style={{ fontFamily: 'var(--font-display)', marginBottom: '.8rem' }}>Items</h6>
                          {order.items?.map(item => (
                            <div key={item.id} className="d-flex gap-3 mb-3 align-items-center">
                              {item.productImage && (
                                <img src={item.productImage} alt={item.productName}
                                  style={{ width: 55, height: 55, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{item.productName}</div>
                                <div style={{ fontSize: '.78rem', color: 'var(--slate)' }}>
                                  {item.quantity} × ${item.unitPrice?.toFixed(2)}
                                </div>
                              </div>
                              <div style={{ fontWeight: 700 }}>${item.totalPrice?.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>

                        <div className="col-md-5">
                          <h6 style={{ fontFamily: 'var(--font-display)', marginBottom: '.8rem' }}>Shipping To</h6>
                          <p style={{ fontSize: '.85rem', color: 'var(--slate)', lineHeight: 1.8 }}>
                            {order.shippingFullName}<br />
                            {order.shippingAddress}<br />
                            {order.shippingCity} {order.shippingZip}<br />
                            {order.shippingPhone}
                          </p>

                          <div style={{ fontSize: '.78rem', color: 'var(--slate)', marginTop: '1rem' }}>
                            <div><b>Payment:</b> {order.paymentMethod?.replace(/_/g, ' ')}</div>
                            <div><b>Subtotal:</b> ${order.subtotal?.toFixed(2)}</div>
                            <div><b>Shipping:</b> {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost?.toFixed(2)}`}</div>
                          </div>

                          {order.status === 'PENDING' && (
                            <button className="btn btn-sm mt-3"
                              style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.2)' }}
                              disabled={cancelling === order.id}
                              onClick={() => handleCancel(order.id)}>
                              {cancelling === order.id
                                ? <><span className="spinner-border spinner-border-sm me-2" />Cancelling…</>
                                : <><i className="bi bi-x-circle me-2" />Cancel Order</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
