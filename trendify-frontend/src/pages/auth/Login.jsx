import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InlineSpinner } from '../../components/Spinner';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data, res.data.token);
      showToast(`Welcome back, ${res.data.fullName}!`, 'success');
      const role = res.data.role;
      if (role === 'SUPER_ADMIN') navigate('/superadmin');
      else if (role === 'ADMIN')  navigate('/admin');
      else                        navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left d-none d-lg-flex">
        <div>
          <div className="auth-left-brand">TrendiFy</div>
          <div className="auth-left-sub">Fashion Redefined</div>
          <div className="auth-left-rule" />
          <p className="auth-left-desc">
            Curated collections for the modern wardrobe. Discover pieces
            that speak to your individual style — from seasonal essentials
            to statement looks.
          </p>
          <div className="mt-4 d-flex gap-4">
            {[['2,000+', 'Products'], ['50K+', 'Customers'], ['99%', 'Satisfaction']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold)', fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(250,247,242,.3)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div style={{ width: '100%' }}>
          <div className="auth-form-title">Welcome back</div>
          <p className="auth-form-hint">Sign in to your TrendiFy account</p>

          {error && (
            <div className="tf-alert tf-alert-danger">
              <i className="bi bi-exclamation-circle me-2" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="auth-label">Email Address</label>
              <input name="email" type="email" className="auth-input"
                placeholder="you@example.com" value={form.email}
                onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="auth-label">Password</label>
              <input name="password" type="password" className="auth-input"
                placeholder="••••••••" value={form.password}
                onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-gold w-100" disabled={loading}>
              {loading && <InlineSpinner />}
              Sign In
            </button>
          </form>

          <p className="text-center mt-3" style={{ fontSize: '.83rem', color: 'rgba(250,247,242,.4)' }}>
            No account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
