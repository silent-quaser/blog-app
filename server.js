/* ==========================================================================
   DevLog Backend Server - Node.js & Express.js REST API
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultValue;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname)));

/* ==========================================================================
   REST APIs
   ========================================================================== */

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'DevLog Express Backend'
  });
});

/* --------------------------------------------------------------------------
   1. User Registration API (POST /api/auth/register or /api/register)
   -------------------------------------------------------------------------- */
const handleRegister = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required fields.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = readJSON(USERS_FILE, []);

  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address already exists.'
    });
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: password, // Note: In production, hash with bcrypt
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
};

app.post('/api/auth/register', handleRegister);
app.post('/api/register', handleRegister);

/* --------------------------------------------------------------------------
   2. User Login API (POST /api/auth/login or /api/login)
   -------------------------------------------------------------------------- */
const handleLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = readJSON(USERS_FILE, []);

  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Login successful!',
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};

app.post('/api/auth/login', handleLogin);
app.post('/api/login', handleLogin);

/* --------------------------------------------------------------------------
   3. Get Blogs API (GET /api/blogs or /api/posts)
   -------------------------------------------------------------------------- */
const handleGetBlogs = (req, res) => {
  const { category, search, authorEmail } = req.query;
  let posts = readJSON(POSTS_FILE, []);

  if (category && category !== 'All') {
    posts = posts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
    );
  }

  if (authorEmail) {
    posts = posts.filter((p) => p.authorEmail === authorEmail);
  }

  res.json({
    success: true,
    count: posts.length,
    blogs: posts
  });
};

app.get('/api/blogs', handleGetBlogs);
app.get('/api/posts', handleGetBlogs);

/* --------------------------------------------------------------------------
   4. Get Single Blog API (GET /api/blogs/:id)
   -------------------------------------------------------------------------- */
const handleGetSingleBlog = (req, res) => {
  const { id } = req.params;
  const posts = readJSON(POSTS_FILE, []);
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Blog post not found.'
    });
  }

  res.json({
    success: true,
    blog: post
  });
};

app.get('/api/blogs/:id', handleGetSingleBlog);
app.get('/api/posts/:id', handleGetSingleBlog);

/* --------------------------------------------------------------------------
   5. Create Blog API (POST /api/blogs or /api/posts)
   -------------------------------------------------------------------------- */
const handleCreateBlog = (req, res) => {
  const { title, category, excerpt, content, author, authorEmail, image } = req.body;

  if (!title || !category || !excerpt || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title, category, excerpt, and content are required fields.'
    });
  }

  const posts = readJSON(POSTS_FILE, []);

  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const dateStr = new Date().toLocaleDateString('en-US', options);

  const newPost = {
    id: 'post-' + Date.now(),
    title: title.trim(),
    category: category.trim(),
    excerpt: excerpt.trim(),
    content: content.trim(),
    author: author ? author.trim() : 'Anonymous Author',
    authorEmail: authorEmail ? authorEmail.trim() : '',
    image: image && image.trim() !== '' ? image.trim() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80',
    date: dateStr,
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost);
  writeJSON(POSTS_FILE, posts);

  return res.status(201).json({
    success: true,
    message: 'Blog post created successfully!',
    blog: newPost
  });
};

app.post('/api/blogs', handleCreateBlog);
app.post('/api/posts', handleCreateBlog);

/* --------------------------------------------------------------------------
   6. Delete Blog API (DELETE /api/blogs/:id)
   -------------------------------------------------------------------------- */
const handleDeleteBlog = (req, res) => {
  const { id } = req.params;
  let posts = readJSON(POSTS_FILE, []);

  const initialLength = posts.length;
  posts = posts.filter((p) => p.id !== id);

  if (posts.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: 'Blog post not found.'
    });
  }

  writeJSON(POSTS_FILE, posts);

  return res.json({
    success: true,
    message: 'Blog post deleted successfully!'
  });
};

app.delete('/api/blogs/:id', handleDeleteBlog);
app.delete('/api/posts/:id', handleDeleteBlog);

/* --------------------------------------------------------------------------
   7. Dashboard Stats API (GET /api/dashboard/stats)
   -------------------------------------------------------------------------- */
app.get('/api/dashboard/stats', (req, res) => {
  const { userEmail } = req.query;
  const posts = readJSON(POSTS_FILE, []);

  const totalPosts = posts.length;
  const uniqueAuthors = new Set(posts.map((p) => p.author)).size;
  const userPosts = userEmail
    ? posts.filter((p) => p.authorEmail === userEmail).length
    : 0;

  res.json({
    success: true,
    stats: {
      totalPosts,
      userPosts,
      uniqueAuthors
    }
  });
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 DevLog Express Server running on port ${PORT}`);
  console.log(`📡 REST API Base: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend UI:  http://localhost:${PORT}`);
  console.log(`=========================================`);
});
