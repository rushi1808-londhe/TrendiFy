import { useState, useEffect } from 'react';
import { categoryAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner, InlineSpinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

const EMPTY = { name: '', description: '', imageUrl: '', active: true };

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit   = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || '', imageUrl: cat.imageUrl || '', active: cat.active }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) { showToast('Category name required', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await categoryAPI.update(editing.id, form);
        setCategories(prev => prev.map(c => c.id === editing.id ? res.data : c));
        showToast('Category updated', 'success');
      } else {
        const res = await categoryAPI.create(form);
        setCategories(prev => [...prev, res.data]);
        showToast('Category created', 'success');
      }
      setShowModal(false);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Products in it may be affected.')) return;
    setDeleting(id);
    try {
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Category deleted', 'warning');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(null); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin/categories" />
      <div className="tf-dash-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="tf-page-title">Categories</h1>
            <p className="tf-page-sub">Manage product categories</p>
          </div>
          <button className="btn btn-gold" onClick={openCreate}>
            <i className="bi bi-plus-lg me-2" />Add Category
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="row g-3">
            {categories.length === 0 ? (
              <div className="tf-empty col-12">
                <i className="bi bi-tag tf-empty-icon" />
                <h5>No categories yet</h5>
              </div>
            ) : categories.map(cat => (
              <div key={cat.id} className="col-sm-6 col-lg-4">
                <div className="tf-card p-3 h-100">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                        {cat.name}
                      </div>
                      {cat.description && (
                        <div style={{ fontSize: '.78rem', color: 'var(--slate)', marginTop: '.3rem', lineHeight: 1.6 }}>
                          {cat.description}
                        </div>
                      )}
                      <div className="mt-2">
                        <span className={`tf-badge ${cat.active ? 'badge-active' : 'badge-inactive'}`}>
                          {cat.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {cat.imageUrl && (
                      <img src={cat.imageUrl} alt={cat.name}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-sm btn-outline-ink flex-grow-1" onClick={() => openEdit(cat)}>
                      <i className="bi bi-pencil me-1" />Edit
                    </button>
                    <button className="btn btn-sm"
                      style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.2)' }}
                      disabled={deleting === cat.id}
                      onClick={() => handleDelete(cat.id)}>
                      {deleting === cat.id
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className="bi bi-trash3" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: 440 }}>
            <div className="modal-header">
              <h5 className="modal-title">{editing ? 'Edit Category' : 'New Category'}</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="tf-form-label">Name *</label>
                  <input className="tf-input" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Outerwear" />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Description</label>
                  <textarea className="tf-input" rows={3} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Image URL</label>
                  <input className="tf-input" value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://…" />
                </div>
                <div className="col-12">
                  <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active}
                      onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--gold)' }} />
                    <span style={{ fontWeight: 600, fontSize: '.875rem' }}>Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer gap-2">
              <button className="btn btn-outline-ink" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                {saving && <InlineSpinner />}{editing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
