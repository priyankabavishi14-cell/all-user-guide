# 📘 Project Overview

## 🔹 Application: User Guide Management System

This application manages and displays structured user guides using a **separate frontend and backend architecture**, each accessible via different URLs.

* **Backend URL:** `userguide-backend`
* **Frontend URL:** `userguide-frontend`

The backend is responsible for content creation and management, while the frontend renders the content in a clean, user-friendly format.

---

# 📑 Table of Contents

1. Problem Statement
2. Target Users
3. Features
4. Data Architecture
5. Tech Stack
6. UI/UX Guidelines
7. Suggested Project Structure

---

# 🎯 Problem Statement

Organizations need a scalable way to:

* Manage structured documentation
* Support hierarchical pages
* Render markdown content dynamically
* Separate admin (backend) and user (frontend) experiences

---

# 👥 Target Users

* **Admin Users**

  * Manage projects and content
  * Create/edit pages and structure

* **End Users**

  * View documentation
  * Navigate structured guides

---

# ✨ Features

## A. Items & Item Types

### 1. System Types (Immutable)

* Project
* Page
* Section
* User

---

## B. Collections

* Projects
* Pages
* Sections
* Users

---

## C. Search

* Global search (project-level)
* Page search
* Filter by:

  * Active / Inactive
  * Hierarchy

---

## D. Authentication

* Admin Register
* Admin Login
* Project-level access control
* Re-login required on project switch

---

## E. Core Features

### 🔧 Backend

#### 1. Admin Authentication

* Register: Name, Email, Phone, Password
* Login: Email, Password

#### 2. Project Management

* Create Project:

  * Title
  * Slug (unique)
  * Description
  * Frontend URL
  * Backend URL

* Actions:

  * Edit
  * Delete
  * Activate / Deactivate

#### 3. Dashboard

* Total pages
* Recently updated pages
* Welcome screen toggle

#### 4. Page Management

* Fields:

  * Title
  * Sequence
  * Icon
  * Parent Page
  * Description
  * Markdown Content

* Views:

  * Hierarchy
  * Root
  * Sub-pages

* Markdown Editor:

  * Editor
  * Preview
  * Split view

---

### 🌐 Frontend

* Welcome screen (default landing page)
* Dynamic sidebar (table of contents)
* Nested page hierarchy
* Markdown rendering

---

## F. AI Features (Pro Only)

* Auto-generate documentation
* Content suggestions
* Smart search

---

# 🗄️ Data Architecture

## 📊 Entity Relationship Diagram

```
User
 └── Project
       └── Page (self-referencing)
              └── Section (optional)
```

---

## 🐘 PostgreSQL Schema

### Users

```sql
users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT,
  created_at TIMESTAMP
)
```

### Projects

```sql
projects (
  id UUID PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  frontend_url TEXT,
  backend_url TEXT,
  is_active BOOLEAN,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP
)
```

### Pages

```sql
pages (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title TEXT,
  slug TEXT,
  sequence INT,
  icon TEXT,
  parent_id UUID REFERENCES pages(id),
  description TEXT,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP
)
```

---

## 🌱 Seed Data (System Types)

```json
[
  "Project",
  "Page",
  "Section",
  "User"
]
```

---

# 🛠️ Tech Stack

## Backend

* Node.js / NestJS
* PostgreSQL
* Prisma ORM

## Frontend

* Next.js
* Tailwind CSS
* Markdown Renderer

---

## 🧩 Architecture Diagram

```
[Frontend (Next.js)]
        ↓ API Calls
[Backend (Node.js)]
        ↓
[PostgreSQL Database]
```

---

## ⚠️ Important Development Notes

* Each project must have **isolated data**
* Pages must not leak across projects
* Slug must be unique per project
* Use caching for performance
* Ensure markdown sanitization

---

# 🎨 UI/UX Guidelines

## 🧠 Design Principles

* Clean and minimal UI
* Fast navigation
* Consistent layout
* Responsive design

---

## 📚 Design References

* Notion
* GitBook
* Confluence

---

## 📸 Screenshots

> Refer to the screenshots below as a base for the dashboard UI. It does not have to be exact. Use it as a reference:

- @context/screenshots/main-dashboard.png
- @context/screenshots/admin-dashboard.png
- @context/screenshots/frontend-homepage.png

```
# Reference
- Attached UI screenshots
- Sidebar navigation design
```

---

## 🧱 Layout Structure

```
| Sidebar (TOC) | Content View |
```

---

## 🎨 Type Colors (CSS Variables)

```css
:root {
  --primary: #4f46e5;
  --secondary: #6b7280;
  --background: #ffffff;
  --text: #111827;
}
```

---

## 🔘 Icon Mapping

* Page → 📄
* Section → 📑
* Project → 📁

---

## 📱 Responsive Behavior

* Sidebar collapses on mobile
* Hamburger menu enabled
* Content takes full width

---

## ✨ Micro-interactions

* Hover effects on sidebar
* Smooth page transitions
* Loading skeletons

---

# 📂 Suggested Project Structure

```
root/
│
├── backend/
│   ├── modules/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── pages/
│   ├── prisma/
│   └── main.ts
│
├── frontend/
│   ├── app/
│   │   ├── [slug]/
│   │   ├── components/
│   │   ├── layout.tsx
│   └── styles/
│
└── docs/
    └── project-overview.md
```

---

# ✅ Final Notes

* Strict project-level isolation is mandatory
* Ensure scalable hierarchy for pages
* Markdown rendering must be secure and optimized

---
