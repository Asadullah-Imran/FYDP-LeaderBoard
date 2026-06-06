# SpatialAblate Client

Welcome to the frontend repository for the **SpatialAblate** leaderboard and model exploration dashboard. This platform is designed to track, compare, and display machine learning/deep learning model performance with rich text (Markdown + LaTeX) explanation rendering and interactive architecture flow diagrams (Mermaid.js).

---

## 🚀 Key Features

- **Model Leaderboard**: Filter and sort models on metrics like ARI (Adjusted Rand Index) and NMI (Normalized Mutual Info).
- **Rich Visualization**: Support for LaTeX formulas and Markdown description rendering for detailed methodology explanations.
- **Dynamic Workflows**: Render interactive model architectures directly using Mermaid.js block parsing.
- **Reactive Authentication**: Global context-driven session management displaying active user state in the navigation shell.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Lucide React (Icons)
- **Animation**: Framer Motion
- **Routing**: React Router DOM v7
- **HTTP client**: Axios
- **Markdown & Math**: React Markdown, Remark Math, Rehype Katex
- **Diagrams**: Mermaid.js

---

## 💻 Getting Started

### Environment Variables
Create a `.env` file in the root of the `client/` folder:
```env
VITE_API_URL=http://localhost:5050/api
```

### Running the App
For development, you can run the client server directly using the helper scripts created in the project's root folder:

- **Option A (All-in-One Orchestrated Startup)**:
  Run `./start.sh` in the root folder. This automatically opens two separate terminal windows (one running the client, one running the server) on macOS.
  
- **Option B (Client-Only Dev Server)**:
  Run `./client.sh` in the root folder to start the client independently.
  
- **Option C (Manual Npm Command)**:
  ```bash
  cd client
  npm install
  npm run dev
  ```

---

## 📝 Codebase Updates & Changelog

This log tracks crucial functional updates and architectural additions made to the client codebase:

### 📅 May 24, 2026

#### 1. 🔑 Reactive Authentication Context (AuthContext)
* **[NEW]** Created [AuthContext.jsx](src/context/AuthContext.jsx):
  * Implemented an `<AuthProvider>` using React Context to broadcast state across the application.
  * Added active user hydration on application start by reading and parsing the session token and user details from `localStorage`.
  * Exposed a unified `useAuth` hook yielding the `user` state, `login` function, and `logout` function.
* **[MODIFY]** Updated [App.jsx](src/App.jsx):
  * Integrated the `<AuthProvider>` context wrapper at the application root.
  * Extracted and updated the `<Navigation />` layout component to consume the active `user` context.
  * Replaced the static "Login" hyperlink with dynamic logic: shows active status and name (`👋 {user.name}`) accompanied by a styled "Logout" button when logged in, and a prominent blue "Login" CTA when logged out.
* **[MODIFY]** Updated [Login.jsx](src/pages/Login.jsx):
  * Replaced manual `localStorage` writes with the context-provided `login(data)` handler on successful submissions.
  * Enables instant, reactive navbar updates to reflect the active session without requiring manual browser reloads.

#### 2. ⚡ Multi-Terminal Developer Tools
* **[NEW]** Created `start.sh` (Root): Orchestrated terminal automation script using AppleScript to auto-launch backend/frontend servers in distinct terminal tabs.
* **[NEW]** Created `client.sh` (Root): Client-specific startup script that checks dependencies and starts Vite.

#### 3. 🔍 Searchable Dropdown & Live Markdown Preview
* **[MODIFY]** Updated [SubmitModel.jsx](src/pages/SubmitModel.jsx):
  * **Searchable Combobox**: Replaced the native `<select>` dropdown with a custom, state-driven searchable combobox. Features an inline search input to filter the dataset options on the fly, close-on-click-outside behavior, and a custom scrolling view.
  * **Live Markdown & LaTeX Preview**: Reorganized the description input field by adding dynamic tabs ("Write" and "Preview"). Integrated `react-markdown`, `remark-math`, and `rehype-katex` to let users toggle and preview rich LaTeX and Markdown content dynamically inside the submission form.

