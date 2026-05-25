# SpatialAblate Codebase Architecture Audit Report

**Date:** May 25, 2026  
**Auditor:** Antigravity AI  
**Scope:** Full-stack codebase audit (React.js Client & Node.js/Express.js Server)

---

## 1. Executive Summary

The **SpatialAblate** codebase represents a robust, highly modular, and production-ready implementation of a spatial multi-omics ablation benchmarking leaderboard. Employing the **MERN (MongoDB, Express, React, Node)** stack with elegant Tailwind styling, the codebase follows standard MVC (Model-View-Controller) design patterns on the server and utilizes component-oriented, hooks-based architectures on the frontend. 

The application implements rigorous role-based access control (RBAC), secure token-based authentication, and direct mathematical LaTeX & flow-graph rendering capabilities suitable for scholarly bioinformatics analysis. This audit details the codebase's structural layout, evaluates security and performance profiles, highlights system strengths, and provides actionable recommendations to optimize performance.

---

## 2. Directory Structure & System Architecture

The project is cleanly split into decoupled `client/` and `server/` systems, allowing for serverless deployment configurations (e.g. on Vercel) and independent pipeline scaling.

```mermaid
graph TD
    subgraph Client System (React)
        A[App.jsx] --> B[AuthContext & ThemeContext]
        A --> C[Page Views]
        C --> D[Dashboard]
        C --> E[ModelDetail]
        C --> F[SubmitModel]
        C --> G[AdminPanel]
        C --> H[Login]
    end

    subgraph Server System (Express & MongoDB)
        I[app.js] --> J[Routes Layer]
        J --> K[authRoutes]
        J --> L[sectionRoutes]
        J --> M[modelRoutes]
        J --> N[uploadRoutes]
        
        K --> O[authController]
        L --> P[sectionController]
        M --> Q[modelController]
        N --> R[Multer & Cloudinary]
        
        O & P & Q --> S[Mongoose Models]
        S --> T[(MongoDB Atlas)]
    end

    C -- axios HTTP Requests --> J
```

---

## 3. Database Schema & Data Models

Database operations leverage **Mongoose ODM** with strictly typed schemas and logical associations.

### 3.1 User Schema (`User.js`)
- Enforces uniqueness on emails.
- Utilizes role enumeration (`['member', 'admin']`) with `member` as the secure default.
- Implements standard timestamps for tracking registration.

### 3.2 Dataset Section Schema (`DatasetSection.js`)
- Represents distinct ablation study conditions.
- Uses simple schema structures, enabling low overhead lookups.

### 3.3 Model Submission Schema (`ModelSubmission.js`)
- Employs strict relationships using Mongoose ObjectIds pointing to `User` and `DatasetSection`.
- Houses scores as numbers (ARI, NMI) to enable mathematical sorting and rank evaluations on leaderboards.
- Embeds parsed rich content fields: `descriptionMarkdown`, `methodologyImages` array, `architectureFlow`, and an optional `githubUrl`.

---

## 4. Backend Routing, Auth, & Controller Layer

The server codebase utilizes standard Express routing with decoupled controllers.

### 4.1 Security & Authentication
- **Password Hashing:** Implemented securely via `bcrypt` with a work factor (salt rounds) of `10`.
- **JWT Verification:** Custom `authMiddleware.js` handles authorization header parsing (`Bearer <Token>`) and verifies signature validity.
- **RBAC (Role-Based Access Control):** The `admin` middleware enforces strict endpoint shielding by validating `req.user.role === 'admin'`, responding with `403 Forbidden` on breach.

### 4.2 Database Cold-Start Resilience
- ** cold-starts mitigation:** In `app.js`, `ensureDbConnected` acts as a crucial pre-connection middleware. For serverless executions (like Vercel), it detects database disconnect or intermediate connecting states, holding request pipelines until MongoDB registers `connected`, fully resolving cold-start race conditions.

### 4.3 Upload Pipeline (`uploadRoutes.js`)
- Leverages `multer` for stream processing.
- Restricts uploads explicitly using mime-type filters and extension matching (restricting uploads to jpeg, png, webp, and gif).
- Automatically routes local disk uploads directly to **Cloudinary** cloud storage, returning secure HTTPS URLs.
- **Crucial Cleanup:** Includes immediate local file deletion (`fs.unlinkSync(req.file.path)`) after cloud sync, preventing ephemeral local storage leaks.

---

## 5. Frontend Client Architecture

The React single-page application (SPA) is built around Vite, utilizing modern styling architectures.

### 5.1 Context State & Theming
- **`AuthContext.jsx`:** Persists login state in `localStorage` alongside JSON-Web-Tokens, exposing a simple custom hook `useAuth()`.
- **`ThemeContext.jsx`:** Custom dark-theme toggle utilizing HSL CSS variables, changing body themes smoothly across visual components.

### 5.2 Dynamic Science Rendering
- **LaTeX Math Formulation:** Utilizes `react-markdown`, `remark-math`, and `rehype-katex` to seamlessly render complex equations client-side.
- **Pipeline Flow Graphs:** Employs `mermaid` dynamically initialized client-side, translating plain text structures in submitted models into visual pipeline workflows.

### 5.3 Administrative Suite (`AdminPanel.jsx`)
- Implements a state-of-the-art tabbed workspace utilizing React conditional tabs.
- Utilizes concurrent request models to pull data.
- Provides immediate visual confirmations with temporary toast notices (`setActionMessage`) and secure confirmation modals before performing mutations.

---

## 6. Codebase Strengths

1. **Auto-Seeding Integrity:** Auto-seeds default dataset categories and the system administrator account on DB init. 
2. **Serverless Optimized:** Disable of Mongoose buffering and integration of connection middleware ensures great durability on edge/serverless platforms.
3. **Data Ownership Protections:** Controllers rigorously double-check authorization (`req.user.role === 'admin' || model.authorId === req.user._id`) before allowing updates/deletions, preventing API spoofing.
4. **Rich Scientific UI:** Premium integration of LaTeX math and interactive flowcharts makes this leaderboard stand out visually and educationally.

---

## 7. Recommendations & Opportunities

> [!TIP]
> **1. Validate MongoDB ObjectIds in Express Params:**
> In `modelController.js` and `sectionController.js`, queries on route parameters like `req.params.id` are passed directly into Mongoose finder hooks. If an invalid or malformed hex-string is passed, Mongoose will throw a cast error. Adding a validation middleware like `mongoose.Types.ObjectId.isValid` resolves this elegantly.
> 
> ```javascript
> if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
>   return res.status(400).json({ message: 'Invalid reference ID format' });
> }
> ```

> [!IMPORTANT]
> **2. Clean up Cascade Deletes on Dataset Section Removal:**
> Deleting a dataset section in `sectionController.js` currently leaves submissions pointing to a now-deleted `datasetSectionId`. Adding a pre-delete middleware hook in Mongoose schemas or a manual cleanup line inside `deleteSection` avoids database lookup errors.
> 
> ```javascript
> // Inside deleteSection controller:
> await ModelSubmission.deleteMany({ datasetSectionId: section._id });
> ```

> [!NOTE]
> **3. Add Password Strength Validation:**
> Currently, the register endpoint takes any password length without restrictions. Enforcing basic constraints (e.g., minimum 6 characters) at the schema validation or controller level ensures users create robust accounts.
