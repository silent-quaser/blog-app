/* ==========================================================================
   DevLog Database Management Layer
   Supports MongoDB (Mongoose), Supabase, or Local Secure Engine
   Secure password hashing with bcryptjs (10 salt rounds)
   ========================================================================== */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

let activeDbType = 'Local Secure DB';
let mongoose = null;
let supabase = null;

// Mongoose Models
let UserModel = null;
let PostModel = null;

// Local JSON File Paths
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');

function readJSON(file, defaultVal = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return defaultVal;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving ${file}:`, err);
    return false;
  }
}

// 1. Password Security Helpers
async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainTextPassword, salt);
}

async function verifyPassword(plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

// 2. Initialize Database Connection
async function initDatabase() {
  // Option A: MongoDB via Mongoose
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '') {
    try {
      mongoose = require('mongoose');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });

      const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      });

      const postSchema = new mongoose.Schema({
        id: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        category: { type: String, required: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: String, required: true },
        authorEmail: { type: String, default: '' },
        image: { type: String, default: '' },
        date: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now }
      });

      UserModel = mongoose.models.User || mongoose.model('User', userSchema);
      PostModel = mongoose.models.Post || mongoose.model('Post', postSchema);

      activeDbType = 'MongoDB';
      console.log('✅ Successfully connected to MongoDB database!');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB connection attempt failed, falling back to secure local store:', err.message);
    }
  }

  // Option B: Supabase
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
      activeDbType = 'Supabase';
      console.log('✅ Connected to Supabase backend client!');
      return;
    } catch (err) {
      console.warn('⚠️ Supabase initialization failed, falling back:', err.message);
    }
  }

  // Option C: Local Secure Engine
  activeDbType = 'Local Secure DB (Bcrypt Secured)';
  console.log('🔒 Running on Local Secure Database Engine with Bcrypt encryption.');

  // Ensure default demo user password in users.json is bcrypt hashed
  const users = readJSON(USERS_FILE, []);
  let updated = false;
  for (const u of users) {
    if (u.password && !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$')) {
      u.password = await hashPassword(u.password);
      updated = true;
    }
  }
  if (updated) {
    writeJSON(USERS_FILE, users);
  }
}

// 3. User Operations
async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hashedPassword = await hashPassword(password);

  // MongoDB
  if (activeDbType === 'MongoDB' && UserModel) {
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const created = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });
    return { id: created._id.toString(), name: created.name, email: created.email };
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', normalizedEmail).maybeSingle();
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const { data, error } = await supabase.from('users').insert([{
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    }]).select().single();

    if (error) throw new Error(error.message);
    return { id: data.id, name: data.name, email: data.email };
  }

  // Local Secure Engine
  const users = readJSON(USERS_FILE, []);
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeJSON(USERS_FILE, users);

  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // MongoDB
  if (activeDbType === 'MongoDB' && UserModel) {
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) throw new Error('Invalid email or password.');

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error('Invalid email or password.');

    return { id: user._id.toString(), name: user.name, email: user.email };
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', normalizedEmail).maybeSingle();
    if (error || !user) throw new Error('Invalid email or password.');

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new Error('Invalid email or password.');

    return { id: user.id, name: user.name, email: user.email };
  }

  // Local Secure Engine
  const users = readJSON(USERS_FILE, []);
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) throw new Error('Invalid email or password.');

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw new Error('Invalid email or password.');

  return { id: user.id, name: user.name, email: user.email };
}

async function getUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  // MongoDB
  if (activeDbType === 'MongoDB' && UserModel) {
    const user = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt || new Date().toISOString(),
      role: 'Author'
    };
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data: user } = await supabase.from('users').select('*').eq('email', normalizedEmail).maybeSingle();
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at || new Date().toISOString(),
      role: 'Author'
    };
  }

  // Local Secure Engine
  const users = readJSON(USERS_FILE, []);
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt || "2026-11-01T10:00:00.000Z",
    role: 'Author'
  };
}

// 4. Blog Post Operations
async function getAllBlogs({ category, search, authorEmail } = {}) {
  let posts = [];

  // MongoDB
  if (activeDbType === 'MongoDB' && PostModel) {
    let query = {};
    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    if (authorEmail) {
      query.authorEmail = authorEmail;
    }
    if (search) {
      const reg = new RegExp(search, 'i');
      query.$or = [{ title: reg }, { excerpt: reg }, { author: reg }];
    }
    posts = await PostModel.find(query).sort({ createdAt: -1 }).lean();
    return posts.map(p => ({ ...p, id: p.id || p._id.toString() }));
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (category && category !== 'All') query = query.eq('category', category);
    if (authorEmail) query = query.eq('author_email', authorEmail);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,author.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Local Secure Engine
  posts = readJSON(POSTS_FILE, []);

  if (category && category !== 'All') {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase());
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

  return posts;
}

async function getBlogById(id) {
  // MongoDB
  if (activeDbType === 'MongoDB' && PostModel) {
    let post = await PostModel.findOne({ id }).lean();
    if (!post && mongoose.Types.ObjectId.isValid(id)) {
      post = await PostModel.findById(id).lean();
    }
    return post ? { ...post, id: post.id || post._id.toString() } : null;
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data, error } = await supabase.from('blogs').select('*').eq('id', id).maybeSingle();
    return error ? null : data;
  }

  // Local Secure Engine
  const posts = readJSON(POSTS_FILE, []);
  return posts.find((p) => p.id === id) || null;
}

async function createBlog({ title, category, excerpt, content, author, authorEmail, image }) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const dateStr = new Date().toLocaleDateString('en-US', options);
  const postId = 'post-' + Date.now();
  const coverImage = image && image.trim() !== ''
    ? image.trim()
    : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80';

  const blogData = {
    id: postId,
    title: title.trim(),
    category: category.trim(),
    excerpt: excerpt.trim(),
    content: content.trim(),
    author: author ? author.trim() : 'Anonymous Author',
    authorEmail: authorEmail ? authorEmail.trim() : '',
    image: coverImage,
    date: dateStr,
    createdAt: new Date().toISOString()
  };

  // MongoDB
  if (activeDbType === 'MongoDB' && PostModel) {
    const created = await PostModel.create(blogData);
    return { ...created.toObject(), id: created.id || created._id.toString() };
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data, error } = await supabase.from('blogs').insert([blogData]).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Local Secure Engine
  const posts = readJSON(POSTS_FILE, []);
  posts.unshift(blogData);
  writeJSON(POSTS_FILE, posts);
  return blogData;
}

async function updateBlog(id, { title, category, excerpt, content, image }) {
  const updates = {};
  if (title !== undefined) updates.title = title.trim();
  if (category !== undefined) updates.category = category.trim();
  if (excerpt !== undefined) updates.excerpt = excerpt.trim();
  if (content !== undefined) updates.content = content.trim();
  if (image !== undefined && image.trim() !== '') updates.image = image.trim();
  updates.updatedAt = new Date().toISOString();

  // MongoDB
  if (activeDbType === 'MongoDB' && PostModel) {
    let updated = await PostModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!updated && mongoose.Types.ObjectId.isValid(id)) {
      updated = await PostModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    return updated ? { ...updated, id: updated.id || updated._id.toString() } : null;
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { data, error } = await supabase.from('blogs').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Local Secure Engine
  const posts = readJSON(POSTS_FILE, []);
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  posts[index] = {
    ...posts[index],
    ...updates
  };

  writeJSON(POSTS_FILE, posts);
  return posts[index];
}

async function deleteBlog(id) {
  // MongoDB
  if (activeDbType === 'MongoDB' && PostModel) {
    const res = await PostModel.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // Supabase
  if (activeDbType === 'Supabase' && supabase) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    return !error;
  }

  // Local Secure Engine
  let posts = readJSON(POSTS_FILE, []);
  const initialLen = posts.length;
  posts = posts.filter((p) => p.id !== id);
  if (posts.length === initialLen) return false;
  writeJSON(POSTS_FILE, posts);
  return true;
}

async function getStats(userEmail) {
  const posts = await getAllBlogs();
  const totalPosts = posts.length;
  const uniqueAuthors = new Set(posts.map((p) => p.author)).size;
  const userPosts = userEmail
    ? posts.filter((p) => p.authorEmail === userEmail).length
    : 0;

  return { totalPosts, userPosts, uniqueAuthors };
}

function getDatabaseStatus() {
  return activeDbType;
}

module.exports = {
  initDatabase,
  getDatabaseStatus,
  registerUser,
  loginUser,
  getUserByEmail,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getStats,
  hashPassword,
  verifyPassword
};
