# 🖥️ SpatialAblate Client Pages Directory & Specification

This documentation provides an exhaustive, page-by-page functional breakdown of the frontend client architecture for **SpatialAblate**. It details all user interfaces, listing paths, text copies, input fields, interactive forms, and operational buttons without styling or visual design details.

---

## 🗺️ Page Mapping at a Glance

Below is a quick-reference index of routes and their corresponding component files:

| Page Name | Route Path | Component File | Auth Level | Key Components & Libraries |
| :--- | :--- | :--- | :--- | :--- |
| **Global Navigation Shell** | *All Routes* | [App.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/App.jsx) | Public (Context-Driven) | Lucide Icons, Context Providers |
| **Leaderboard Dashboard** | `/` | [Dashboard.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/Dashboard.jsx) | Public / Reader | HTML5 Table, Rank Badges, Sorting |
| **Login & Register** | `/login` | [Login.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/Login.jsx) | Anonymous Guest | Form, Switch state toggler, AuthContext |
| **Submit Model** | `/submit` | [SubmitModel.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/SubmitModel.jsx) | Authenticated Author | Custom Searchable Combobox, Live Preview Tab, Markdown/LaTeX Parser |
| **Model Detail (View/Edit)** | `/models/:id` | [ModelDetail.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/ModelDetail.jsx) | Owner (Edit) / Public (View) | Mermaid.js, ReactMarkdown, LaTeX, Edit Form, Image Manager |

---

## 🛡️ 1. Global Navigation Shell
* **Component Path**: [App.jsx (Navigation component)](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/App.jsx)
* **Access**: Automatically rendered at the top of every page layout.

### 💬 Texts
* **System Brand Logo**: `"SpatialAblate"` (Links back to `/`)
* **Menu Options**:
  * `"Dashboard"` (Links to `/`)
  * `"Submit Model"` (Links to `/submit`)
* **User Session Status Indicator** (Visible only if logged in):
  * Displays active user's name: `"{user.name}"`
  * Features an online indicator dot.

### ⚙️ Input Fields
* *None*

### 🔘 Buttons & Click Actions
1. **Dark Mode Toggle Button**
   * **Action**: Calls `toggleTheme()` from the global `ThemeContext` to invert system-wide styling immediately between light and dark modes.
2. **Dynamic Authentication Action Button** (Context State Dependent)
   * **Scenario A: Logged Out**
     * **Button Text**: `"Login"`
     * **Action**: Acts as a hyperlink routing the user to the `/login` page.
   * **Scenario B: Logged In**
     * **Button Text**: `"Logout"`
     * **Action**: Calls the `logout()` method in `AuthContext` to clear user session tokens and refresh navigation layout.

---

## 🔑 2. Login & Register Page
* **Component Path**: [Login.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/Login.jsx)
* **Route Path**: `/login`

> [!NOTE]
> This screen behaves as a unified portal using a local boolean state switcher (`isLogin`). Depending on whether the user selects Login or Register, the UI changes labels, inserts additional fields, alters validation, and targets the corresponding endpoint.

```mermaid
graph TD
    A[Access /login Route] --> B{isLogin State?}
    B -- True [Default] --> C[Render Login UI]
    B -- False --> D[Render Register UI]
    C --> E[2 Input Fields: Email, Password]
    D --> F[3 Input Fields: Name, Email, Password]
    C --> G[Call POST /auth/login]
    D --> H[Call POST /auth/register]
    G & H --> I[Update AuthContext with User Session]
    I --> J[Navigate to / Dashboard]
```

### 💬 Texts
* **Main Heading**:
  * Login Mode: `"Login to SpatialAblate"`
  * Register Mode: `"Create an Account"`
* **Input Labels**: `"Name"` *(Register Mode only)*, `"Email"`, `"Password"`
* **Submit Button Copy**: `"Login"` *(Login Mode)* / `"Register"` *(Register Mode)*
* **Footnote Redirection Context**:
  * Login Mode: `"Don't have an account? "`
  * Register Mode: `"Already have an account? "`
* **Mode Toggler Text Button**: `"Register"` *(Login Mode)* / `"Login"` *(Register Mode)*

### ⚙️ Input Fields

| Label | Input Name | Type | Validation / Requirements |
| :--- | :--- | :--- | :--- |
| **Name** *(Register Only)* | `name` | `text` | Required only when `!isLogin` is active. |
| **Email** | `email` | `email` | Required. Validates proper email formatting. |
| **Password** | `password` | `password` | Required. Masks characters automatically. |

### 🔘 Buttons & Click Actions
1. **Form Submit Button**
   * **Text**: `"Login"` / `"Register"`
   * **Action**: Executes `handleSubmit(e)`. Dispatches a request to `/api/auth/login` or `/api/auth/register` passing `formData`. On successful promise, initializes `login(userData)` inside the react context wrapper and routes back to `/`.
