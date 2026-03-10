import { useState, useEffect } from 'react';
import { productAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner, InlineSpinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [adjusting, setAdjusting] = useState({});
  const [quantities, setQuantities] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAllAdmin(0, 100);
        const items = res.data?.content || [];
        setProducts(items);
        const qMap = {};
        items.forEach(p => { qMap[p.id] = 0; });
        setQuantities(qMap);
      } catch (err) { showToast(err.message, 'error'); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleAdjust = async (productId, delta) => {
    const adj = quantities[productId] || 0;
    if (adj === 0) { showToast('Enter a quantity to adjust', 'warning'); return; }
    setAdjusting(p => ({ ...p, [productId]: true }));
    try {
      const res = await productAPI.updateStock(productId, delta * adj);
      setProducts(prev => prev.map(p => p.id === productId ? res.data : p));
      setQuantities(prev => ({ ...prev, [productId]: 0 }));
      showToast(`Stock ${delta > 0 ? 'added' : 'removed'}`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setAdjusting(p => ({ ...p, [productId]: false })); }
  };

  const stockColor = (qty) =>
    qty === 0 ? 'var(--danger)' : qty <= 5 ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/inventory" />
      <div className="tf-dash-content">
        <div className="mb-4">
          <h1 className="tf-page-title">Inventory</h1>
          <p className="tf-page-sub">Monitor and adjust product stock levels</p>
        </div>

        {loading ? <Spinner /> : (
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Sales</th>
                  <th style={{ minWidth: 260 }}>Adjust Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{p.name}</div>
                      {p.sku && <div style={{ fontSize: '.7rem', color: 'var(--slate)' }}>SKU: {p.sku}</div>}
                    </td>
                    <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{p.category?.name}</td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: stockColor(p.stockQuantity) }}>
                        {p.stockQuantity}
                      </span>
                      {p.stockQuantity === 0 && (
                        <span className="ms-2 tf-badge badge-cancelled" style={{ fontSize: '.62rem' }}>Out</span>
                      )}
                      {p.stockQuantity > 0 && p.stockQuantity <= 5 && (
                        <span className="ms-2 tf-badge badge-pending" style={{ fontSize: '.62rem' }}>Low</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{p.totalSales || 0}</td>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          type="number" min={1}
                          className="tf-input"
                          style={{ width: 70, padding: '.35rem .6rem' }}
                          value={quantities[p.id] || ''}
                          placeholder="Qty"
                          onChange={e => setQuantities(prev => ({ ...prev, [p.id]: Math.abs(parseInt(e.target.value) || 0) }))}
                        />
                        <button className="btn btn-sm btn-success"
                          style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '.35rem .7rem' }}
                          disabled={adjusting[p.id]}
                          onClick={() => handleAdjust(p.id, 1)}>
                          {adjusting[p.id] ? <InlineSpinner /> : <><i className="bi bi-plus" /> Add</>}
                        </button>
                        <button className="btn btn-sm"
                          style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.2)', padding: '.35rem .7rem' }}
                          disabled={adjusting[p.id]}
                          onClick={() => handleAdjust(p.id, -1)}>
                          <i className="bi bi-dash" /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
