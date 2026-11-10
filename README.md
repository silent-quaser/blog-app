# DevLog — Full-Stack Responsive Blog Application

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Bearer-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Bcrypt](https://img.shields.io/badge/Security-Bcrypt_Salt_10-orange)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB_%7C_Supabase-green)](#)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_%7C_Render_%7C_Netlify-blue)](#-deployment-guide)

A modern, high-performance, full-stack blogging platform featuring semantic **HTML5**, responsive mobile-first **CSS3** (Flexbox & CSS Grid), client-side **vanilla JavaScript**, a **Node.js & Express.js** RESTful API backend, **JWT-based user authentication**, **bcrypt password encryption**, and flexible **database persistence (MongoDB / Supabase / Secure Local Engine)**.

---

## 🌟 Key Highlights & Features

### 🎨 Frontend Experience
- **Mobile-First Responsive Interface**: Smooth experience across mobile phones, tablets, and desktop displays.
- **Dynamic Live Search & Category Filtering**: Debounced instant search across titles, excerpts, and author names, paired with one-click category filtering (`Development`, `Design`, `JavaScript`, `AI & ML`, `DevOps`, `General`).
- **Dedicated Article Reader Page (`blog-detail.html`)**: Complete reading layout with estimated reading time, author card, featured high-res cover image, and link copying.
- **Quick-View Article Modal**: Read articles on the homepage without navigating away.

### 🔐 Secure Authentication & Session Management
- **JWT Authentication**: Generates signed JSON Web Tokens (`HS256`, 24h expiration) on login and registration.
- **Bcrypt Password Security**: Passwords are encrypted with `bcryptjs` using 10 salt rounds before storage. Plain-text credentials are never saved or transmitted.
- **Client Route Guards**: Protected dashboard and editor pages automatically redirect unauthenticated users to the login screen.
- **Isolated Private Author Dashboard**: Displays **only the articles authored by the logged-in user**.

### 🛠️ Full CRUD Operations
- **Create**: Publish articles with title, category, cover image URL, summary teaser, and full content.
- **Read**: Browse all community articles or view dedicated article pages.
- **Update**: Edit existing blog posts with pre-populated form fields and update the database in real-time.
- **Delete**: Permanently remove articles with confirmation safeguards.

### 🗄️ Multi-Database Support
- **MongoDB**: Ready for local MongoDB or MongoDB Atlas via `MONGODB_URI` using Mongoose models.
- **Supabase**: Supports direct connection via `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- **Zero-Config Fallback**: Features an encrypted local database engine that runs instantly with zero setup or external services required.

---

## 📁 Repository Structure

```
blog-app/
├── index.html           # Home page: Article grid, search, category tags, modal reader
├── blog-detail.html     # Dedicated article reader: Full body, reading time, share link
├── create-blog.html     # Create article: Publishing form for authenticated authors
├── edit-blog.html       # Update article: Pre-populated editor for existing posts
├── dashboard.html       # Author dashboard: Profile banner, metrics, private article table
├── login.html           # Authentication: User sign-in with JWT generation
├── register.html        # Authentication: User registration with bcrypt hashing
├── style.css            # Responsive design system: Variables, Grid, Flexbox, Animations
├── app.js               # Frontend client engine: Fetch API, auth token, reactive DOM
├── server.js            # Express.js backend: REST endpoints, JWT middleware, static host
├── db.js                # Database abstraction: MongoDB, Supabase & Bcrypt security
├── vercel.json          # Vercel serverless deployment configuration
├── render.yaml          # Render web service deployment configuration
├── netlify.toml         # Netlify deployment configuration
├── .env.example         # Template for environment variables
├── data/
│   ├── posts.json       # Persistent blog storage
│   └── users.json       # Secure user storage (hashed passwords)
└── package.json         # Dependencies and scripts
```

---

## 📡 RESTful API Documentation

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new user; returns signed JWT token. |
| `POST` | `/api/auth/login` | No | Authenticate user credentials; returns signed JWT token. |
| `GET` | `/api/auth/me` | **Bearer Token** | Retrieve logged-in user profile & publication metrics. |
| `GET` | `/api/dashboard/my-blogs` | **Bearer Token** | Retrieve **only** the logged-in user's published blogs. |
| `GET` | `/api/dashboard/stats` | No | Fetch global article and author statistics. |
| `GET` | `/api/blogs` | No | Fetch public blogs. Supports `?category=`, `?search=`, `?authorEmail=`. |
| `GET` | `/api/blogs/:id` | No | Fetch a single blog post by its unique ID. |
| `POST` | `/api/blogs` | Optional/Bearer | Create and publish a new blog post. |
| `PUT` | `/api/blogs/:id` | Optional/Bearer | Update an existing blog post by ID. |
| `DELETE`| `/api/blogs/:id` | **Bearer Token** | Delete a blog post by ID. |
| `GET` | `/api/health` | No | Check server and active database engine status. |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or copy from [`.env.example`](.env.example)):

```env
PORT=3000
JWT_SECRET=devlog-super-secret-jwt-key-2026

# Option A: Connect to MongoDB (Local or Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogapp

# Option B: Connect to Supabase
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/silent-quaser/blog-app.git
   cd blog-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   Open your browser and navigate to:
   👉 **http://localhost:3000**

### 🔑 Demo Account Credentials
- **Email:** `demo@example.com`
- **Password:** `password123`

*(You can also click **Register** to create any new user account).*

---

## ☁️ Deployment Guide

### Option 1: Deploy on Render (Recommended for full continuous Node.js)
1. Push your repository to GitHub.
2. Sign in to **[Render.com](https://render.com/)** and click **New → Web Service**.
3. Select your `blog-app` repository.
4. Render will detect the configuration automatically via [`render.yaml`](render.yaml):
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Click **Create Web Service** — your app is live!

### Option 2: Deploy on Vercel
1. Install Vercel CLI (`npm i -g vercel`) or import via the **[Vercel Dashboard](https://vercel.com/new)**.
2. The project contains a pre-configured [`vercel.json`](vercel.json) that routes requests through `server.js` using `@vercel/node`.
3. Set your environment variables (`JWT_SECRET`, `MONGODB_URI`) in the Vercel Project Settings.
4. Deploy!

### Option 3: Deploy on Netlify
1. Connect your repository to **[Netlify](https://www.netlify.com/)**.
2. Netlify will use [`netlify.toml`](netlify.toml) with build command `npm install` and publish directory `.`.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