2. **Mode Switcher Button**
   * **Text**: `"Register"` / `"Login"`
   * **Action**: Flips the `isLogin` state boolean (`setIsLogin(!isLogin)`), dynamically updating the input fields, text copies, and target HTTP URLs.

---

## 📊 3. Leaderboard Dashboard
* **Component Path**: [Dashboard.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/Dashboard.jsx)
* **Route Path**: `/`

### 💬 Texts
* **Main Title Banner**: `"Spatial Multi-Omics Leaderboard"`
* **Page Description Subtitle**: `"A centralized platform to track, compare, and display the performance of spatial bioinformatics models."`
* **Section Heading**: `"Dataset: {section.name}"`
* **Table Columns**: `"Rank"`, `"Model Name"`, `"Author"`, `"ARI Score"`, `"NMI Score"`, `"Action"`
* **Empty State Card Details** (Rendered only when no models exist):
  * Title: `"No models submitted yet"`
  * Body paragraph: `"All dataset categories are currently empty. Click on the button below to submit the first performance entry!"`

### ⚙️ Input Fields
* *None*

### 🔘 Buttons & Click Actions
1. **"Submit First Model" Button** (Visible only if the dashboard is entirely empty)
   * **Text**: `"Submit First Model"`
   * **Action**: Reroutes browser state to `/submit`.
2. **"View Details →" Action Link** (Rendered for each row in the table grid)
   * **Text**: `"View Details →"`
   * **Action**: Directs to `/models/{model._id}` to load the model's detailed methodology page.

---

## 📝 4. Submit Model Page
* **Component Path**: [SubmitModel.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/SubmitModel.jsx)
* **Route Path**: `/submit`

> [!WARNING]
> This page requires user authentication. If unauthorized users attempt a submission, the client displays an alert reminding them to sign in.

### 💬 Texts
* **Main Page Header**: `"Submit New Model"`
* **Form Labels**:
  * `"Model Name"`, `"Dataset Section"`, `"ARI Score"`, `"NMI Score"`, `"Description (Markdown + LaTeX)"`, `"Methodology Image"`, `"Architecture Flow (Mermaid.js) - Optional"`
* **Markdown Textarea Placeholder**: `"Write your methodology explanation using Markdown and LaTeX... (e.g. Write equations like $$E = mc^2$$ or inline $x^2$)"`
* **Markdown Preview Empty Placeholder**: `"Nothing to preview. Go to 'Write' tab to add methodology description."`
* **Form Submit Text**: `"Submit Model"`

### ⚙️ Input Fields

#### A. Standard Inputs & Text Areas
1. **Model Name**
   * **Type**: `text`
   * **Parameters**: `name="name"`, `required`
2. **ARI Score (Adjusted Rand Index)**
   * **Type**: `number`
   * **Parameters**: `name="scoreARI"`, `step="0.001"`, `required`
3. **NMI Score (Normalized Mutual Information)**
   * **Type**: `number`
   * **Parameters**: `name="scoreNMI"`, `step="0.001"`, `required`
4. **Description (Markdown + LaTeX)**
   * **Type**: `<textarea>` / Live HTML rendering
   * **Parameters**: `name="descriptionMarkdown"`, `required`, `rows={8}`
   * **Modes**:
     * **Write Tab**: Houses the raw monospace code editor input.
     * **Preview Tab**: Translates syntax into active DOM nodes, parsing math blocks using `remark-math` and standard LaTeX symbols via `rehype-katex`.
5. **Methodology Image File Selector**
   * **Type**: `file`
   * **Parameters**: `accept="image/*"`
   * **Action**: Populates file metadata to local react hooks, ready to upload to server storage.
6. **Architecture Flow (Mermaid.js)**
   * **Type**: `<textarea>`
   * **Parameters**: `name="architectureFlow"`, `rows={4}`
   * **Placeholder**: `graph TD;\n  A-->B;`

#### B. The Searchable Combobox Selector (Dataset Section)
* Replaces the old static selection element to resolve scalability issues when navigating huge dataset options:
  * **Trigger Toggle Button**: Renders current category name or `"Select a dataset section..."` with a toggle state indicator.
  * **Dropdown Panel**: List item box overlaying other page components. Uses automatic mouse events to close when users click outside the panel boundaries.
  * **Combobox Filter Search Input**: An integrated sub-input text box filtering options interactively.
  * **Filter Result List**: Shows filtered buttons with selection indicators. If search finds no matches, renders `"No matching sections found"`.

### 🔘 Buttons & Click Actions
1. **Combobox Trigger Button**
   * **Action**: Toggles the dropdown options state (`setIsOpen(!isOpen)`).
