# DevLog - Full-Stack Blog Application

A complete full-stack web application with **HTML5/CSS3/Vanilla JavaScript** frontend connected to a **Node.js & Express.js** backend providing RESTful APIs.

---

## 🎯 Completed Objectives

### 1. Backend Server Setup
- Built with **Node.js** and **Express.js**.
- Integrated with `cors`, `express.json()`, request logging middleware, and static asset delivery.
- JSON-based persistent storage (`data/users.json` and `data/posts.json`).

### 2. REST API Endpoints Created
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User registration (Validates fields, checks duplicates, creates user) |
| `POST` | `/api/auth/login` | User login (Validates email & password, creates session) |
| `GET` | `/api/blogs` | Retrieves all blogs with support for `?category=`, `?search=`, and `?authorEmail=` |
| `GET` | `/api/blogs/:id` | Retrieves a single blog by ID for the reader modal |
| `POST` | `/api/blogs` | Creates and publishes a new blog post |
| `DELETE` | `/api/blogs/:id` | Deletes a blog post by ID |
| `GET` | `/api/dashboard/stats` | Calculates total blogs, user blogs, and unique author metrics |
| `GET` | `/api/health` | Health check endpoint |

### 3. Frontend to Backend Integration
- All 5 pages (`index.html`, `login.html`, `register.html`, `dashboard.html`, `create-blog.html`) consume the REST APIs via standard `fetch()` with `async/await`.
- Dynamic UI updates without page reloads.

---

## 🚀 How to Run Locally

1. Open your terminal in the `blog-app` directory:
   ```bash
   cd blog-app
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   # or: node server.js
   ```
4. Open your browser at:
   👉 **http://localhost:3000**

---

## 🔑 Test Account Credentials
- **Email:** `demo@example.com`
- **Password:** `password123`
*(Or register a new account on the Register page).*
