/* ==========================================================================
   Modern Responsive Blog Application - Frontend Client
   Connected to Express.js REST APIs with asynchronous Fetch API
   ========================================================================== */

const API_BASE = "/api";

// Auth Session Management
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

// Dynamic Navigation Bar Setup
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

// Alert Message Helper
function showAlert(message, type = "danger") {
  const alertEl = document.getElementById("alertBox");
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  alertEl.style.display = "block";
  setTimeout(() => {
    alertEl.style.display = "none";
  }, 4500);
}

/* ==========================================================================
   1. User Registration (Connected to POST /api/auth/register)
   ========================================================================== */
function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
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

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showAlert(data.message || "Registration failed. Please try again.");
        return;
      }

      // Auto login user session
      setCurrentUser(data.user);
      showAlert("Registration successful! Redirecting to Dashboard...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);
    } catch (err) {
      console.error("API error during registration:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

/* ==========================================================================
   2. User Login (Connected to POST /api/auth/login)
   ========================================================================== */
function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showAlert("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showAlert(data.message || "Invalid credentials. Please try again.");
        return;
      }

      setCurrentUser(data.user);
      showAlert("Logged in successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("API error during login:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

/* ==========================================================================
   3. Create Blog (Connected to POST /api/blogs)
   ========================================================================== */
function setupCreateBlogForm() {
  const form = document.getElementById("createBlogForm");
  if (!form) return;

  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const image = document.getElementById("imageUrl").value.trim();
    const excerpt = document.getElementById("excerpt").value.trim();
    const content = document.getElementById("content").value.trim();

    if (!title || !category || !excerpt || !content) {
      showAlert("Please complete all required fields.");
      return;
    }

    const payload = {
      title,
      category,
      image,
      excerpt,
      content,
      author: currentUser.name,
      authorEmail: currentUser.email
    };

    try {
      const response = await fetch(`${API_BASE}/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showAlert(data.message || "Could not publish article.");
        return;
      }

      showAlert("Blog published successfully to backend server!", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("API error during create blog:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

/* ==========================================================================
   4. Home Page Posts (Connected to GET /api/blogs)
   ========================================================================== */
let activeCategory = "All";
let searchTerm = "";

async function renderHomePosts() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <p style="color: var(--text-muted);">Fetching latest posts from backend API...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== "All") params.append("category", activeCategory);
    if (searchTerm) params.append("search", searchTerm);

    const url = `${API_BASE}/blogs?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    const posts = data.blogs || [];

    if (posts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px solid var(--border-color);">
          <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 1rem;">No articles found matching your criteria.</p>
          <button class="btn btn-secondary" onclick="resetFilters()">Reset Filters</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = posts
      .map(
        (post) => `
      <article class="blog-card">
        <a href="blog-detail.html?id=${post.id}">
          <img src="${post.image}" alt="${post.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80'" />
        </a>
        <div class="blog-card-body">
          <span class="blog-category">${post.category}</span>
          <h3 class="blog-title"><a href="blog-detail.html?id=${post.id}">${post.title}</a></h3>
          <p class="blog-excerpt">${post.excerpt}</p>
          <div class="blog-meta">
            <span class="blog-author">By ${post.author}</span>
            <span>${post.date}</span>
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <a href="blog-detail.html?id=${post.id}" class="btn btn-primary btn-sm" style="flex: 1;">View Article</a>
            <button class="btn btn-secondary btn-sm" onclick="openPostModal('${post.id}')" title="Quick Preview">👁️</button>
          </div>
        </div>
      </article>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error fetching blogs:", err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--danger);">
        Failed to load articles from the backend API. Ensure the Express server is running.
      </div>
    `;
  }
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
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = e.target.value.trim();
        renderHomePosts();
      }, 250);
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

// Modal Article Reader (Connected to GET /api/blogs/:id)
async function openPostModal(id) {
  const modal = document.getElementById("postModal");
  const modalBody = document.getElementById("modalBody");
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `<p style="padding: 2rem; text-align:center; color: var(--text-muted);">Loading post details...</p>`;
  modal.classList.add("active");

  try {
    const response = await fetch(`${API_BASE}/blogs/${id}`);
    const data = await response.json();
    const post = data.blog;

    if (!post) {
      modalBody.innerHTML = `<p style="color: var(--danger); text-align: center;">Article not found.</p>`;
      return;
    }

    modalBody.innerHTML = `
      <span class="blog-category" style="margin-bottom: 0.5rem;">${post.category}</span>
      <h1 style="font-size: 1.85rem; font-weight: 800; line-height: 1.3; margin-bottom: 0.75rem;">${post.title}</h1>
      <div style="display: flex; gap: 1rem; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
        <span><strong>Author:</strong> ${post.author}</span>
        <span>•</span>
        <span><strong>Published:</strong> ${post.date}</span>
      </div>
      <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 320px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 1.5rem;" onerror="this.src='https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=700&q=80'" />
      <div style="font-size: 1.05rem; line-height: 1.8; color: var(--text-main); white-space: pre-line;">
        ${post.content}
      </div>
    `;
  } catch (err) {
    console.error("Error loading blog details:", err);
    modalBody.innerHTML = `<p style="color: var(--danger);">Failed to load post details.</p>`;
  }
}

function closeModal() {
  const modal = document.getElementById("postModal");
  if (modal) modal.classList.remove("active");
}

/* ==========================================================================
   5. Dashboard Handlers (Connected to Stats API & User Blogs API)
   ========================================================================= */
async function setupDashboard() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const welcomeEl = document.getElementById("userWelcome");
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome back, ${currentUser.name}!`;
  }

  await renderDashboardData();
}

async function renderDashboardData() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const tableBody = document.getElementById("postsTableBody");

  try {
    // 1. Fetch Stats API
    const statsRes = await fetch(`${API_BASE}/dashboard/stats?userEmail=${encodeURIComponent(currentUser.email)}`);
    const statsData = await statsRes.json();
    if (statsData.success) {
      const { totalPosts, userPosts, uniqueAuthors } = statsData.stats;
      const statTotal = document.getElementById("statTotalPosts");
      const statUser = document.getElementById("statUserPosts");
      const statCommunity = document.getElementById("statCommunityAuthors");

      if (statTotal) statTotal.textContent = totalPosts;
      if (statUser) statUser.textContent = userPosts;
      if (statCommunity) statCommunity.textContent = uniqueAuthors;
    }

    // 2. Fetch User's Published Blogs
    const blogsRes = await fetch(`${API_BASE}/blogs?authorEmail=${encodeURIComponent(currentUser.email)}`);
    const blogsData = await blogsRes.json();
    const userPosts = blogsData.blogs || [];

    if (!tableBody) return;

    if (userPosts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
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
        <td><strong><a href="blog-detail.html?id=${post.id}" style="color: var(--primary);">${post.title}</a></strong></td>
        <td><span class="blog-category" style="margin: 0;">${post.category}</span></td>
        <td>${post.date}</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <a href="blog-detail.html?id=${post.id}" class="btn btn-secondary btn-sm">View Page</a>
            <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error loading dashboard data:", err);
  }
}

async function deletePost(id) {
  if (!confirm("Are you sure you want to delete this blog post?")) return;

  try {
    const response = await fetch(`${API_BASE}/blogs/${id}`, {
      method: "DELETE"
    });
    const data = await response.json();

    if (data.success) {
      await renderDashboardData();
    } else {
      alert(data.message || "Could not delete article.");
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    alert("Network error deleting article.");
  }
}

// Global DOM Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();

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

  const modal = document.getElementById("postModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
});