* **[MODIFY]** Updated [Dashboard.jsx](src/pages/Dashboard.jsx):
  * **Dynamic Dataset Grouping**: Filtered the dashboard's view to display only dataset sections with active model submissions, preventing visual clutter from unpopulated datasets.
  * **Aesthetic Empty State**: Designed a gorgeous, custom dashed-border call-to-action card urging users to submit the leaderboard's first model if all datasets are currently empty.

* **[MODIFY]** Updated [ModelDetail.jsx](src/pages/ModelDetail.jsx):
  * **Secure Inline Edit Mode**: Implemented a responsive toggle allowing model authors and administrators to edit submission fields (Model Name, ARI/NMI Scores, Dataset Category, Description, and Mermaid Architecture Flow) inline. Includes the searchable dataset category combobox and a live Markdown/LaTeX preview editor inside edit mode.
  * **Active Image Management**: Added full support for methodology image workflows during edit mode. Authors can now view currently uploaded gallery images, remove unwanted entries interactively, and select new image files to upload to Cloudinary upon saving.
  * **Auth-Protected Actions**: Configured dynamic header management displaying "Edit Model" and "Delete Model" buttons only when an authenticated user owns the submission (or has administrator privileges).
  * **Fullstack Integration**: Linked form changes and deletion requests directly to secure PUT and DELETE REST endpoints on the server using authorization bearer tokens.

### 📅 June 7, 2026

#### 1. ⚡ Incremental Dashboard Loading & Skeleton States
* **[MODIFY]** Updated [Dashboard.jsx](src/pages/Dashboard.jsx):
  * **Instantly Render Static Content**: Removed the global loading block that blocked the entire screen. The Hero banner, description, and title now render immediately on page mount.
  * **Visual Skeleton Layout**: Implemented themed, shimmering loading skeletons mimicking the cards and tables of the leaderboard sections, keeping the UI engaged and active during the data fetch.

#### 2. 🔐 Authentication Form Submission Loading States
* **[MODIFY]** Updated [Login.jsx](src/pages/Login.jsx):
  * **Form Submission Lock**: Added a `submitting` state that disables input fields (Name, Email, Password), the submit button, and the register/login toggle link during active API requests to prevent double-submissions.
  * **Dynamic Button Feedback**: Injected a loading spinner inside the submit button that displays `Signing In...` (in Login mode) or `Registering...` (in Register mode) during processing.

#### 3. 💾 Global Data Caching & Performance Optimizations
* **[NEW]** Created [DataContext.jsx](src/context/DataContext.jsx):
  * **Global Cache Store**: Implemented a centralized React Context managing global cache states for dataset sections list, models list, and detailed single-model objects.
  * **Cache Management APIs**: Added functions to load cache on mount (`fetchGlobalData`), retrieve specific cached details (`getModelDetail`), clear cache state (`clearCache`), and update or delete specific cached elements in-place (`updateModelInCache`, `deleteModelFromCache`).
* **[MODIFY]** Updated [App.jsx](src/App.jsx):
  * Integrated the `DataProvider` into the core provider tree wrapping the application routes.
* **[MODIFY]** Updated [Dashboard.jsx](src/pages/Dashboard.jsx):
  * Linked sections and models states directly to the global `useData()` cache hook, making navigation back to the dashboard from detail views instantaneous with zero redundant backend database requests.
* **[MODIFY]** Updated [ModelDetail.jsx](src/pages/ModelDetail.jsx):
  * Added cache-first detail loading. If the model details exist in the cache, the page displays them **instantly** (eliminating the spinner lag), while re-verifying and updating in the background.
  * Connected editing/deletion successes to the global cache context to trigger instant UI updates.
* **[MODIFY]** Updated [SubmitModel.jsx](src/pages/SubmitModel.jsx):
  * Configured form submission to automatically call `clearCache()` on success, forcing the next dashboard mount to query the database and pick up the new model submission.




