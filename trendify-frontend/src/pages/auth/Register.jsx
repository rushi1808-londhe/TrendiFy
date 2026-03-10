import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { InlineSpinner } from '../../components/Spinner';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data, res.data.token);
      showToast('Account created! Welcome to TrendiFy.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left d-none d-lg-flex">
        <div>
          <div className="auth-left-brand">TrendiFy</div>
          <div className="auth-left-sub">Join the Collection</div>
          <div className="auth-left-rule" />
          <p className="auth-left-desc">
            Create your account and unlock exclusive access to our curated
            fashion collections, personalised recommendations, and seamless
            order tracking.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div style={{ width: '100%' }}>
          <div className="auth-form-title">Create account</div>
          <p className="auth-form-hint">Join TrendiFy today — it's free</p>

          {error && (
            <div className="tf-alert tf-alert-danger">
              <i className="bi bi-exclamation-circle me-2" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="auth-label">Full Name</label>
              <input name="fullName" className="auth-input" placeholder="Your full name"
                value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="auth-label">Email Address</label>
              <input name="email" type="email" className="auth-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="auth-label">Password</label>
              <input name="password" type="password" className="auth-input"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="auth-label">Phone <span style={{ opacity: .5 }}>(optional)</span></label>
              <input name="phone" className="auth-input" placeholder="+1 555 000 0000"
                value={form.phone} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="auth-label">Address <span style={{ opacity: .5 }}>(optional)</span></label>
              <input name="address" className="auth-input" placeholder="Your shipping address"
                value={form.address} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-gold w-100" disabled={loading}>
              {loading && <InlineSpinner />}
              Create Account
            </button>
          </form>

          <p className="text-center mt-3" style={{ fontSize: '.83rem', color: 'rgba(250,247,242,.4)' }}>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
