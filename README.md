# DevLog - Full-Stack Secure Blog Application

A complete full-stack blog platform built with **HTML5/CSS3/JavaScript**, a **Node.js & Express.js** backend, and **Database Persistence (MongoDB / Supabase / Bcrypt)**.

---

## 🎯 Completed Key Objectives

### 1. Database Connection (MongoDB / Supabase)
- **MongoDB Integration (Mongoose):** Connects to any local MongoDB or remote MongoDB Atlas cluster using `MONGODB_URI`.
- **Supabase Integration:** Connects seamlessly to Supabase using `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- **Adaptive Fallback Engine:** Features an encrypted local fallback database engine, ensuring the platform runs immediately with zero crashes even before external database credentials are provided.

### 2. Secure Data Storage
- **Password Hashing:** User passwords are encrypted with **`bcryptjs`** with 10 salt rounds before being stored. Plain text credentials are never saved.
- **Credential Verification:** Secure hash comparisons during authentication (`bcrypt.compare`).
- **Data Validation:** Strict validation of required fields for user registration, login, and blog publishing.

### 3. Retrieve and Display Blogs from Database
- REST APIs (`GET /api/blogs` and `GET /api/blogs/:id`) retrieve blog posts directly from the database.
- Live database queries with instant search filtering, category tags, and author filtering.

### 4. Dedicated Individual Blog Details Page
- **`blog-detail.html`**: A dedicated article page displaying:
  - Full article header with category badge, title, author info, and estimated reading time.
  - High-resolution featured cover image.
  - Formatted article excerpt and body content.
  - Share options (Copy Link) and navigation back to all articles.

---

## 📂 Project Structure

```
blog-app/
├── blog-detail.html     # Dedicated page to view individual blog details
├── index.html           # Home page with live blog feed & database status
├── login.html           # User login with secure credential verification
├── register.html        # User registration with bcrypt password hashing
├── dashboard.html       # Author dashboard with stats and post management
├── create-blog.html     # Blog publishing interface
├── style.css            # Responsive CSS Grid & Flexbox styles
├── app.js               # Frontend API client and DOM rendering
├── server.js            # Express.js REST API server
├── db.js                # Database abstraction layer (MongoDB / Supabase / Bcrypt)
├── .env.example         # Environment variables template
├── data/
│   ├── posts.json       # Persistent blog storage
│   └── users.json       # Secure user storage (hashed passwords)
└── package.json         # Project dependencies
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` to configure your database:

```env
PORT=3000

# Option A: Connect to MongoDB (Local or Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogapp

# Option B: Connect to Supabase
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 🚀 How to Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at:
   👉 **http://localhost:3000**
