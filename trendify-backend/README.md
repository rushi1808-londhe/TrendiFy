# TrendiFy Backend — Spring Boot REST API

## Tech Stack
- **Java 17** + **Spring Boot 3.2**
- **MySQL** + **Spring Data JPA / Hibernate**
- **Spring Security** + **JWT Authentication**
- **Multipart File Upload** (images)
- **Lombok** + **Bean Validation**

---

## Quick Start

### 1. Prerequisites
- Java 17+
- MySQL 8+
- Maven 3.8+

### 2. Create MySQL Database
```sql
CREATE DATABASE trendify_db;
```

### 3. Configure application.properties
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/trendify_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 4. Run
```bash
mvn spring-boot:run
```
Server starts at: **http://localhost:8080**

### 5. Seeded Credentials
On first run, these accounts are auto-created:

| Role        | Email                      | Password        |
|-------------|----------------------------|-----------------|
| Super Admin | superadmin@trendify.com    | SuperAdmin@123  |
| Admin       | admin@trendify.com         | Admin@123       |

---

## Project Structure
```
src/main/java/com/trendify/
├── TrendifyApplication.java       ← Entry point
├── config/
│   ├── SecurityConfig.java        ← JWT security + role rules
│   ├── CorsConfig.java            ← CORS for React frontend
│   ├── WebMvcConfig.java          ← Serve uploaded images
│   └── DataSeeder.java            ← Auto-seed DB on startup
├── controller/
│   ├── AuthController.java        ← /api/auth/*
│   ├── ProductController.java     ← /api/products/*
│   ├── CategoryController.java    ← /api/categories/*
│   ├── OrderController.java       ← /api/orders/*
│   ├── UserController.java        ← /api/users/*
│   └── FileController.java        ← /api/files/*
├── model/
│   ├── User.java                  ← Users (SUPER_ADMIN, ADMIN, CUSTOMER)
│   ├── Category.java
│   ├── Product.java
│   ├── Order.java
│   └── OrderItem.java
├── repository/                    ← Spring Data JPA interfaces
├── service/                       ← Business logic
├── security/
│   ├── JwtTokenProvider.java      ← Token generation & validation
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
├── dto/                           ← Request/Response objects
└── exception/
    ├── ResourceNotFoundException.java
    └── GlobalExceptionHandler.java ← Consistent error responses
```

---

## API Reference

### 🔐 Auth — `/api/auth`

| Method | Endpoint              | Body                                      | Auth | Description         |
|--------|-----------------------|-------------------------------------------|------|---------------------|
| POST   | `/api/auth/register`  | `{fullName, email, password, phone?}`     | ❌   | Register customer   |
| POST   | `/api/auth/login`     | `{email, password}`                       | ❌   | Login & get JWT     |

**Login Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "type": "Bearer",
    "id": 1,
    "fullName": "Aria Chen",
    "email": "user@example.com",
    "role": "CUSTOMER"
  }
}
```

> Include JWT in all protected requests:
> `Authorization: Bearer <token>`

---

### 👟 Products — `/api/products`

| Method | Endpoint                          | Auth          | Description                    |
|--------|-----------------------------------|---------------|--------------------------------|
| GET    | `/api/products`                   | ❌ Public     | Browse products (paginated)    |
| GET    | `/api/products/{id}`              | ❌ Public     | Product detail                 |
| GET    | `/api/products/search?keyword=`   | ❌ Public     | Search products                |
| GET    | `/api/products/category/{id}`     | ❌ Public     | Filter by category             |
| GET    | `/api/products/top-selling`       | ❌ Public     | Top selling products           |
| GET    | `/api/products/admin/all`         | ✅ ADMIN      | All products (incl. inactive)  |
| GET    | `/api/products/admin/low-stock`   | ✅ ADMIN      | Low stock alerts               |
| POST   | `/api/products`                   | ✅ ADMIN      | Create product (JSON)          |
| POST   | `/api/products/with-images`       | ✅ ADMIN      | Create product + images upload |
| PUT    | `/api/products/{id}`              | ✅ ADMIN      | Update product                 |
| DELETE | `/api/products/{id}`              | ✅ ADMIN      | Delete product                 |
| PATCH  | `/api/products/{id}/stock`        | ✅ ADMIN      | Adjust stock                   |

**Query Params (GET /api/products):**
- `page` (default: 0), `size` (default: 12)
- `sortBy` (default: `createdAt`), `direction` (`asc`/`desc`)

---

### 🗂 Categories — `/api/categories`

| Method | Endpoint                          | Auth             | Description              |
|--------|-----------------------------------|------------------|--------------------------|
| GET    | `/api/categories`                 | ❌ Public        | Active categories        |
| GET    | `/api/categories/all`             | ✅ ADMIN         | All categories           |
| GET    | `/api/categories/{id}`            | ❌ Public        | Single category          |
| POST   | `/api/categories`                 | ✅ SUPER_ADMIN   | Create category          |
| POST   | `/api/categories/with-image`      | ✅ SUPER_ADMIN   | Create with image upload |
| PUT    | `/api/categories/{id}`            | ✅ SUPER_ADMIN   | Update category          |
| DELETE | `/api/categories/{id}`            | ✅ SUPER_ADMIN   | Delete category          |

---

### 📦 Orders — `/api/orders`

| Method | Endpoint                          | Auth             | Description              |
|--------|-----------------------------------|------------------|--------------------------|
| POST   | `/api/orders`                     | ✅ CUSTOMER      | Place order              |
| GET    | `/api/orders/my`                  | ✅ CUSTOMER      | My order history         |
| GET    | `/api/orders/my/{orderNumber}`    | ✅ CUSTOMER      | Track specific order     |
| PATCH  | `/api/orders/my/{id}/cancel`      | ✅ CUSTOMER      | Cancel pending order     |
| GET    | `/api/orders/admin/all`           | ✅ ADMIN         | All orders (paginated)   |
| GET    | `/api/orders/admin/{id}`          | ✅ ADMIN         | Order by ID              |
| PATCH  | `/api/orders/admin/{id}/status`   | ✅ ADMIN         | Update order status      |
| GET    | `/api/orders/admin/stats`         | ✅ ADMIN         | Dashboard statistics     |

**Place Order Body:**
```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "shippingFullName": "Aria Chen",
  "shippingAddress": "123 Main St",
  "shippingCity": "New York",
  "shippingZip": "10001",
  "shippingPhone": "+1-555-0100",
  "paymentMethod": "CASH_ON_DELIVERY",
  "notes": "Leave at door"
}
```

**Order Statuses:** `PENDING` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`

