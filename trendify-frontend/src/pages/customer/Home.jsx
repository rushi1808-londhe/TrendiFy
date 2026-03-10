import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../api/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import Footer from '../../components/Footer';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&q=80';

export default function Home() {
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [keyword, setKeyword]     = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]     = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getActive();
        setCategories([{ id: null, name: 'All' }, ...(res.data || [])]);
      } catch { /* ignore */ }
    };
    fetchCategories();
  }, []);

  // Load products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      const params = `?page=${page}&size=12`;
      if (search) {
        const catId = activeCat !== 'All'
          ? categories.find(c => c.name === activeCat)?.id
          : undefined;
        const q = `?keyword=${encodeURIComponent(search)}&page=${page}&size=12`
          + (catId ? `&categoryId=${catId}` : '');
        res = await productAPI.search(q);
      } else if (activeCat !== 'All') {
        const catId = categories.find(c => c.name === activeCat)?.id;
        if (catId) res = await productAPI.getByCategory(catId, params);
        else res = await productAPI.getAll(params);
      } else {
        res = await productAPI.getAll(params);
      }
      setProducts(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCat, categories]);

  useEffect(() => {
    if (categories.length) fetchProducts();
  }, [fetchProducts, categories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(keyword);
    setPage(0);
  };

  const handleCat = (name) => {
    setActiveCat(name);
    setPage(0);
    setSearch('');
    setKeyword('');
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`${product.name} added to bag`, 'success');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="hero-title">
                Discover Your<br /><span>Signature</span> Style
              </div>
              <p className="hero-sub">
                Curated fashion for the modern wardrobe. New arrivals every week.
              </p>
              <form onSubmit={handleSearch} className="d-flex gap-2" style={{ maxWidth: 460 }}>
                <input
                  className="tf-input flex-grow-1"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(184,146,74,.25)', color: 'var(--cream)' }}
                  placeholder="Search products, brands…"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
                <button type="submit" className="btn btn-gold px-4">
                  <i className="bi bi-search" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="flex-grow-1 py-5">
        <div className="container">
          {/* Category pills */}
          <div className="d-flex gap-2 flex-wrap mb-4">
            {categories.map(cat => (
              <button key={cat.name}
                className={`cat-pill ${activeCat === cat.name ? 'active' : ''}`}
                onClick={() => handleCat(cat.name)}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Active filters indicator */}
          {(search || activeCat !== 'All') && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: '.8rem', color: 'var(--slate)' }}>
                {search ? `Results for "${search}"` : `Category: ${activeCat}`}
                {' — '}{products.length} items
              </span>
              <button className="btn btn-sm"
                style={{ fontSize: '.72rem', color: 'var(--slate)', padding: '0 .5rem' }}
                onClick={() => { setSearch(''); setKeyword(''); setActiveCat('All'); }}>
                <i className="bi bi-x-circle me-1" />Clear
              </button>
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="tf-empty">
              <i className="bi bi-search tf-empty-icon" />
              <h5 style={{ fontFamily: 'var(--font-display)' }}>No products found</h5>
              <p style={{ fontSize: '.875rem' }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="row g-4">
              {products.map(product => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <div className="product-card h-100"
                    onClick={() => navigate(`/product/${product.id}`)}>
                    <div className="product-card-img-wrap">
                      <img
                        src={product.imageUrls?.[0] || FALLBACK_IMG}
                        alt={product.name}
                        className="product-card-img"
                        onError={e => { e.target.src = FALLBACK_IMG; }}
                      />
                    </div>
                    <div className="product-card-body">
                      <div className="product-card-cat">{product.category?.name}</div>
                      <div className="product-card-name">{product.name}</div>
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <span className="product-card-price">${product.price?.toFixed(2)}</span>
                        <span className="product-card-stock">
                          {product.stockQuantity > 0
                            ? `${product.stockQuantity} left`
                            : <span style={{ color: 'var(--danger)' }}>Out of stock</span>}
                        </span>
                      </div>
                      <button
                        className="btn btn-ink w-100 mt-3 btn-sm"
                        disabled={product.stockQuantity === 0}
                        onClick={e => handleAddToCart(e, product)}>
                        <i className="bi bi-bag-plus me-2" />Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-5">
              <button className="btn btn-outline-ink btn-sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}>
                <i className="bi bi-chevron-left" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i}
                  className={`btn btn-sm ${i === page ? 'btn-ink' : 'btn-outline-ink'}`}
                  onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button className="btn btn-outline-ink btn-sm"
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}>
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
