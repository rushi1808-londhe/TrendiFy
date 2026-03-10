import { useState, useEffect, useRef } from 'react';
import { productAPI, categoryAPI, uploadFile } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner, InlineSpinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../api/api';

const EMPTY_FORM = {
  name: '', description: '', price: '', stockQuantity: 0,
  categoryId: '', sku: '', brand: '', size: '', color: '', active: true,
};

export default function ProductManagement() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [deleting, setDeleting]     = useState(null);
  const fileRef = useRef();
  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAllAdmin(page, 12);
      setProducts(res.data?.content || []);
      setTotalPages(res.data?.totalPages || 0);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getAll();
        setCategories(res.data || []);
      } catch { /* ignore */ }
    };
    fetchCats();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name || '', description: product.description || '',
      price: product.price || '', stockQuantity: product.stockQuantity || 0,
      categoryId: product.category?.id || '', sku: product.sku || '',
      brand: product.brand || '', size: product.size || '',
      color: product.color || '', active: product.active ?? true,
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      showToast('Name, price and category are required', 'error'); return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        categoryId: parseInt(form.categoryId),
        imageUrls: editing?.imageUrls || [],
      };

      // Upload images if selected
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('files', f));
        fd.append('folder', 'products');
        const uploadRes = await uploadFile('/files/upload-multiple', fd);
        body.imageUrls = [...body.imageUrls, ...(uploadRes.data || [])];
      }

      if (editing) {
        const res = await productAPI.update(editing.id, body);
        setProducts(prev => prev.map(p => p.id === editing.id ? res.data : p));
        showToast('Product updated', 'success');
      } else {
        const res = await productAPI.create(body);
        setProducts(prev => [res.data, ...prev]);
        showToast('Product created', 'success');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted', 'warning');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(null); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/admin/products" />
      <div className="tf-dash-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="tf-page-title">Products</h1>
            <p className="tf-page-sub">Manage your product catalogue</p>
          </div>
          <button className="btn btn-gold" onClick={openCreate}>
            <i className="bi bi-plus-lg me-2" />Add Product
          </button>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="tf-table-wrap">
              <table className="tf-table">
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>Price</th>
                    <th>Stock</th><th>Sales</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="text-center" style={{ color: 'var(--slate)', padding: '3rem' }}>No products found</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={getImageUrl(p.imageUrls?.[0]) || FALLBACK_IMG}
                            alt={p.name}
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.875rem' }}>{p.name}</div>
                            {p.sku && <div style={{ fontSize: '.7rem', color: 'var(--slate)' }}>SKU: {p.sku}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--slate)' }}>{p.category?.name}</td>
                      <td style={{ fontWeight: 700 }}>${p.price?.toFixed(2)}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: p.stockQuantity === 0 ? 'var(--danger)'
                            : p.stockQuantity <= 5 ? 'var(--warning)'
                            : 'var(--success)',
                        }}>{p.stockQuantity}</span>
                      </td>
                      <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{p.totalSales || 0}</td>
                      <td>
                        <span className={`tf-badge ${p.active ? 'badge-active' : 'badge-inactive'}`}>
                          {p.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-ink" onClick={() => openEdit(p)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-sm"
                            style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.15)' }}
                            disabled={deleting === p.id}
                            onClick={() => handleDelete(p.id)}>
                            {deleting === p.id
                              ? <span className="spinner-border spinner-border-sm" />
                              : <i className="bi bi-trash3" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`btn btn-sm ${i === page ? 'btn-ink' : 'btn-outline-ink'}`}
                    onClick={() => setPage(i)}>{i + 1}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          backdropFilter: 'blur(4px)',
        }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Edit Product' : 'New Product'}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="tf-form-label">Product Name *</label>
                  <input name="name" className="tf-input" value={form.name} onChange={handleChange} placeholder="e.g. Silk Midi Dress" />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">Price *</label>
                  <input name="price" type="number" step="0.01" className="tf-input" value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">Stock Quantity *</label>
                  <input name="stockQuantity" type="number" className="tf-input" value={form.stockQuantity} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Category *</label>
                  <select name="categoryId" className="tf-input" value={form.categoryId} onChange={handleChange}>
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Description</label>
                  <textarea name="description" className="tf-input" rows={3} value={form.description} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="tf-form-label">Brand</label>
                  <input name="brand" className="tf-input" value={form.brand} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="tf-form-label">Color</label>
                  <input name="color" className="tf-input" value={form.color} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="tf-form-label">Size</label>
                  <input name="size" className="tf-input" value={form.size} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">SKU</label>
                  <input name="sku" className="tf-input" value={form.sku} onChange={handleChange} />
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', marginBottom: 0 }}>
                    <input type="checkbox" name="active" checked={form.active} onChange={handleChange}
                      style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                    <span style={{ fontWeight: 600, fontSize: '.875rem' }}>Active / Visible</span>
                  </label>
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Upload Images</label>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="tf-input"
                    onChange={e => setImageFiles(Array.from(e.target.files))} />
                  {imageFiles.length > 0 && (
                    <div style={{ fontSize: '.75rem', color: 'var(--success)', marginTop: '.3rem' }}>
                      {imageFiles.length} image(s) selected
                    </div>
                  )}
                  {editing?.imageUrls?.length > 0 && (
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {editing.imageUrls.map((url, i) => (
                        <img key={i} src={url} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer gap-2">
              <button className="btn btn-outline-ink" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving && <InlineSpinner />}
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
