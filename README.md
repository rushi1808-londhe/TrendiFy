# 🛍️ TrendiFy — Online Fashion Store

A full-stack e-commerce fashion store built with **React + Spring Boot + MySQL**.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Bootstrap 5, React Router v6
- **Backend:** Spring Boot 3.2, Java 17, Spring Data JPA
- **Database:** MySQL
- **Auth:** JWT (JSON Web Token)

---

## 👥 User Roles
- **Super Admin** — Manage admins, categories, analytics
- **Admin** — Manage products, images, orders, inventory
- **Customer** — Browse, cart, checkout, order history

---

## 🚀 Getting Started

### 1. Clone
```bash
git clone https://github.com/rushi1808-londhe/TrendiFy.git
cd TrendiFy
```

### 2. Database
```sql
CREATE DATABASE trendify_db;
```

### 3. Update `application.properties`
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 4. Run Backend
```bash
# Mac/Linux
cd trendify-backend && ./mvnw spring-boot:run

# Windows
cd trendify-backend && mvnw.cmd spring-boot:run
```

### 5. Run Frontend
```bash
cd trendify-frontend
npm install
npm start
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@trendify.com | SuperAdmin@123 |
| Admin | admin@trendify.com | Admin@123 |

---

> Built by Rushikesh Londhe
