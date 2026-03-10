import { useState, useEffect } from 'react';
import { userAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner, InlineSpinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AdminManagement() {
  const [admins,  setAdmins]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]   = useState({ fullName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { showToast } = useToast();

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAdmins();
      setAdmins(res.data || []);
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.password) {
      showToast('All fields required', 'error'); return;
    }
    setSaving(true);
    try {
      const res = await userAPI.createAdmin(form);
      setAdmins(prev => [...prev, res.data]);
      setForm({ fullName: '', email: '', password: '' });
      setShowModal(false);
      showToast('Admin account created', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await userAPI.toggleStatus(id);
      setAdmins(prev => prev.map(a => a.id === id ? res.data : a));
      showToast('Status updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin account?')) return;
    setDeleting(id);
    try {
      await userAPI.delete(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      showToast('Admin deleted', 'warning');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(null); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin/admins" />
      <div className="tf-dash-content">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="tf-page-title">Admin Management</h1>
            <p className="tf-page-sub">Create and manage admin accounts</p>
          </div>
          <button className="btn btn-gold" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2" />Create Admin
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Created</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td colSpan={5} className="text-center" style={{ padding: '3rem', color: 'var(--slate)' }}>
                    No admin accounts yet
                  </td></tr>
                ) : admins.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 36, height: 36, background: 'var(--ink)', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700, flexShrink: 0 }}>
                          {a.fullName?.[0]}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '.875rem' }}>{a.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{a.email}</td>
                    <td style={{ color: 'var(--slate)', fontSize: '.78rem' }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`tf-badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-ink"
                          disabled={toggling === a.id}
                          onClick={() => handleToggle(a.id)}>
                          {toggling === a.id
                            ? <span className="spinner-border spinner-border-sm" />
                            : a.status === 'ACTIVE'
                              ? <><i className="bi bi-pause-circle me-1" />Disable</>
                              : <><i className="bi bi-play-circle me-1" />Enable</>}
                        </button>
                        <button className="btn btn-sm"
                          style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.2)' }}
                          disabled={deleting === a.id}
                          onClick={() => handleDelete(a.id)}>
                          {deleting === a.id
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
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: 440 }}>
            <div className="modal-header">
              <h5 className="modal-title">Create Admin Account</h5>
              <button className="btn-close" onClick={() => setShowModal(false)} />
            </div>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-12">
                  <label className="tf-form-label">Full Name *</label>
                  <input className="tf-input" value={form.fullName}
                    onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Admin full name" />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Email *</label>
                  <input type="email" className="tf-input" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@trendify.com" />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Password *</label>
                  <input type="password" className="tf-input" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 characters" />
                </div>
              </div>
            </div>
            <div className="modal-footer gap-2">
              <button className="btn btn-outline-ink" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleCreate} disabled={saving}>
                {saving && <InlineSpinner />}Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
