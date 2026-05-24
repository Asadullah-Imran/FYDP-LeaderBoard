# **Product Requirements Document (PRD)**

## **Spatial Multi-Omics Ablation Leaderboard & Dashboard**

**Date:** May 23, 2026  
**Document Version:** 2.0

## **1. Executive Summary**

This project delivers a centralized leaderboard web platform designed to track, compare, and display the performance of various spatial bioinformatics and multi-omics integration models (e.g., SpatialGlue, spaLLM) during ablation studies. The platform allows researchers to upload model methodologies, methodology images, architectural graphs, and evaluation metrics across distinct dataset sections (such as *Human Lymph Node A1*, *D1*) for rigorous comparison and academic review.

## **2. Stakeholders & Target Audience**

* **Core Development Team:** Final Year Design Project (FYDP) research team.  
* **Advisory Panel & Evaluators:** Project professors and academic supervisors.  
* **Target Users:** Researchers and academic peers requiring an accessible, web-based interface to review mathematical foundations, model architectures, and performance metrics (e.g., ARI, NMI).

## **3. System Architecture & Technology Stack**

This platform utilizes the MERN stack for full-stack development.

* **Frontend / UI:** React.js, Tailwind CSS  
* **Backend / API:** Node.js, Express.js  
* **Database:** MongoDB (hosted on MongoDB Atlas)  
* **ODM:** Mongoose  
* **Authentication & RBAC:** JWT (JSON Web Tokens) or Google OAuth (via Passport.js)
* **File Storage:** Cloudinary (images only)
* **Deployment:** Vercel 
* **Parsing & Rendering Libraries:** 
  * `react-markdown`, `remark-math`, `rehype-katex` (for Markdown & LaTeX equations)  
  * `mermaid` (for rendering architectural methodology graphs)

## **4. Core Features & Requirements**

### **4.1 Authentication and Authorization**

* **Requirement:** Users must authenticate using secure login (Google OAuth or Email/Password).  
* **Requirement:** The system must enforce Role-Based Access Control (RBAC) with two primary roles: Admin and Member.  
* **Acceptance Criteria:** 
  * Unauthenticated users cannot upload models or modify dashboard areas.  
  * Role-based middleware in Express protects Admin-only routes.

### **4.2 Dashboard & Dataset Sections**

* **Requirement:** A landing page introducing the research context, leading into a primary Dashboard view.  
* **Requirement:** The Dashboard is divided into distinct dataset sections (e.g., *Human Lymph Node A1*, *Human Lymph Node D1*).  
* **Requirement:** Only users with the Admin role can create, modify, or delete these dataset sections.  
* **Acceptance Criteria:** Non-admins attempting to create a section will receive a `403 Forbidden` response from the API.

### **4.3 Model Leaderboard Tables**

* **Requirement:** Each dataset section contains a leaderboard table ranking the submitted models.  
* **Requirement:** The table displays: Model Name, Author, and core performance metrics (ARI, NMI, etc.).  
* **Requirement:** Clicking a model row routes the user to that specific model's detailed view.

### **4.4 Model Submission Pipeline**

* **Requirement:** Users can submit a new model by providing:  
  * Model Name.  
  * Dataset Section selection (choosing which section the model belongs to alongside the markdown file).
  * Performance Scores (ARI, NMI via manual input fields).  
  * A Markdown (`.md`) file containing the detailed explanation and LaTeX formulas (wrapped in `$` or `$$`).  
  * **Methodology Images:** Users can insert and upload images detailing the Methodology alongside the markdown content.
* **Requirement:** Markdown files are read client-side and sent as text strings. Image files are uploaded to cloud storage (e.g., S3/Cloudinary), returning URLs to store in MongoDB.
* **Acceptance Criteria:** Uploaded text and image links update the React component state to allow for form submission via the Express API.

### **4.5 Detailed Model Pages**

* **Requirement:** A dynamically generated page for each submitted model (`/models/:id`).  
* **Requirement:** Markdown content is rendered into styled HTML, with all LaTeX expressions accurately formatted via Katex.  
* **Requirement:** The Methodology images are rendered within the content or as an architecture gallery.  
* **Requirement:** The page displays a performance card. If the user navigated to this page from a specific dataset section leaderboard, that specific performance metric card is visually highlighted.

### **4.6 Data Ownership & Management**

* **Requirement:** A model and its associated data can only be modified or deleted by the original author (the user who submitted it) or a system Admin.  
* **Acceptance Criteria:** The Express backend verifies `req.user.id === model.authorId` or `req.user.role === 'admin'` before executing Mongoose `updateOne` or `deleteOne` operations.

## **5. Database Schema (MongoDB / Mongoose)**

```javascript
const mongoose = require('mongoose');

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  image: { type: String }, // Profile picture URL
  role: { type: String, enum: ['member', 'admin'], default: 'member' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- Dataset Section Schema ---
const datasetSectionSchema = new mongoose.Schema({
  name: { type: String, required: true } // e.g., "Human lymph node A1"
}, { timestamps: true });

const DatasetSection = mongoose.model('DatasetSection', datasetSectionSchema);

// --- Model Submission Schema ---
const modelSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "SpatialGlue", "spaLLM"
  
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  datasetSectionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DatasetSection', 
    required: true 
  },
  
  // Performance Metrics
  scoreARI: { type: Number, required: true },
  scoreNMI: { type: Number, required: true },
  
  // Parsed Artifacts & Uploads
  descriptionMarkdown: { type: String, required: true }, // Markdown + LaTeX content
  methodologyImages: [{ type: String }], // Array of image URLs for methodology
  architectureFlow: { type: String }, // Optional Mermaid.js syntax content
  
}, { timestamps: true });

const ModelSubmission = mongoose.model('ModelSubmission', modelSubmissionSchema);

module.exports = { User, DatasetSection, ModelSubmission };
```

## **6. Implementation Phases**

* **Phase 1: Foundation (Week 1)**  
  * Initialize React.js frontend with Tailwind CSS and Node.js/Express backend.  
  * Configure MongoDB cluster (Atlas) and define Mongoose schemas.  
  * Implement authentication routes and JWT/OAuth strategy.  
* **Phase 2: Core Infrastructure (Week 2)**  
  * Develop Express REST API routes for dataset section management (Admin only).  
  * Set up image upload pipeline (e.g., multer + Cloudinary/S3) for Methodology images.
  * Build the model submission form in React.  
* **Phase 3: Rendering & UI (Week 3)**  
  * Implement `react-markdown` and `katex` for the model detail pages in React.  
  * Build the interactive leaderboard tables fetching data from the Express API.  
* **Phase 4: Polish & Review (Week 4)**  
  * Implement contextual highlighting for performance cards.  
  * Finalize responsive design, edge-case handling, and authorization testing before final FYDP presentation.