2. **"Write" Tab Toggle Button**
   * **Action**: Activates `'write'` mode, making the raw text editing field visible.
3. **"Preview" Tab Toggle Button**
   * **Action**: Activates `'preview'` mode, rendering description text as fully compiled HTML.
4. **"Submit Model" Button**
   * **Action**: Executes `handleSubmit(e)`.
     1. Attaches user authorization tokens to header requests.
     2. Checks if an image is queued, then posts binary forms to `/api/upload` to receive a permanent URL.
     3. Appends coordinates and imagery URLs, then dispatches a POST promise to `/api/models`.
     4. Guides routes back to the main homepage (`/`) on success.

---

## 🔍 5. Model Detail Page (View & Edit Screens)
* **Component Path**: [ModelDetail.jsx](file:///Users/assadullahimran/developer/running_project/LeaderBoard/client/src/pages/ModelDetail.jsx)
* **Route Path**: `/models/:id`

> [!IMPORTANT]
> The Model Detail page contains **two distinct states**: a **Static Read-Only Display** and an **Interactive Inline Editor**. The editor controls are visible only if the logged-in user matches the model's creator (`authorId`) or holds `'admin'` role privileges.

```mermaid
graph TD
    A[Load Model Detail] --> B{Auth Verification}
    B -- Is Creator or Admin --> C[Show Header Actions: Edit & Delete]
    B -- Guest or Other User --> D[Render Display Mode Only]
    C --> E[Click Edit Model]
    E --> F[Toggle UI state to Edit Mode]
    F --> G[Render prefilled form: Name, Scores, Textarea, Image Selector]
    G --> H[Click Save Changes]
    H --> I[Update DB via PUT /models/:id]
    I --> D
```

---

### 🏛️ STATE A: Static Read-Only Display Mode

#### 💬 Texts
* **Back Button Link**: `"← Back to Dashboard"`
* **Model Main Header**: `"{model.name}"`
* **Sub-Header details**: `"Submitted by {model.authorId?.name} for dataset {model.datasetSectionId?.name}"`
* **Scientific Score Metric Cards**: `"ARI"`, `"NMI"`
* **Section Labels**: `"Methodology"`, `"Architecture Flow"`, `"Gallery"`

#### ⚙️ Input Fields
* *None (All static fields rendered)*

#### 🔘 Buttons & Click Actions
1. **"← Back to Dashboard" Link**
   * **Action**: Navigates back to route `/`.
2. **"Edit Model" Button** (Visible only to owners/admins)
   * **Action**: Pulls active model details into the temporary `editData` buffer and activates `isEditing = true` to redraw inputs.
3. **"Delete Model" Button** (Visible only to owners/admins)
   * **Action**: Triggers confirm warning dialogue `window.confirm`. If approved, runs DELETE request to `/api/models/{id}` utilizing auth headers, then redirects browser to `/`.

---

### 🛠️ STATE B: Interactive Inline Editor Mode

#### 💬 Texts
* **Form Panel Title**: `"Edit Model Submission"`
* **Save/Cancel Button Layout**: `"Cancel"`, `"Save Changes"`
* **Form Input Labels**: Same as SubmitModel form labels.
* **Inline Image Banner Info**: Shows indicator text when a file is selected for upload on save.

#### ⚙️ Input Fields & Interactive Elements
1. **Model Name Input**: Prefilled `text` input.
2. **Dataset Section Select**: Custom searchable combobox with matching search logic as `/submit`.
3. **ARI / NMI Numeric Inputs**: Numeric boxes with value constraints.
4. **Description Editor Tabs**:
   * **Write tab**: Textarea element filled with current LaTeX methodology writeup.
   * **Preview tab**: Live markdown compilation panel to test modifications before saving.
5. **Architecture flow (Mermaid.js)**: Textarea prefilled with mermaid diagram definitions.
6. **Gallery & Methodology Image Manager**:
   * **Interactive Thumbnail Board**: Displays list of existing images (`editData.methodologyImages`).
   * **New File Uploader**: `file` selector input, allowing new uploads to the active set on saving.

#### 🔘 Buttons & Click Actions
1. **"Cancel" Button**
   * **Action**: Deactivates `isEditing` state, dropping any local modifications instantly.
2. **"Save Changes" Button**
   * **Action**: Executes `handleSave()`. Uploads newly staged file targets, updates lists, makes PUT calls to the server database, refetches models, and returns back to the Static Display Screen.
3. **"Remove Image" Button** (Rendered on each image thumbnail inside the editor)
   * **Action**: Filters the selected item from the local array `editData.methodologyImages` instantly. Takes effect globally in the database once the user saves the changes.
