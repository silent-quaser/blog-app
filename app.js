/* ==========================================================================
   Modern Responsive Blog Application - Core JavaScript Engine
   LocalStorage persistence for Users, Session, and Blog Posts
   ========================================================================== */

// Initial Seed Posts
const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "Mastering HTML5 & Semantic Web Architecture",
    category: "Development",
    author: "Alex Morgan",
    date: "Nov 02, 2026",
    excerpt: "Learn how modern HTML5 semantic tags improve accessibility, search engine indexing, and structure in responsive web design.",
    content: "Semantic HTML is the foundation of accessible and well-structured web applications. By using elements such as <header>, <nav>, <main>, <article>, and <section>, developers convey meaning to assistive technologies, search engines, and other developers. In this guide, we dive deep into the best practices for structuring responsive user interfaces.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "post-2",
    title: "Responsive Design Systems with Modern CSS Grid & Flexbox",
    category: "Design",
    author: "Samantha Lee",
    date: "Nov 05, 2026",
    excerpt: "Discover the power of CSS Grid and Flexbox for crafting bulletproof fluid layouts that adapt seamlessly to any device screen.",
    content: "Creating a truly responsive website requires combining modern CSS features like CSS custom properties (variables), Flexbox for one-dimensional layouts, and CSS Grid for complex two-dimensional component positioning. We will explore mobile-first media queries, clamp() functions, and responsive typography.",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "post-3",
    title: "Vanilla JavaScript in 2026: Modern State & DOM Management",
    category: "JavaScript",
    author: "David Chen",
    date: "Nov 08, 2026",
    excerpt: "Why understanding pure vanilla JavaScript and browser Web APIs remains the greatest superpower for any frontend software engineer.",
    content: "Before reaching for heavy front-end libraries, mastering Vanilla JavaScript empowers developers with a deep understanding of the DOM, event propagation, browser storage APIs like localStorage, and native performance. In this post, we explore how to build snappy, reactive user experiences with zero dependencies.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=700&q=80"
  }
];

// Initialize Storage
function initStorage() {
  if (!localStorage.getItem("blog_posts")) {
    localStorage.setItem("blog_posts", JSON.stringify(DEFAULT_POSTS));
  }
  if (!localStorage.getItem("blog_users")) {
    const defaultUser = [
      { name: "Demo User", email: "demo@example.com", password: "password123" }
    ];
    localStorage.setItem("blog_users", JSON.stringify(defaultUser));
  }
}

// Get Data Helpers
function getPosts() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem("blog_posts")) || [];
  } catch (e) {
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem("blog_posts", JSON.stringify(posts));
}

function getUsers() {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem("blog_users")) || [];
  } catch (e) {
    return [];
  }
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("current_user"));
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem("current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("current_user");
  }
}

// Render dynamic navbar based on auth state
function setupNavbar() {
  const navLinksContainer = document.getElementById("navLinks");
  if (!navLinksContainer) return;

  const currentUser = getCurrentUser();
  const currentPath = window.location.pathname;

  let linksHtml = `
    <li><a href="index.html" class="${currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'active' : ''}">Home</a></li>
  `;

  if (currentUser) {
    linksHtml += `
      <li><a href="create-blog.html" class="${currentPath.endsWith('create-blog.html') ? 'active' : ''}">Create Blog</a></li>
      <li><a href="dashboard.html" class="${currentPath.endsWith('dashboard.html') ? 'active' : ''}">Dashboard</a></li>
      <li><span style="font-size:0.85rem; color: var(--text-muted); padding: 0 0.5rem;">Hi, <strong>${currentUser.name}</strong></span></li>
      <li><button onclick="handleLogout()" class="btn btn-secondary btn-sm">Logout</button></li>
    `;
  } else {
    linksHtml += `
      <li><a href="login.html" class="${currentPath.endsWith('login.html') ? 'active' : ''}">Login</a></li>
      <li><a href="register.html" class="btn btn-primary btn-sm">Register</a></li>
    `;
  }

  navLinksContainer.innerHTML = linksHtml;

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobileToggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("show");
    });
  }
}

function handleLogout() {
  setCurrentUser(null);
  window.location.href = "login.html";
}

// Render Alert Messages
function showAlert(message, type = "danger") {
  const alertEl = document.getElementById("alertBox");
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = "block";
  setTimeout(() => {
    alertEl.style.display = "none";
  }, 4000);
}

// Authentication Handlers
function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password) {
      showAlert("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Passwords do not match.");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.email === email)) {
      showAlert("An account with this email already exists.");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("blog_users", JSON.stringify(users));
    setCurrentUser({ name, email });

    showAlert("Registration successful! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  });
}

function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      showAlert("Invalid email or password. Please try again.");
      return;
    }

    setCurrentUser({ name: user.name, email: user.email });
    showAlert("Logged in successfully! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  });
}

