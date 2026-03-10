# TrendiFy Frontend — React + Bootstrap

## Tech Stack
- **React 18** (Hooks, Context API)
- **React Router v6** (nested routes, role-based guards)
- **Bootstrap 5.3** (grid, utilities, components)
- **Bootstrap Icons** (icon set)
- **Fetch API** (no axios — async/await with useEffect)

---

## Project Structure

```
src/
├── api/
│   └── api.js               ← All fetch calls. No axios. Centralised per resource.
├── context/
│   ├── AuthContext.jsx       ← JWT user state, login/logout
│   ├── CartContext.jsx       ← Shopping cart (in-memory)
│   └── ToastContext.jsx      ← Global toast notifications
├── components/
│   ├── Navbar.jsx            ← Role-aware navigation bar
│   ├── AdminSidebar.jsx      ← Sidebar for admin/superadmin dashboards
│   ├── ProtectedRoute.jsx    ← Role-based route guard
│   ├── Spinner.jsx           ← Loading indicators
│   └── Footer.jsx            ← Site footer
├── pages/
│   ├── auth/
│   │   ├── Login.jsx         ← JWT login (all roles)
│   │   └── Register.jsx      ← Customer registration
│   ├── customer/
│   │   ├── Home.jsx          ← Browse + search + filter by category
│   │   ├── ProductDetail.jsx ← Product detail + add to cart
│   │   ├── Cart.jsx          ← Shopping bag
│   │   ├── Checkout.jsx      ← Place order form
│   │   ├── OrderHistory.jsx  ← Track/cancel orders
│   │   └── Profile.jsx       ← Edit profile + change password
│   ├── admin/
│   │   ├── AdminDashboard.jsx    ← Stats + recent orders + low stock
│   │   ├── ProductManagement.jsx ← Full CRUD + image upload
│   │   ├── OrderManagement.jsx   ← View + update order status
│   │   └── Inventory.jsx         ← Adjust stock levels
│   └── superadmin/
│       ├── SuperAdminDashboard.jsx ← Platform overview
│       ├── AdminManagement.jsx     ← Create/disable/delete admins
│       ├── CategoryManagement.jsx  ← CRUD categories
│       ├── UserManagement.jsx      ← View/filter/manage all users
│       └── Analytics.jsx           ← Charts + top products + funnel
├── App.jsx                  ← All routes + role-based redirect
├── index.jsx
└── index.css                ← Design tokens + custom component styles
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Backend running on http://localhost:8080

### Install & Run
```bash
npm install
npm start
```
Opens at: **http://localhost:3000**

### Environment Variable (optional)
Create a `.env` file to point at a different backend:
```
REACT_APP_API_URL=http://localhost:8080/api
```

---

## Role Routing

| Role        | Default Route  | Access                                |
|-------------|----------------|---------------------------------------|
| Customer    | `/shop`        | Shop, Cart, Orders, Profile           |
| Admin       | `/admin`       | Dashboard, Products, Orders, Inventory|
| Super Admin | `/superadmin`  | All admin + Users, Categories, Analytics |

---

## Data Fetching Pattern

**All API calls use `fetch` + `async/await` inside `useEffect`:**

```jsx
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll('?page=0&size=12');
      setProducts(res.data?.content || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [page]);
```

The `api.js` file exports typed API modules:
- `authAPI` — login, register
- `productAPI` — browse, search, CRUD, stock
- `categoryAPI` — CRUD
- `orderAPI` — place, track, admin management
- `userAPI` — profile, admin user management

---

## Authentication

- JWT stored in `localStorage` as `tf_token`
- Attached to every request via `Authorization: Bearer <token>`
- `AuthContext` provides `user`, `login()`, `logout()`
- `ProtectedRoute` redirects unauthorised users by role

---

## Design System

Custom CSS variables in `index.css`:
- `--ink` #0f0e0c — primary dark
- `--gold` #b8924a — accent
- `--cream` #faf7f2 — background
- `--font-display` Cormorant Garamond
- `--font-body` Jost
