# 📘 User Guide Management Application — Project Overview

A dual-service application for creating, managing, and displaying structured user guides. The **backend** is an admin interface for content authoring; the **frontend** is a public-facing reader for end users.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browsers                          │
└────────────────┬───────────────────────────┬────────────────────┘
                 │                           │
     ┌───────────▼──────────┐   ┌────────────▼───────────┐
     │   BACKEND (Admin UI) │   │  FRONTEND (Reader UI)  │
     │  userguide-backend   │   │  userguide-frontend    │
     │                      │   │                        │
     │  • Auth & Sessions   │   │  • Fetch Pages via API │
     │  • Project CRUD      │   │  • Render Markdown     │
     │  • Page/Section CRUD │   │  • Table of Contents   │
     │  • Markdown Editor   │   │  • Welcome Screen      │
     └───────────┬──────────┘   └────────────┬───────────┘
                 │                           │
     ┌───────────▼───────────────────────────▼───────────┐
     │                   REST API / DB                    │
     │              PostgreSQL + Backend Server           │
     └────────────────────────────────────────────────────┘
```

**Key principle:** Every project is fully isolated — pages, settings, and admins created in one project are never visible in another.

---

## 🗄️ PostgreSQL Data Models

### `admins`
```sql
CREATE TABLE admins (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)        NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20),
  password    VARCHAR(255)        NOT NULL,  -- bcrypt hashed
  created_at  TIMESTAMP           DEFAULT NOW(),
  updated_at  TIMESTAMP           DEFAULT NOW()
);
```

### `projects`
```sql
CREATE TABLE projects (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(255)        NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,  -- URL prefix, e.g. "my-product"
  description   TEXT,
  frontend_url  VARCHAR(500)        NOT NULL,
  backend_url   VARCHAR(500)        NOT NULL,
  is_active     BOOLEAN             DEFAULT TRUE,
  welcome_page_enabled BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMP           DEFAULT NOW(),
  updated_at    TIMESTAMP           DEFAULT NOW()
);
```

### `admin_projects` *(join table — which admins belong to which projects)*
```sql
CREATE TABLE admin_projects (
  id         SERIAL PRIMARY KEY,
  admin_id   INTEGER REFERENCES admins(id)   ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  role       VARCHAR(50) DEFAULT 'editor',   -- 'owner' | 'editor'
  UNIQUE (admin_id, project_id)
);
```

### `pages`
```sql
CREATE TABLE pages (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  parent_id   INTEGER REFERENCES pages(id)    ON DELETE SET NULL,
  title       VARCHAR(255)  NOT NULL,
  slug        VARCHAR(255)  NOT NULL,
  icon        VARCHAR(100),                   -- icon name/class, e.g. "📄" or "fa-file"
  sequence    INTEGER       DEFAULT 0,
  description TEXT,
  content     TEXT,                           -- raw Markdown
  is_active   BOOLEAN       DEFAULT TRUE,
  created_at  TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW(),
  UNIQUE (project_id, slug)
);
```

> 💡 `parent_id` enables unlimited nesting depth. A `NULL` parent_id means the page is a root-level page.

---

## 🗂️ Entity Relationship Diagram

```
admins ──────────────── admin_projects ──────────────── projects
  │  (id)                  (admin_id,                    (id)
  │                         project_id)                   │
  │                                                        │
  │                                                  ┌─────▼──────┐
  │                                                  │   pages    │
  │                                                  │────────────│
  │                                                  │ id         │
  │                                                  │ project_id │◄── FK
  │                                                  │ parent_id  │◄── self-ref
  │                                                  │ title      │
  │                                                  │ slug       │
  │                                                  │ sequence   │
  │                                                  │ icon       │
  │                                                  │ content    │
  │                                                  │ is_active  │
  └──────────────────────────────────────────────────└────────────┘
