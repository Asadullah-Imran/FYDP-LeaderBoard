# SpatialAblate Server API

Welcome to the backend repository for the **SpatialAblate** leaderboard engine. This is a Node.js and Express REST API backed by MongoDB (Mongoose). It provides secure user authentication, model submission storage, dataset section categorization, and authenticated image uploads.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB (via Mongoose v9)
- **Security**: JWT (JSON Web Tokens) & Bcrypt (hashing)
- **Storage & Uploads**: Multer & Cloudinary SDK

---

## 🔑 Key Features & API Endpoints

### 1. User Authentication (`/api/auth`)
* `POST /api/auth/register` - Create a new user account (returns token).
* `POST /api/auth/login` - Authenticate an existing user (returns token + user info).

### 2. Dataset Sections (`/api/sections`)
* `GET /api/sections` - Retrieve list of active dataset sections/leaderboards.
* `POST /api/sections` - Create a new section (admin restricted).

### 3. Model Submissions (`/api/models`)
* `GET /api/models` - Fetch all submitted models.
* `POST /api/models` - Submit a new model performance metrics (requires Authorization Bearer header).

### 4. File Uploads (`/api/upload`)
* `POST /api/upload` - Upload model flowcharts/methodology images to Cloudinary (requires Authorization Bearer header).

---

## 💻 Getting Started

### Environment Variables
Create a `.env` file in the root of the `server/` directory:
```env
PORT=5050
MONGO_URI=mongodb://localhost:27017/spatialablate
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Running the Server
You can launch the backend development server using several methods:

- **Option A (All-in-One Orchestrated Startup)**:
  Run `./start.sh` in the root folder of the workspace. This automatically launches both the client and the server in two separate macOS Terminal windows/tabs.
  
- **Option B (Server-Only Dev Server)**:
  Run `./server.sh` in the root folder of the workspace to start the server independently.
  
- **Option C (Manual Npm Command)**:
  ```bash
  cd server
  npm install
  npm run dev
  ```

---

## 📝 Codebase Updates & Changelog

This log tracks functional changes and additions made to the server codebase:

### 📅 May 24, 2026

#### ⚡ Multi-Terminal Developer Tools
* **[NEW]** Created `start.sh` (Root): Orchestrated terminal automation script using AppleScript to launch backend/frontend servers in distinct terminal tabs.
* **[NEW]** Created `server.sh` (Root): Server-specific startup script that checks server dependencies and starts Nodemon (`nodemon index.js`).

#### 🗄️ Database Seeding of Dataset Sections
* **[MODIFY]** Updated [index.js](index.js):
  * **Default Dataset Seeding**: Configured the database connection handler to dynamically check and seed the 8 default dataset sections (e.g. `Human_Lymph_Node_A1`, `Mouse_Brain_ATAC`, etc.) on server boot if they don't already exist.

#### 📝 Secure Model Update Endpoint (PUT Route)
* **[NEW]** Added `PUT /api/models/:id` route in [modelRoutes.js](routes/modelRoutes.js).
* **[NEW]** Created `updateModel` in [modelController.js](controllers/modelController.js):
  * Validates request payloads and updates fields securely (Model Name, Dataset Section, ARI/NMI Scores, Methodology description, and Architecture flow).
  * Enforces ownership validation: only the original model author or an admin is authorized to perform changes.

#### 🌐 Vercel Serverless Ready & CORS Configuration
* **[MODIFY]** Modularized backend configuration by separating Express app instantiation to `server/app.js` and server listening to `server/index.js` for seamless Vercel Serverless deployments.
* **[NEW]** Configured Vercel rewrites inside `vercel.json` and created serverless entry handler `api/index.js`.
* **[MODIFY]** Enhanced CORS settings in `server/app.js` to process strict multi-origin arrays from environment variables (`FRONTEND_URL` in `server/.env`). Authorized both `http://localhost:5173` and `https://fydp-leader-board.vercel.app` dynamically.



