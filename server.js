/* ==========================================================================
   DevLog Backend Server - Node.js & Express.js REST API
   Secure Database Integration: MongoDB / Supabase with Bcrypt Encryption
   ========================================================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

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

// 1. Health Check & Database Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    service: 'DevLog Full-Stack Express Server'
  });
});

// 2. User Registration API (Securely hashed credentials)
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
    return res.status(201).json({
      success: true,
      message: 'User registered successfully and credentials stored securely!',
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

// 3. User Login API (Bcrypt password verification)
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
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
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

// 4. Retrieve All Blogs from Database
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

// 5. Retrieve Individual Blog Details by ID
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

// 6. Create & Store Blog Post in Database
const handleCreateBlog = async (req, res) => {
  try {
    const { title, category, excerpt, content, author, authorEmail, image } = req.body;

    if (!title || !category || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, excerpt, and content are required fields.'
      });
    }

    const blog = await db.createBlog({
      title,
      category,
      excerpt,
      content,
      author,
      authorEmail,
      image
    });

    return res.status(201).json({
      success: true,
      message: 'Blog post saved securely to database!',
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

app.post('/api/blogs', handleCreateBlog);
app.post('/api/posts', handleCreateBlog);

// 7. Update Blog Post in Database (PUT /api/blogs/:id or PATCH /api/blogs/:id)
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

// 8. Delete Blog Post from Database
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

// 8. Dashboard Statistics API
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
    console.log(`🗄️ Active Database: ${db.getDatabaseStatus()}`);
    console.log(`📡 REST API Base:  http://localhost:${PORT}/api`);
    console.log(`🌐 Application UI: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
