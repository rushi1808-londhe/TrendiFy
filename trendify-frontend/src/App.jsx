import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer
import Home         from './pages/customer/Home';
import ProductDetail from './pages/customer/ProductDetail';
import Cart         from './pages/customer/Cart';
import Checkout     from './pages/customer/Checkout';
import OrderHistory from './pages/customer/OrderHistory';
import Profile      from './pages/customer/Profile';

// Admin
import AdminDashboard    from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement   from './pages/admin/OrderManagement';
import Inventory         from './pages/admin/Inventory';

// Super Admin
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AdminManagement     from './pages/superadmin/AdminManagement';
import CategoryManagement  from './pages/superadmin/CategoryManagement';
import UserManagement      from './pages/superadmin/UserManagement';
import Analytics           from './pages/superadmin/Analytics';
import SuperAdminOrders    from './pages/superadmin/SuperAdminOrders';

// Root redirect based on role
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'SUPER_ADMIN') return <Navigate to="/superadmin" replace />;
  if (user.role === 'ADMIN')       return <Navigate to="/admin" replace />;
  return <Navigate to="/shop" replace />;
}

// Layout with Navbar (for non-dashboard pages)
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>

              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Auth (no navbar) */}
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer (with navbar) */}
              <Route path="/shop" element={
                <MainLayout>
                  <Home />
                </MainLayout>
              } />
              <Route path="/product/:id" element={
                <MainLayout>
                  <ProductDetail />
                </MainLayout>
              } />
              <Route path="/cart" element={
                <MainLayout>
                  <ProtectedRoute roles={['CUSTOMER']}>
                    <Cart />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/checkout" element={
                <MainLayout>
                  <ProtectedRoute roles={['CUSTOMER']}>
                    <Checkout />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/orders" element={
                <MainLayout>
                  <ProtectedRoute roles={['CUSTOMER']}>
                    <OrderHistory />
                  </ProtectedRoute>
                </MainLayout>
              } />
              <Route path="/profile" element={
                <MainLayout>
                  <ProtectedRoute roles={['CUSTOMER']}>
                    <Profile />
                  </ProtectedRoute>
                </MainLayout>
              } />

              {/* Admin (no extra navbar — sidebar is built in) */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <OrderManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/inventory" element={
                <ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}>
                  <Inventory />
                </ProtectedRoute>
              } />

              {/* Super Admin */}
              <Route path="/superadmin" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/admins" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <AdminManagement />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/categories" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <CategoryManagement />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/users" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/analytics" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/superadmin/orders" element={
                <ProtectedRoute roles={['SUPER_ADMIN']}>
                  <SuperAdminOrders />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
