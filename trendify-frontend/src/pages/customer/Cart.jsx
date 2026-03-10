import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Footer from '../../components/Footer';
import { productAPI, getImageUrl } from '../../api/api';


const FALLBACK = 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=200&q=80';

export default function Cart() {
  const { items, removeFromCart, updateQty, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const shipping = totalAmount >= 100 ? 0 : 9.99;
  const grand    = totalAmount + shipping;

  const handleRemove = (item) => {
    removeFromCart(item.id);
    showToast(`${item.name} removed from bag`, 'warning');
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      <main className="flex-grow-1 py-5">
        <div className="container">
          <button className="tf-back" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left" /> Continue Shopping
          </button>

          <h1 className="tf-page-title mb-1">Shopping Bag</h1>
          <p className="tf-page-sub mb-4">{items.length} item{items.length !== 1 ? 's' : ''}</p>

          {items.length === 0 ? (
            <div className="tf-empty">
              <i className="bi bi-bag tf-empty-icon" />
              <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Your bag is empty</h5>
              <p>Add some items to get started.</p>
              <button className="btn btn-gold mt-2" onClick={() => navigate('/')}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {/* Items */}
              <div className="col-lg-8">
                <div className="tf-card">
                  {items.map((item, idx) => (
                    <div key={item.id}
                      style={{ padding: '1.2rem', borderBottom: idx < items.length - 1 ? '1px solid var(--mist)' : 'none' }}>
                      <div className="row g-3 align-items-center">
                        <div className="col-auto">
                          <img src={getImageUrl(item.imageUrls?.[0]) || FALLBACK_IMG} alt={item.name}
                            style={{ width: 85, height: 85, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            onError={e => { e.target.src = FALLBACK; }} />
                        </div>
                        <div className="col">
                          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                            {item.category?.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600 }}>
                            {item.name}
                          </div>
                          <div style={{ fontWeight: 700, marginTop: '.3rem' }}>
                            ${item.price?.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-auto d-flex align-items-center gap-3">
                          <div className="qty-ctrl">
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                            <span className="qty-val">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <div style={{ fontWeight: 800, minWidth: 70, textAlign: 'right' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <button className="btn btn-sm"
                            style={{ color: 'var(--danger)', padding: '0 .4rem' }}
                            onClick={() => handleRemove(item)}>
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-outline-ink btn-sm"
                    onClick={() => { clearCart(); showToast('Bag cleared', 'info'); }}>
                    <i className="bi bi-trash3 me-2" />Clear Bag
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="col-lg-4">
                <div className="tf-card p-4 position-sticky" style={{ top: 90 }}>
                  <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '1.2rem' }}>
                    Order Summary
                  </h5>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '.875rem', color: 'var(--slate)' }}>
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ fontSize: '.875rem', color: 'var(--slate)' }}>
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="mb-3 p-2" style={{ background: 'var(--gold-pale)', borderRadius: 'var(--radius-sm)', fontSize: '.75rem', color: 'var(--slate)' }}>
                      Add ${(100 - totalAmount).toFixed(2)} more for free shipping
                    </div>
                  )}

                  <div className="tf-divider" />
                  <div className="d-flex justify-content-between mb-4">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>${grand.toFixed(2)}</span>
                  </div>

                  <button className="btn btn-gold w-100 mb-2" onClick={() => navigate('/checkout')}>
                    <i className="bi bi-credit-card me-2" />Checkout
                  </button>
                  <button className="btn btn-outline-ink w-100 btn-sm" onClick={() => navigate('/')}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
