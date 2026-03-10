const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url; // already absolute
  return `http://localhost:8080${url}`;   // prepend backend host
};
// ── Token helpers ────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('tf_token');
export const saveToken = (token) => localStorage.setItem('tf_token', token);
export const clearToken = () => localStorage.removeItem('tf_token');

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('tf_user')); } catch { return null; }
};
export const saveUser = (user) => localStorage.setItem('tf_user', JSON.stringify(user));
export const clearUser = () => localStorage.removeItem('tf_user');

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = { ...options, headers };
  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 204 No Content
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.message || `HTTP error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

// ── Multipart upload (no JSON Content-Type) ──────────────────────────────────
export async function uploadFile(endpoint, formData) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Upload failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
};

// ── Products ─────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params = '') => request(`/products${params}`),
  getById: (id) => request(`/products/${id}`),
  search: (params) => request(`/products/search${params}`),
  getByCategory: (id, params = '') => request(`/products/category/${id}${params}`),
  getTopSelling: (limit = 8) => request(`/products/top-selling?limit=${limit}`),

  // Admin
  getAllAdmin: (page = 0, size = 20) => request(`/products/admin/all?page=${page}&size=${size}`),
  getLowStock: (threshold = 5) => request(`/products/admin/low-stock?threshold=${threshold}`),
  create: (body) => request('/products', { method: 'POST', body }),
  update: (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  updateStock: (id, qty) => request(`/products/${id}/stock?quantity=${qty}`, { method: 'PATCH' }),
  uploadWithImages: (formData) => uploadFile('/products/with-images', formData),
};

// ── Categories ───────────────────────────────────────────────────────────────
export const categoryAPI = {
  getActive: () => request('/categories'),
  getAll: () => request('/categories/all'),
  getById: (id) => request(`/categories/${id}`),
  create: (body) => request('/categories', { method: 'POST', body }),
  update: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Orders ───────────────────────────────────────────────────────────────────
export const orderAPI = {
  // Customer
  place: (body) => request('/orders', { method: 'POST', body }),
  getMyOrders: () => request('/orders/my'),
  getMyOrder: (orderNumber) => request(`/orders/my/${orderNumber}`),
  cancel: (id) => request(`/orders/my/${id}/cancel`, { method: 'PATCH' }),

  // Admin
  getAll: (page = 0, size = 20) => request(`/orders/admin/all?page=${page}&size=${size}`),
  getById: (id) => request(`/orders/admin/${id}`),
  updateStatus: (id, status) => request(`/orders/admin/${id}/status`, {
    method: 'PATCH', body: { status },
  }),
  getStats: () => request('/orders/admin/stats'),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => request('/users/me'),
  updateMe: (body) => request('/users/me', { method: 'PUT', body }),
  changePassword: (body) => request('/users/me/password', { method: 'PATCH', body }),
  uploadAvatar: (formData) => uploadFile('/users/me/avatar', formData),

  // Super Admin
  getAll: () => request('/users/admin/all'),
  getCustomers: () => request('/users/admin/customers'),
  getAdmins: () => request('/users/admin/admins'),
  createAdmin: (body) => request('/users/admin/create-admin', { method: 'POST', body }),
  toggleStatus: (id) => request(`/users/admin/${id}/toggle-status`, { method: 'PATCH' }),
  delete: (id) => request(`/users/admin/${id}`, { method: 'DELETE' }),
};
