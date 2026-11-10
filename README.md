# Responsive Blog Application (DevLog)

A modern, fast, and fully responsive **Blog Application** interface built with semantic **HTML5**, modern **CSS3** (Flexbox & CSS Grid), and interactive **vanilla JavaScript**.

---

## 🎯 Objectives Completed

1. **Local Development Environment**: Structured project with clean modular architecture, requiring zero external build steps or dependencies.
2. **Core Web Technologies**: Demonstrates foundational knowledge of semantic HTML tags, CSS variables & mobile-first media queries, and JavaScript DOM manipulation & Web APIs.
3. **Responsive Interface**: Fluid layout that adapts across mobile, tablet, and desktop screens.
4. **All 5 Pages Created**:
   - 🏠 **Home Page (`index.html`)**: Features hero section, dynamic blog grid, real-time live search, tag filtering, and article reader modal.
   - 🔐 **Login Page (`login.html`)**: User authentication form with client-side credential verification.
   - 📝 **Register Page (`register.html`)**: Account creation with validation, auto-session initialization, and feedback alerts.
   - 📊 **Dashboard Page (`dashboard.html`)**: Author control panel with blog statistics, personalized greeting, article management table, and delete actions.
   - ✍️ **Create Blog Page (`create-blog.html`)**: Interactive post editor with categories, cover image support, and localStorage persistence.

---

## 🚀 How to Run Locally

You can run this project instantly in any web browser without any installation:

1. Navigate to the `blog-app` folder:
   ```bash
   cd blog-app
   ```
2. Double-click **`index.html`** or right-click and open with your preferred browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, launch with any local development server:
   ```bash
   # Using Python
   python -m http.server 3000

   # Or using Node / npx
   npx serve .
   ```

---

## 🔑 Demo Account Credentials

For quick testing without registering:
- **Email**: `demo@example.com`
- **Password**: `password123`

You can also register any new account on the **Register** page.

---

## 🛠️ Key Technical Features

- **Zero External Dependencies**: Fast load times with pure vanilla HTML, CSS, and JS.
- **Client-Side Persistence**: Employs browser `localStorage` for posts and user accounts.
- **Responsive Layout**: Uses CSS Grid (`repeat(auto-fill, minmax(320px, 1fr))`) and Flexbox for adaptive UI.
- **Interactive Search & Filter**: Instant filtering by keywords and categories without page reload.
- **Article Reader Modal**: Clean reading view pop-up with backdrop blur.
