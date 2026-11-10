/* ==========================================================================
   DevLog Backend Server - Node.js & Express.js REST API
   Secure JWT Authentication, Role Management & Database Integration
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devlog-super-secret-jwt-key-2026';

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
   JWT Authentication Helpers & Middleware
   ========================================================================== */

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Authentication Middleware to Protect Private Routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Valid JWT authentication token required.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired authentication session. Please log in again.'
      });
    }
    req.user = decodedUser;
    next();
  });
}

// Optional Auth Helper: attaches user if token is present
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) req.user = decoded;
      next();
    });
  } else {
    next();
  }
}

/* ==========================================================================
   REST APIs
   ========================================================================== */

// 1. Health Check & Database Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.getDatabaseStatus(),
    jwtAuth: 'Active (HS256)',
    timestamp: new Date().toISOString(),
    service: 'DevLog Full-Stack Express Server'
  });
});

// 2. User Registration API (Returns Signed JWT Token)
const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const user = await db.registerUser({ name, email, password });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully and authenticated!',
      token,
      user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Registration failed.'
    });
  }
};

app.post('/api/auth/register', handleRegister);
app.post('/api/register', handleRegister);

// 3. User Login API (Bcrypt verification + Returns Signed JWT Token)
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await db.loginUser({ email, password });
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Invalid credentials.'
    });
  }
};

app.post('/api/auth/login', handleLogin);
app.post('/api/login', handleLogin);

// 4. Protected User Profile API (GET /api/auth/me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const userProfile = await db.getUserByEmail(req.user.email);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const stats = await db.getStats(req.user.email);

    res.json({
      success: true,
      user: {
        ...userProfile,
        totalArticles: stats.userPosts
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.'
    });
  }
});

// 5. Protected Dashboard Route: Display Only Logged-In User's Blogs
app.get('/api/dashboard/my-blogs', authenticateToken, async (req, res) => {
  try {
    const userBlogs = await db.getAllBlogs({ authorEmail: req.user.email });
    const stats = await db.getStats(req.user.email);

    res.json({
      success: true,
      user: req.user,
      stats,
      count: userBlogs.length,
      blogs: userBlogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user dashboard blogs.',
      error: err.message
    });
  }
});

// 6. Retrieve All Blogs from Database (Public with optional filters)
const handleGetBlogs = async (req, res) => {
  try {
    const { category, search, authorEmail } = req.query;
    const blogs = await db.getAllBlogs({ category, search, authorEmail });

    res.json({
      success: true,
      count: blogs.length,
      database: db.getDatabaseStatus(),
      blogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blogs from database.',
      error: err.message
    });
  }
};

app.get('/api/blogs', handleGetBlogs);
app.get('/api/posts', handleGetBlogs);

// 7. Retrieve Individual Blog Details by ID
const handleGetSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await db.getBlogById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found in database.'
      });
    }

    res.json({
      success: true,
      database: db.getDatabaseStatus(),
      blog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog details.',
      error: err.message
    });
  }
};

app.get('/api/blogs/:id', handleGetSingleBlog);
app.get('/api/posts/:id', handleGetSingleBlog);

// 8. Create Blog (Protected or optional auth)
const handleCreateBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, image } = req.body;

    if (!title || !category || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, excerpt, and content are required fields.'
      });
    }

    // Determine author from authenticated JWT token or fallback
    const authorName = req.user ? req.user.name : (req.body.author || 'Anonymous Author');
    const authorEmail = req.user ? req.user.email : (req.body.authorEmail || '');

    const blog = await db.createBlog({
      title,
      category,
      excerpt,
      content,
      author: authorName,
      authorEmail: authorEmail,
      image
    });

    return res.status(201).json({
      success: true,
      message: 'Blog post published and stored securely!',
      blog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save blog post to database.',
      error: err.message
    });
  }
};

app.post('/api/blogs', optionalAuth, handleCreateBlog);
app.post('/api/posts', optionalAuth, handleCreateBlog);

// 9. Update Blog Post in Database
const handleUpdateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, excerpt, content, image } = req.body;

    const updatedBlog = await db.updateBlog(id, {
      title,
      category,
      excerpt,
      content,
      image
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found in database.'
      });
    }

    return res.json({
      success: true,
      message: 'Blog post updated successfully in database!',
      blog: updatedBlog
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update blog post.',
      error: err.message
    });
  }
};

app.put('/api/blogs/:id', handleUpdateBlog);
app.patch('/api/blogs/:id', handleUpdateBlog);
app.put('/api/posts/:id', handleUpdateBlog);
app.patch('/api/posts/:id', handleUpdateBlog);

// 10. Delete Blog Post from Database
const handleDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteBlog(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found in database.'
      });
    }

    return res.json({
      success: true,
      message: 'Blog post deleted from database successfully!'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog post from database.',
      error: err.message
    });
  }
};

app.delete('/api/blogs/:id', handleDeleteBlog);
app.delete('/api/posts/:id', handleDeleteBlog);

// 11. Dashboard General Stats API
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { userEmail } = req.query;
    const stats = await db.getStats(userEmail);

    res.json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard statistics.'
    });
  }
});

// Start Server and Initialize Database
async function startServer() {
  await db.initDatabase();

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 DevLog Express & Database Server running on ${PORT}`);
    console.log(`🔐 JWT Auth Protection: Active (24h validity)`);
    console.log(`🗄️ Active Database: ${db.getDatabaseStatus()}`);
    console.log(`📡 REST API Base:  http://localhost:${PORT}/api`);
    console.log(`🌐 Application UI: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
