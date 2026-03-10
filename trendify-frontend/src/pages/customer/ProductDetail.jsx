import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../api/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import Footer from '../../components/Footer';
import { getImageUrl } from '../../api/api';

const FALLBACK = 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getById(id);
        setProduct(res.data);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (!product) return null;

  const imgs = product.imageUrls?.length ? product.imageUrls : [FALLBACK];
  const inStock = product.stockQuantity > 0;

  const handleAdd = () => {
    addToCart(product, qty);
    showToast(`${product.name} added to bag`, 'success');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 py-5">
        <div className="container">
          <button className="tf-back" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" /> Back
          </button>

          <div className="row g-5">
            {/* Images */}
            <div className="col-lg-6">
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '.75rem' }}>
                <img src={getImageUrl(product.imageUrls?.[0]) || FALLBACK_IMG} alt={product.name}
                  style={{ width: '100%', height: 500, objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.src = FALLBACK; }} />
              </div>
              {imgs.length > 1 && (
                <div className="d-flex gap-2">
                  {imgs.map((img, i) => (
                    <img key={i} src={img} alt=""
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 70, height: 70, objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border: `2px solid ${i === activeImg ? 'var(--gold)' : 'var(--border)'}`,
                        transition: 'border-color .2s',
                      }}
                      onError={e => { e.target.src = FALLBACK; }} />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="col-lg-6">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.5rem' }}>
                {product.category?.name}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '.8rem' }}>
                {product.name}
              </h1>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>
                ${product.price?.toFixed(2)}
              </div>

              {product.brand && (
                <p style={{ fontSize: '.8rem', color: 'var(--slate)', marginBottom: '.4rem' }}>
                  <span style={{ fontWeight: 700 }}>Brand:</span> {product.brand}
                </p>
              )}
              {product.color && (
                <p style={{ fontSize: '.8rem', color: 'var(--slate)', marginBottom: '.4rem' }}>
                  <span style={{ fontWeight: 700 }}>Color:</span> {product.color}
                </p>
              )}
              {product.size && (
                <p style={{ fontSize: '.8rem', color: 'var(--slate)', marginBottom: '.4rem' }}>
                  <span style={{ fontWeight: 700 }}>Size:</span> {product.size}
                </p>
              )}

              <div className="tf-divider" />

              <p style={{ color: 'var(--slate)', lineHeight: 1.8, fontSize: '.9rem', marginBottom: '1.5rem' }}>
                {product.description || 'A premium fashion piece from our curated collection.'}
              </p>

              {/* Stock */}
              <div className="mb-3">
                {inStock ? (
                  <span style={{ fontSize: '.8rem', color: 'var(--success)', fontWeight: 600 }}>
                    <i className="bi bi-check-circle me-1" />
                    {product.stockQuantity} in stock
                  </span>
                ) : (
                  <span style={{ fontSize: '.8rem', color: 'var(--danger)', fontWeight: 600 }}>
                    <i className="bi bi-x-circle me-1" />Out of stock
                  </span>
                )}
              </div>

              {/* Qty + CTA */}
              {inStock && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
                  </div>
                  <button className="btn btn-gold flex-grow-1" onClick={handleAdd}>
                    <i className="bi bi-bag-plus me-2" />Add to Bag
                  </button>
                </div>
              )}

              <button className="btn btn-outline-ink w-100" onClick={() => navigate('/cart')}>
                <i className="bi bi-bag me-2" />View Bag
              </button>

              {/* Shipping note */}
              <div className="mt-4 p-3" style={{ background: 'var(--gold-pale)', borderRadius: 'var(--radius)', fontSize: '.8rem', color: 'var(--slate)' }}>
                <i className="bi bi-truck me-2" style={{ color: 'var(--gold)' }} />
                Free shipping on orders over $100
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
