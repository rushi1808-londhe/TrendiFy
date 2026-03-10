import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin, isSuperAdmin, isCustomer } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar tf-navbar navbar-expand-lg sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand" to="/">
          Trendi<span>Fy</span>
        </Link>

        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#tfNav">
          <i className="bi bi-list text-light fs-4" />
        </button>

        <div className="collapse navbar-collapse" id="tfNav">
          <ul className="navbar-nav me-auto">
            {/* Customer nav */}
            {(!user || isCustomer()) && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/')}`} to="/">Shop</Link>
                </li>
              </>
            )}

            {/* Admin nav */}
            {isAdmin() && !isSuperAdmin() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin')}`} to="/admin">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/products')}`} to="/admin/products">Products</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/orders')}`} to="/admin/orders">Orders</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/inventory')}`} to="/admin/inventory">Inventory</Link>
                </li>
              </>
            )}

            {/* Super Admin nav */}
            {isSuperAdmin() && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/superadmin')}`} to="/superadmin">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/superadmin/admins')}`} to="/superadmin/admins">Admins</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/superadmin/categories')}`} to="/superadmin/categories">Categories</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/superadmin/users')}`} to="/superadmin/users">Users</Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav align-items-center gap-1">
            {user ? (
              <>
                {/* Cart (Customer only) */}
                {isCustomer() && (
                  <li className="nav-item">
                    <Link className="nav-link position-relative" to="/cart">
                      <i className="bi bi-bag fs-5" />
                      {totalItems > 0 && (
                        <span className="cart-count">{totalItems}</span>
                      )}
                    </Link>
                  </li>
                )}

                {/* Orders (Customer) */}
                {isCustomer() && (
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/orders')}`} to="/orders">
                      My Orders
                    </Link>
                  </li>
                )}

                {/* Profile */}
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center gap-2"
                    href="#" role="button" data-bs-toggle="dropdown">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{ width:30, height:30, background:'rgba(184,146,74,.2)', fontSize:'.7rem', color:'var(--gold)', fontWeight:700 }}>
                      {user.fullName?.[0]?.toUpperCase()}
                    </span>
                    <span style={{ color:'var(--gold-light)', fontSize:'.8rem', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {user.fullName?.split(' ')[0]}
                    </span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end"
                    style={{ background:'var(--ink-soft)', border:'1px solid rgba(255,255,255,.1)', borderRadius:6, minWidth:160 }}>
                    {isCustomer() && (
                      <li>
                        <Link className="dropdown-item" to="/profile"
                          style={{ color:'rgba(250,247,242,.7)', fontSize:'.85rem' }}>
                          <i className="bi bi-person me-2" />Profile
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" style={{ borderColor:'rgba(255,255,255,.1)' }} /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}
                        style={{ color:'#e74c3c', fontSize:'.85rem' }}>
                        <i className="bi bi-box-arrow-right me-2" />Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Sign In</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-gold btn-sm ms-2" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