```

---

## 🔐 Backend Features

### 1. Authentication

| Route | Method | Description |
|-------|--------|-------------|
| `/register` | `GET / POST` | Admin registration form |
| `/login` | `GET / POST` | Admin login; redirect to Dashboard on success |
| `/logout` | `POST` | Clear session |

**Register fields:** Name · Email · Phone · Password (+ confirmation)  
**Login fields:** Email · Password  
**Session:** JWT or server-side session with project context stored (current active project).

---

### 2. 🏠 Main Admin Dashboard

- Lists all projects the logged-in admin has access to
- Click a project card → switches context to that project's dashboard
- "Manage All Projects" button → goes to the project management page

---

### 3. 📁 Manage Projects

**Listing page features:**
- 🔍 Search filter
- Tabs: **Active Projects** / **Inactive Projects**
- Per-row actions: ✏️ Edit · 🗑️ Delete · 🔴 Deactivate / 🟢 Activate
- "Create Project" button

**Create / Edit Project form fields:**

| Field | Type | Notes |
|-------|------|-------|
| Project Title | Text | Display name |
| Unique Slug | Text | URL-safe prefix, e.g. `my-docs` |
| Description | Textarea | Optional |
| Frontend URL | URL | Where the reader is hosted |
| Backend URL | URL | This admin panel's URL |

---

### 4. 🔄 Switch Project

- Persistent **mega menu** on the left sidebar lists all projects
- Switching project requires **re-authentication** (security checkpoint)
- After login, session is scoped to the newly selected project

---

### 5. 📊 Project Admin Dashboard

**Header:** Shows active project name + **"View Live Website" →** button (links to `frontend_url`)

**Statistics panel:**

| Stat | Detail |
|------|--------|
| 📄 Total Pages | Count of all pages in this project |
| 🕐 Recently Updated | Last N modified pages with "View All" link |
| 🏠 Welcome Screen | ON/OFF toggle for the default landing page |

---

### 6. 📝 Manage Pages

**Listing view options:**
- 🌲 **Hierarchy** — tree view showing parent → child relationships
- 🌿 **Root** — top-level pages only
- 📑 **Sub-pages** — child pages only
- 🔍 Search filter

**Create / Edit Page form:**

| Field | Type | Notes |
|-------|------|-------|
| Page Title | Text | Display name |
| Sequence | Number | Sort order among siblings |
| Icon | Icon picker | Emoji or icon class |
| Parent Page | Dropdown | `NULL` = root page |
| Description | Textarea | Short summary |
| Content | Markdown editor | Full page content |

**Markdown Editor tabs:** `Editor` · `Preview` · `Split`

---

## 🌐 Frontend Features

### Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Project Logo / Name]                        [Search]  │
├──────────────────┬──────────────────────────────────────┤
│                  │                                      │
│  📋 Contents     │   # Page Title                       │
│                  │                                      │
│  ▶ Page          │   Rendered Markdown content here...  │
│  ▼ Page 1        │                                      │
│    ▶ Page 1.1    │   ## Section heading                 │
│    ▶ Page 1.2    │                                      │
│  ▶ Page 2        │   Body text, code blocks, tables,    │
│    ▶ Page 2.1    │   images, etc.                       │
│                  │                                      │
│                  │                                      │
└──────────────────┴──────────────────────────────────────┘
  Left sidebar:          Main content area:
  Table of Contents      Markdown rendered to HTML
```

### Behaviour

- First visit → **Welcome Screen** (if enabled in project settings)
- Left sidebar renders a nested Table of Contents sourced from the backend page tree
- Clicking a page navigates to it and renders its Markdown content on the right
- Page hierarchy in the sidebar mirrors the `parent_id` / `sequence` structure

---

## 🔗 Suggested API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create admin account |
| `POST` | `/api/auth/login` | Login; returns token |
| `POST` | `/api/auth/logout` | Invalidate session |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete project |
| `PATCH` | `/api/projects/:id/status` | Toggle active/inactive |

### Pages *(scoped per project)*
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/projects/:projectId/pages` | List pages (tree or flat) |
| `POST` | `/api/projects/:projectId/pages` | Create page |
| `GET` | `/api/projects/:projectId/pages/:id` | Get page + content |
| `PUT` | `/api/projects/:projectId/pages/:id` | Update page |
| `DELETE` | `/api/projects/:projectId/pages/:id` | Delete page |

### Public Frontend API *(no auth required)*
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/public/:projectSlug/pages` | Get page tree for ToC |
| `GET` | `/api/public/:projectSlug/pages/:slug` | Get page content |
| `GET` | `/api/public/:projectSlug/welcome` | Get welcome page |

---

## 🛠️ Suggested Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | Node.js (Express) or Django / FastAPI |
| **Frontend Reader** | React or Next.js |
| **Database** | PostgreSQL |
| **Auth** | JWT (with refresh tokens) |
| **Markdown Rendering** | `react-markdown` + `remark-gfm` |
| **Markdown Editor** | `@uiw/react-md-editor` or `CodeMirror` |
| **ORM** | Prisma (Node) or SQLAlchemy (Python) |
| **Styling** | Tailwind CSS |

---

## ⚠️ Key Business Rules

1. **Project data isolation** — every query to `pages` (and related tables) **must** include a `project_id` filter. Never expose pages from one project in another.
2. **Slug uniqueness** — page slugs must be unique within a project (not globally). Project slugs must be globally unique.
3. **Re-auth on project switch** — switching the active project in the sidebar invalidates the current session token and forces a fresh login for the new project context.
4. **Welcome screen toggle** — the `welcome_page_enabled` flag on `projects` controls whether the frontend shows a landing page on first load or goes straight to the first page.
5. **Soft delete / inactive** — projects and pages support an `is_active` flag; prefer this over hard deletes to avoid broken links.
6. **Page ordering** — use the `sequence` column (integer) per parent to control sidebar ordering. On the frontend, sort by `(parent_id, sequence)`.
