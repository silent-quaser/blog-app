# DevLog - Full-Stack Secure Blog Application

A complete full-stack blogging platform built with **HTML5/CSS3/JavaScript**, a **Node.js & Express.js** backend, **Database Persistence (MongoDB / Supabase / Bcrypt)**, and **Full CRUD Operations**.

---

## 🎯 Completed Key Objectives

### 1. Full CRUD Operations
| Operation | HTTP Method | Endpoint | Interface Page | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `POST` | `/api/blogs` | [`create-blog.html`](create-blog.html) | Publish new articles with category, excerpt, cover image, and body. |
| **Read (All)** | `GET` | `/api/blogs` | [`index.html`](index.html) | Retrieve all articles with search, category filtering, and author query. |
| **Read (One)** | `GET` | `/api/blogs/:id` | [`blog-detail.html`](blog-detail.html) | Dedicated article detail page with reading time, author info, and formatted content. |
| **Update** | `PUT` | `/api/blogs/:id` | [`edit-blog.html`](edit-blog.html) | Edit existing blog posts, modify fields, and save changes to the database. |
| **Delete** | `DELETE` | `/api/blogs/:id` | [`dashboard.html`](dashboard.html) | Remove blog posts with client confirmation and live database deletion. |

### 2. Search & Blog Category Filters
- **Live Search**: Instant keyword search across post titles, excerpts, and authors with debounced input.
- **Category Filter Pills**: Quick one-click category filtering for **Development**, **Design**, **JavaScript**, **AI & ML**, **DevOps**, and **General**.

### 3. Secure Database Connection
- **MongoDB (Mongoose)** or **Supabase** support configured through `.env`.
- **Bcrypt Password Security**: Hashes user credentials with 10 salt rounds. Plain-text passwords are never saved.
- **Adaptive Fallback Engine**: Zero-configuration local database engine ensures the app runs out-of-the-box.

---

## 📂 Project Structure

```
blog-app/
├── index.html           # Home page: Read all blogs, search & category filters
├── blog-detail.html     # Read single blog: Dedicated article reader page
├── create-blog.html     # Create blog: Author post editor
├── edit-blog.html       # Update blog: Pre-populated post editor
├── dashboard.html       # Manage blogs: Full CRUD controls (View, Edit, Delete)
├── login.html           # User login with secure credential verification
├── register.html        # User registration with bcrypt hashing
├── style.css            # Responsive CSS Grid & Flexbox styles
├── app.js               # Frontend API client and reactive UI updates
├── server.js            # Express.js REST API server (Full CRUD endpoints)
├── db.js                # Database abstraction layer (MongoDB / Supabase / Bcrypt)
├── .env.example         # Environment template for MongoDB / Supabase
├── data/
│   ├── posts.json       # Persistent blog storage
│   └── users.json       # Secure user storage (hashed passwords)
└── package.json         # Project dependencies
```

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
