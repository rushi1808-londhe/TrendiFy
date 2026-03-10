import { useState, useEffect } from 'react';
import { userAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Spinner, InlineSpinner } from '../../components/Spinner';
import Footer from '../../components/Footer';


export default function Profile() {
  const { user: authUser, login } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [tab, setTab]           = useState('profile');

  const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await userAPI.getMe();
        setProfile(res.data);
        setForm({ fullName: res.data.fullName, phone: res.data.phone || '', address: res.data.address || '' });
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userAPI.updateMe(form);
      setProfile(res.data);
      login({ ...authUser, fullName: res.data.fullName }, localStorage.getItem('tf_token'));
      showToast('Profile updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await userAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
      showToast('Password changed', 'success');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1 py-5">
        <div className="container" style={{ maxWidth: 720 }}>
          {/* Header */}
          <div className="d-flex align-items-center gap-4 mb-5">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 72, height: 72, background: 'var(--ink)', fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 700 }}>
              {profile?.fullName?.[0]}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '.2rem' }}>
                {profile?.fullName}
              </h1>
              <p style={{ color: 'var(--slate)', fontSize: '.875rem', margin: 0 }}>{profile?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="d-flex gap-1 mb-4"
            style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
            {[['profile', 'bi-person', 'Profile'], ['password', 'bi-lock', 'Password']].map(([id, icon, label]) => (
              <button key={id}
                className="btn"
                style={{
                  borderRadius: 0,
                  borderBottom: `2px solid ${tab === id ? 'var(--gold)' : 'transparent'}`,
                  color: tab === id ? 'var(--gold)' : 'var(--slate)',
                  fontWeight: tab === id ? 700 : 500,
                  fontSize: '.83rem', letterSpacing: '.06em', textTransform: 'uppercase',
                  padding: '.5rem 1.1rem',
                  marginBottom: '-1px',
                }}
                onClick={() => setTab(id)}>
                <i className={`bi ${icon} me-2`} />{label}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <form onSubmit={handleUpdate} className="tf-card p-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="tf-form-label">Full Name</label>
                  <input className="tf-input" value={form.fullName}
                    onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">Email</label>
                  <input className="tf-input" value={profile?.email} disabled
                    style={{ opacity: .5, cursor: 'not-allowed' }} />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">Phone</label>
                  <input className="tf-input" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 555 000 0000" />
                </div>
                <div className="col-12">
                  <label className="tf-form-label">Shipping Address</label>
                  <input className="tf-input" value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Default shipping address" />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn btn-gold" disabled={saving}>
                  {saving && <InlineSpinner />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Password tab */}
          {tab === 'password' && (
            <form onSubmit={handlePwChange} className="tf-card p-4">
              {pwError && (
                <div className="tf-alert tf-alert-danger mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{pwError}
                </div>
              )}
              <div className="row g-3">
                <div className="col-12">
                  <label className="tf-form-label">Current Password</label>
                  <input type="password" className="tf-input"
                    value={pwForm.oldPassword}
                    onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">New Password</label>
                  <input type="password" className="tf-input"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required />
                </div>
                <div className="col-md-6">
                  <label className="tf-form-label">Confirm Password</label>
                  <input type="password" className="tf-input"
                    value={pwForm.confirm}
                    onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn btn-gold" disabled={pwSaving}>
                  {pwSaving && <InlineSpinner />}
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