// Create Blog Form Handler
function setupCreateBlogForm() {
  const form = document.getElementById("createBlogForm");
  if (!form) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const image = document.getElementById("imageUrl").value.trim() || 
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80";
    const excerpt = document.getElementById("excerpt").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !category || !excerpt || !content) {
      showAlert("Please complete all required fields.");
      return;
    }

    const options = { year: "numeric", month: "short", day: "numeric" };
    const dateStr = new Date().toLocaleDateString("en-US", options);

    const newPost = {
      id: "post-" + Date.now(),
      title,
      category,
      author: currentUser.name,
      authorEmail: currentUser.email,
      date: dateStr,
      excerpt,
      content,
      image
    };

    const posts = getPosts();
    posts.unshift(newPost);
    savePosts(posts);

    showAlert("Blog post published successfully!", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  });
}

// Home Page Posts Render & Filtering
let activeCategory = "All";
let searchTerm = "";

function renderHomePosts() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  const posts = getPosts();
  const filtered = posts.filter((post) => {
    const matchesCat = activeCategory === "All" || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px solid var(--border-color);">
        <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1rem;">No articles found matching your criteria.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (post) => `
    <article class="blog-card">
      <img src="${post.image}" alt="${post.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80'" />
      <div class="blog-card-body">
        <span class="blog-category">${post.category}</span>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <div class="blog-meta">
          <span class="blog-author">By ${post.author}</span>
          <span>${post.date}</span>
        </div>
        <div style="margin-top: 1rem;">
          <button class="btn btn-secondary btn-sm btn-block" onclick="openPostModal('${post.id}')">Read Full Article</button>
        </div>
      </div>
    </article>
  `
    )
    .join("");
}

function resetFilters() {
  activeCategory = "All";
  searchTerm = "";
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  updateFilterButtons();
  renderHomePosts();
}

function updateFilterButtons() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    if (btn.getAttribute("data-category") === activeCategory) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function setupHomeFilters() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.trim();
      renderHomePosts();
    });
  }

  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      updateFilterButtons();
      renderHomePosts();
    });
  });
}

// Modal View Handler
function openPostModal(id) {
  const posts = getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  const modal = document.getElementById("postModal");
  const modalBody = document.getElementById("modalBody");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <span class="blog-category" style="margin-bottom: 0.5rem;">${post.category}</span>
    <h1 style="font-size: 1.85rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.75rem;">${post.title}</h1>
    <div style="display: flex; gap: 1rem; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <span><strong>Author:</strong> ${post.author}</span>
      <span>•</span>
      <span><strong>Published:</strong> ${post.date}</span>
    </div>
    <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 320px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem;" />
    <div style="font-size: 1.05rem; line-height: 1.8; color: var(--text-main); white-space: pre-line;">
      ${post.content}
    </div>
  `;

  modal.classList.add("active");
}

function closeModal() {
  const modal = document.getElementById("postModal");
  if (modal) modal.classList.remove("active");
}

// Dashboard Page Handlers
function setupDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const welcomeEl = document.getElementById("userWelcome");
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${currentUser.name}!`;
  }

  renderDashboardData();
}

function renderDashboardData() {
  const currentUser = getCurrentUser();
  const posts = getPosts();

  // Filter posts written by current user (or demo posts if matching)
  const userPosts = posts.filter(
    (p) => p.authorEmail === currentUser.email || p.author === currentUser.name
  );

  // Update Stats
  const statTotal = document.getElementById("statTotalPosts");
  const statUser = document.getElementById("statUserPosts");
  const statCommunity = document.getElementById("statCommunityAuthors");

  if (statTotal) statTotal.textContent = posts.length;
  if (statUser) statUser.textContent = userPosts.length;
  if (statCommunity) {
    const authors = new Set(posts.map((p) => p.author));
    statCommunity.textContent = authors.size;
  }

  // Render Table
  const tableBody = document.getElementById("postsTableBody");
  if (!tableBody) return;

  if (userPosts.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          You haven't published any blog posts yet. 
          <a href="create-blog.html" style="color: var(--primary); font-weight: 600; text-decoration: underline;">Create your first post!</a>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = userPosts
    .map(
      (post) => `
    <tr>
      <td><strong>${post.title}</strong></td>
      <td><span class="blog-category" style="margin: 0;">${post.category}</span></td>
      <td>${post.date}</td>
      <td>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="openPostModal('${post.id}')">View</button>
          <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");
}

function deletePost(id) {
  if (confirm("Are you sure you want to delete this blog post?")) {
    let posts = getPosts();
    posts = posts.filter((p) => p.id !== id);
    savePosts(posts);
    renderDashboardData();
  }
}

// DOM Ready initialization
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  setupNavbar();

  // Route-based setup
  setupRegisterForm();
  setupLoginForm();
  setupCreateBlogForm();

  if (document.getElementById("blogGrid")) {
    setupHomeFilters();
    renderHomePosts();
  }

  if (document.getElementById("postsTableBody")) {
    setupDashboard();
  }

  // Close modal when clicking outside content
  const modal = document.getElementById("postModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
});
