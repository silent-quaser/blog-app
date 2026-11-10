/* ==========================================================================
   Modern Responsive Blog Application - Frontend Client Engine
   Secure JWT Session Management, Route Protection & REST API Integration
   ========================================================================== */

const API_BASE = "/api";

// 1. JWT & Session Management Helpers
function getAuthToken() {
  return localStorage.getItem("auth_token") || null;
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
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

function authHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Route Protection: Ensures unauthenticated users cannot access private pages
function enforceRouteProtection() {
  const protectedPages = ["dashboard.html", "create-blog.html", "edit-blog.html"];
  const currentPath = window.location.pathname;

  const isProtected = protectedPages.some((page) => currentPath.endsWith(page));
  const token = getAuthToken();

  if (isProtected && !token) {
    const pageName = currentPath.substring(currentPath.lastIndexOf("/") + 1);
    window.location.href = `login.html?redirect=${encodeURIComponent(pageName)}`;
  }
}

// 2. Navigation Bar Rendering
function setupNavbar() {
  const navLinksContainer = document.getElementById("navLinks");
  if (!navLinksContainer) return;

  const currentUser = getCurrentUser();
  const token = getAuthToken();
  const currentPath = window.location.pathname;

  let linksHtml = `
    <li><a href="index.html" class="${currentPath.endsWith('index.html') || currentPath.endsWith('/') ? 'active' : ''}">Home</a></li>
  `;

  if (token && currentUser) {
    linksHtml += `
      <li><a href="create-blog.html" class="${currentPath.endsWith('create-blog.html') ? 'active' : ''}">+ Create Blog</a></li>
      <li><a href="dashboard.html" class="${currentPath.endsWith('dashboard.html') ? 'active' : ''}">Dashboard</a></li>
      <li style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size:0.875rem; color: var(--text-muted); background: var(--primary-light); padding: 0.25rem 0.65rem; border-radius: 9999px;">
          👤 <strong>${currentUser.name}</strong>
        </span>
      </li>
      <li><button onclick="handleLogout()" class="btn btn-secondary btn-sm">Logout</button></li>
    `;
  } else {
    linksHtml += `
      <li><a href="login.html" class="${currentPath.endsWith('login.html') ? 'active' : ''}">Login</a></li>
      <li><a href="register.html" class="btn btn-primary btn-sm">Register</a></li>
    `;
  }

  navLinksContainer.innerHTML = linksHtml;

  // Mobile navigation drawer toggle
  const mobileToggle = document.getElementById("mobileToggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navLinksContainer.classList.toggle("show");
    });
  }
}

// 3. Secure Logout Functionality
function handleLogout() {
  setAuthToken(null);
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

// 4. User Registration (Stores JWT Token)
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

      // Store JWT token and user profile
      setAuthToken(data.token);
      setCurrentUser(data.user);

      showAlert("Account created successfully! Authenticating...", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("API error during registration:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

// 5. User Login (Stores JWT Token)
function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  // Check if redirected from a protected route
  const urlParams = new URLSearchParams(window.location.search);
  const redirectTarget = urlParams.get("redirect");
  if (redirectTarget) {
    showAlert("Please log in with your credentials to access that private page.", "danger");
  }

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

      // Save JWT Token & User Session
      setAuthToken(data.token);
      setCurrentUser(data.user);

      showAlert("Logged in successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = redirectTarget || "dashboard.html";
      }, 900);
    } catch (err) {
      console.error("API error during login:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

// 6. Create Blog Form (Passes JWT Auth Header)
function setupCreateBlogForm() {
  const form = document.getElementById("createBlogForm");
  if (!form) return;

  const currentUser = getCurrentUser();
  const token = getAuthToken();

  if (!token || !currentUser) {
    window.location.href = "login.html?redirect=create-blog.html";
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
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showAlert(data.message || "Could not publish article.");
        return;
      }

      showAlert("Blog published successfully to database!", "success");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } catch (err) {
      console.error("API error during create blog:", err);
      showAlert("Network error connecting to backend API.");
    }
  });
}

// 7. Home Page Feed (Public)
let activeCategory = "All";
let searchTerm = "";

async function renderHomePosts() {
  const grid = document.getElementById("blogGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
      <p style="color: var(--text-muted);">Fetching latest posts from database...</p>
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
        Failed to load articles from the database.
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

// Modal Article Reader
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
      <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; text-align: right;">
        <a href="blog-detail.html?id=${post.id}" class="btn btn-primary btn-sm">Open Dedicated Page →</a>
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

// 8. Protected Dashboard: Display Only Logged-in User's Blogs & Profile Data
async function setupDashboard() {
  const token = getAuthToken();
  const currentUser = getCurrentUser();

  if (!token || !currentUser) {
    window.location.href = "login.html?redirect=dashboard.html";
    return;
  }

  // Load User Profile Section
  loadUserProfile();

  // Load User's Private Articles via Protected API
  await renderDashboardData();
}

async function loadUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders()
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      return;
    }

    const u = data.user;
    const profileNameEl = document.getElementById("profileUserName");
    const profileEmailEl = document.getElementById("profileUserEmail");
    const profileAvatarEl = document.getElementById("profileUserAvatar");
    const profileDateEl = document.getElementById("profileUserCreated");
    const profileCountEl = document.getElementById("profileUserCount");

    if (profileNameEl) profileNameEl.textContent = u.name;
    if (profileEmailEl) profileEmailEl.textContent = u.email;
    if (profileAvatarEl) profileAvatarEl.textContent = (u.name || "U").charAt(0).toUpperCase();
    if (profileDateEl) {
      const d = new Date(u.createdAt);
      profileDateEl.textContent = isNaN(d) ? "Nov 2026" : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    if (profileCountEl) profileCountEl.textContent = u.totalArticles || 0;
  } catch (err) {
    console.error("Failed to load user profile:", err);
  }
}

async function renderDashboardData() {
  const tableBody = document.getElementById("postsTableBody");

  try {
    // Call Protected API endpoint for ONLY logged-in user's blogs
    const res = await fetch(`${API_BASE}/dashboard/my-blogs`, {
      headers: authHeaders()
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      return;
    }

    const userPosts = data.blogs || [];
    const stats = data.stats || { totalPosts: 0, userPosts: 0, uniqueAuthors: 0 };

    // Update Stats Display
    const statTotal = document.getElementById("statTotalPosts");
    const statUser = document.getElementById("statUserPosts");
    const statCommunity = document.getElementById("statCommunityAuthors");

    if (statTotal) statTotal.textContent = stats.totalPosts;
    if (statUser) statUser.textContent = userPosts.length;
    if (statCommunity) statCommunity.textContent = stats.uniqueAuthors;

    if (!tableBody) return;

    if (userPosts.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
            <p style="font-size: 1.05rem; margin-bottom: 0.5rem;">You haven't written any articles yet.</p>
            <a href="create-blog.html" class="btn btn-primary btn-sm">+ Write Your First Article</a>
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
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <a href="blog-detail.html?id=${post.id}" class="btn btn-secondary btn-sm">View</a>
            <a href="edit-blog.html?id=${post.id}" class="btn btn-secondary btn-sm" style="color: var(--primary); font-weight: 600;">✏️ Edit</a>
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
  if (!confirm("Are you sure you want to permanently delete this blog post?")) return;

  try {
    const response = await fetch(`${API_BASE}/blogs/${id}`, {
      method: "DELETE",
      headers: authHeaders()
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
  enforceRouteProtection();
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
