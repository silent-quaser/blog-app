# DevLog - Full-Stack Secure Blog Application

A complete full-stack blogging platform built with **HTML5/CSS3/JavaScript**, an **Express.js** REST API backend, **Database Persistence (MongoDB / Supabase / Bcrypt)**, **Full CRUD Operations**, and **Secure JWT Authentication & Role-Based Dashboard**.

---

## 🎯 Completed Key Objectives

### 1. Secure JWT User Authentication & Session Management
- **Token-Based Auth**: Generates signed JSON Web Tokens (`HS256`, 24h validity) on User Registration and Login.
- **Password Security**: Passwords are encrypted with `bcryptjs` (10 salt rounds) before database storage.
- **Token Verification Middleware**: `authenticateToken` validates the `Authorization: Bearer <token>` header on all protected private routes.
- **Client Session Management**: Frontend stores the JWT in `localStorage` and automatically attaches it to all authenticated API requests.

### 2. Route Protection for Private Dashboard
- **Backend Protection**:
  - `GET /api/dashboard/my-blogs` (Protected: Requires valid JWT)
  - `GET /api/auth/me` (Protected: Requires valid JWT)
- **Frontend Route Guards**: Unauthenticated users attempting to access [`dashboard.html`](dashboard.html), [`create-blog.html`](create-blog.html), or [`edit-blog.html`](edit-blog.html) are instantly redirected to `login.html?redirect=...`.

### 3. User-Specific Dashboard (Private View)
- The Author Dashboard calls the protected `/api/dashboard/my-blogs` endpoint and **displays only the articles authored by the currently logged-in user**.
- Unrelated community articles are excluded from the user's private management table.

### 4. User Profile & Logout Functionality
- **Author Profile Banner**: Displays user's name, email, avatar initial, verified author badge, join date, and personal article count.
- **One-Click Logout**: Clears the JWT session and redirects to `login.html`.
- **Dynamic Navbar**: Displays active user status, avatar, and logout controls when authenticated; displays Login and Register when logged out.

---

## 📋 Full CRUD Operations Matrix

| Operation | Method | API Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Register** | `POST` | `/api/auth/register` | No | Creates user with hashed password and returns signed JWT token. |
| **Login** | `POST` | `/api/auth/login` | No | Verifies credentials via bcrypt and returns signed JWT token. |
| **Profile** | `GET` | `/api/auth/me` | **Yes (JWT)** | Retrieves authenticated user profile & article statistics. |
| **My Blogs** | `GET` | `/api/dashboard/my-blogs` | **Yes (JWT)** | Retrieves **only** the authenticated user's articles. |
| **Create Blog** | `POST` | `/api/blogs` | Optional/Yes | Publishes a new article attributed to the authenticated user. |
| **Read (All)** | `GET` | `/api/blogs` | No | Public feed with live search & category filters. |
| **Read (One)** | `GET` | `/api/blogs/:id` | No | Dedicated article detail page (`blog-detail.html`). |
| **Update** | `PUT` | `/api/blogs/:id` | No/Yes | Edits existing blog article. |
| **Delete** | `DELETE` | `/api/blogs/:id` | **Yes (JWT)** | Removes the article permanently from the database. |

---

## 🚀 How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
3. Open in your browser:
   👉 **http://localhost:3000**

---

## 🔑 Demo Account Credentials
- **Email:** `demo@example.com`
- **Password:** `password123`
*(Or register a new account to test JWT generation and private dashboard isolation).*