---

### 👤 Users — `/api/users`

| Method | Endpoint                              | Auth             | Description              |
|--------|---------------------------------------|------------------|--------------------------|
| GET    | `/api/users/me`                       | ✅ Any           | Get own profile          |
| PUT    | `/api/users/me`                       | ✅ Any           | Update own profile       |
| POST   | `/api/users/me/avatar`                | ✅ Any           | Upload profile photo     |
| PATCH  | `/api/users/me/password`              | ✅ Any           | Change password          |
| GET    | `/api/users/admin/all`                | ✅ SUPER_ADMIN   | All users                |
| GET    | `/api/users/admin/customers`          | ✅ SUPER_ADMIN   | All customers            |
| GET    | `/api/users/admin/admins`             | ✅ SUPER_ADMIN   | All admins               |
| POST   | `/api/users/admin/create-admin`       | ✅ SUPER_ADMIN   | Create admin account     |
| PATCH  | `/api/users/admin/{id}/toggle-status` | ✅ SUPER_ADMIN   | Enable/disable user      |
| DELETE | `/api/users/admin/{id}`               | ✅ SUPER_ADMIN   | Delete user              |

---

### 📁 Files — `/api/files`

| Method | Endpoint                      | Auth       | Description              |
|--------|-------------------------------|------------|--------------------------|
| POST   | `/api/files/upload`           | ✅ ADMIN   | Upload single image      |
| POST   | `/api/files/upload-multiple`  | ✅ ADMIN   | Upload multiple images   |
| DELETE | `/api/files?url=...`          | ✅ ADMIN   | Delete an image          |

Uploaded images are served at: `http://localhost:8080/uploads/{folder}/{filename}`

---

## Role Permissions Summary

| Feature                     | CUSTOMER | ADMIN | SUPER_ADMIN |
|-----------------------------|----------|-------|-------------|
| Browse & search products    | ✅       | ✅    | ✅          |
| Register / Login            | ✅       | ✅    | ✅          |
| Place & track orders        | ✅       | ❌    | ❌          |
| View own profile            | ✅       | ✅    | ✅          |
| Manage products (CRUD)      | ❌       | ✅    | ✅          |
| Manage all orders           | ❌       | ✅    | ✅          |
| View dashboard stats        | ❌       | ✅    | ✅          |
| Manage categories           | ❌       | ❌    | ✅          |
| Manage admin accounts       | ❌       | ❌    | ✅          |
| Enable/disable users        | ❌       | ❌    | ✅          |
| View all users              | ❌       | ❌    | ✅          |

---

## Error Response Format
All errors follow this format:
```json
{
  "success": false,
  "message": "Resource not found with id: 99",
  "timestamp": "2025-03-10T12:00:00"
}
```

Validation errors return field-level detail:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "email": "Invalid email format",
    "password": "Password must be at least 6 characters"
  }
}
```
