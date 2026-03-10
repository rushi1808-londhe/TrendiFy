import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { InlineSpinner } from '../../components/Spinner';
import Footer from '../../components/Footer';
import { productAPI, getImageUrl } from '../../api/api';

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const shipping = totalAmount >= 100 ? 0 : 9.99;

  const [form, setForm] = useState({
    shippingFullName: '', shippingAddress: '', shippingCity: '',
    shippingZip: '', shippingPhone: '',
    paymentMethod: 'CASH_ON_DELIVERY', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items.length) { setError('Your cart is empty'); return; }
    setError('');
    setLoading(true);
    try {
      const body = {
        ...form,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      };
      const res = await orderAPI.place(body);
      clearCart();
      showToast(`Order ${res.data.orderNumber} placed!`, 'success');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1 py-5">
          <div className="container">
            <div className="tf-empty">
              <i className="bi bi-bag tf-empty-icon" />
              <h5>Your cart is empty</h5>
              <button className="btn btn-gold mt-2" onClick={() => navigate('/')}>Browse Products</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 py-5">
        <div className="container">
          <button className="tf-back" onClick={() => navigate('/cart')}>
            <i className="bi bi-arrow-left" /> Back to Bag
          </button>
          <h1 className="tf-page-title mb-4">Checkout</h1>

          {error && (
            <div className="tf-alert tf-alert-danger mb-3">
              <i className="bi bi-exclamation-circle me-2" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Shipping form */}
              <div className="col-lg-7">
                <div className="tf-card p-4">
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.4rem' }}>
                    <i className="bi bi-truck me-2" style={{ color: 'var(--gold)' }} />
                    Shipping Details
                  </h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="tf-form-label">Full Name *</label>
                      <input name="shippingFullName" className="tf-input"
                        placeholder="Recipient full name"
                        value={form.shippingFullName} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="tf-form-label">Address *</label>
                      <input name="shippingAddress" className="tf-input"
                        placeholder="Street address"
                        value={form.shippingAddress} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="tf-form-label">City *</label>
                      <input name="shippingCity" className="tf-input"
                        placeholder="City"
                        value={form.shippingCity} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="tf-form-label">ZIP Code</label>
                      <input name="shippingZip" className="tf-input"
                        placeholder="ZIP / Postal"
                        value={form.shippingZip} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="tf-form-label">Phone *</label>
                      <input name="shippingPhone" className="tf-input"
                        placeholder="+1 555 000 0000"
                        value={form.shippingPhone} onChange={handleChange} required />
                    </div>
                  </div>

                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '1.8rem 0 1rem' }}>
                    <i className="bi bi-credit-card me-2" style={{ color: 'var(--gold)' }} />
                    Payment Method
                  </h5>

                  {[
                    ['CASH_ON_DELIVERY', 'bi-cash-coin', 'Cash on Delivery'],
                    ['CARD',            'bi-credit-card', 'Credit / Debit Card'],
                    ['BANK_TRANSFER',   'bi-bank', 'Bank Transfer'],
                  ].map(([val, icon, label]) => (
                    <label key={val}
                      className="d-flex align-items-center gap-3 p-3 mb-2"
                      style={{
                        border: `1px solid ${form.paymentMethod === val ? 'var(--gold)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        background: form.paymentMethod === val ? 'var(--gold-pale)' : 'transparent',
                        transition: 'all .15s',
                      }}>
                      <input type="radio" name="paymentMethod" value={val}
                        checked={form.paymentMethod === val}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--gold)' }} />
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                      <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{label}</span>
                    </label>
                  ))}

                  <div className="mt-3">
                    <label className="tf-form-label">Order Notes (optional)</label>
                    <textarea name="notes" className="tf-input" rows={2}
                      placeholder="Special instructions…"
                      value={form.notes} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="col-lg-5">
                <div className="tf-card p-4 position-sticky" style={{ top: 90 }}>
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.2rem' }}>
                    Order Summary
                  </h5>

                  {items.map(item => (
                    <div key={item.id} className="d-flex justify-content-between mb-2"
                      style={{ fontSize: '.85rem', borderBottom: '1px solid var(--mist)', paddingBottom: '.6rem' }}>
                      <span style={{ color: 'var(--slate)' }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-2 mb-1" style={{ fontSize: '.85rem', color: 'var(--slate)' }}>
                    <span>Subtotal</span><span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: '.85rem', color: 'var(--slate)' }}>
                    <span>Shipping</span>
                    <span>{shipping === 0
                      ? <span style={{ color: 'var(--success)' }}>Free</span>
                      : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="tf-divider" />
                  <div className="d-flex justify-content-between mb-4">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
                      ${(totalAmount + shipping).toFixed(2)}
                    </span>
                  </div>

                  <button type="submit" className="btn btn-gold w-100" disabled={loading}>
                    {loading && <InlineSpinner />}
                    <i className="bi bi-bag-check me-2" />
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
