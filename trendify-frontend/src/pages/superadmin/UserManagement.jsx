import { useState, useEffect } from 'react';
import { userAPI } from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';

export default function UserManagement() {
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch]     = useState('');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getAll();
        setUsers(res.data || []);
      } catch (err) { showToast(err.message, 'error'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'ALL') result = result.filter(u => u.role === roleFilter);
    if (search) {
      const kw = search.toLowerCase();
      result = result.filter(u =>
        u.fullName?.toLowerCase().includes(kw) ||
        u.email?.toLowerCase().includes(kw)
      );
    }
    setFiltered(result);
  }, [users, roleFilter, search]);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await userAPI.toggleStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? res.data : u));
      showToast('User status updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    setDeleting(id);
    try {
      await userAPI.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted', 'warning');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(null); }
  };

  const ROLE_BADGE = {
    SUPER_ADMIN: { cls: 'badge-pending', label: 'Super Admin' },
    ADMIN:       { cls: 'badge-processing', label: 'Admin' },
    CUSTOMER:    { cls: 'badge-shipped', label: 'Customer' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar active="/superadmin/users" />
      <div className="tf-dash-content">
        <div className="mb-4">
          <h1 className="tf-page-title">All Users</h1>
          <p className="tf-page-sub">View and manage every account on the platform</p>
        </div>

        {/* Filters */}
        <div className="d-flex gap-3 flex-wrap mb-4">
          <input className="tf-input" style={{ maxWidth: 280 }}
            placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="d-flex gap-2">
            {['ALL', 'SUPER_ADMIN', 'ADMIN', 'CUSTOMER'].map(r => (
              <button key={r}
                className={`cat-pill ${roleFilter === r ? 'active' : ''}`}
                onClick={() => setRoleFilter(r)}>
                {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div className="tf-table-wrap">
            <table className="tf-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center" style={{ padding: '3rem', color: 'var(--slate)' }}>
                    No users found
                  </td></tr>
                ) : filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--slate)', fontSize: '.78rem' }}>{i + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center justify-content-center rounded-circle"
                          style={{ width: 32, height: 32, background: 'var(--ink)', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                          {u.fullName?.[0]}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '.875rem' }}>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--slate)', fontSize: '.82rem' }}>{u.email}</td>
                    <td>
                      <span className={`tf-badge ${ROLE_BADGE[u.role]?.cls}`}>
                        {ROLE_BADGE[u.role]?.label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate)', fontSize: '.78rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`tf-badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'SUPER_ADMIN' && (
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-outline-ink"
                            disabled={toggling === u.id}
                            onClick={() => handleToggle(u.id)}>
                            {toggling === u.id
                              ? <span className="spinner-border spinner-border-sm" />
                              : u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>
                          <button className="btn btn-sm"
                            style={{ background: 'rgba(192,57,43,.1)', color: 'var(--danger)', border: '1px solid rgba(192,57,43,.2)' }}
                            disabled={deleting === u.id}
                            onClick={() => handleDelete(u.id)}>
                            {deleting === u.id
                              ? <span className="spinner-border spinner-border-sm" />
                              : <i className="bi bi-trash3" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3" style={{ fontSize: '.78rem', color: 'var(--slate)' }}>
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
