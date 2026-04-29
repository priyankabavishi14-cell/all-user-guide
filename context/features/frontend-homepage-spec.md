# 🌐 Frontend Homepage UI Spec

---

# 📌 Overview

The **Frontend Homepage** is the default landing screen for end users accessing a project’s user guide.

It is designed to:

* Welcome users to the documentation
* Provide a clear starting point
* Enable easy navigation through a structured sidebar
* Display content dynamically from backend-managed pages

This page acts as the **“Welcome Screen”**, which can be toggled ON/OFF from the admin dashboard.

---

# 🎯 Requirements for Phase 1

## 1. Top Header

### Components:

* **Logo / Product Name**

  * `GuideManager`

* **Project Name Badge**

  * Example: `SellSync Website`
  * Indicates current project context

---

## 2. Left Sidebar (Table of Contents)

### Purpose:

* Display hierarchical navigation of all pages

---

### Structure:

* Root Pages
* Nested Sub-pages (indented)

---

### Example:

```
Introduction
Locations
  └── Manage Locations
```

---

### Behavior:

* Active page highlight
* Expand/collapse (future enhancement)
* Scrollable if long list
* Clicking item:

  * Loads content in main area

---

## 3. Main Content Area

---

## 🏠 3.1 Welcome Section

### Center-Aligned Layout

#### 📘 Icon

* Book / documentation icon

---

#### 🧾 Title

* Example:

  * `Welcome to the SellSync Website Guide`

---

#### 📄 Subtitle

* Example:

  * `Sellsync Website User Guide`

---

---

## 📦 3.2 Getting Started Card

### Card Content:

* **Title:** `Getting Started`
* **Description:**

  * "Use the sidebar on the left to navigate through the available documentation pages."

---

### Design:

* Rounded card
* Light shadow
* Center aligned

---

# 🎨 UI/UX Specifications

## Colors

```css id="d7pnk1"
:root {
  --primary: #5b5ce2;
  --bg-light: #f9fafb;
  --text-dark: #111827;
  --text-light: #6b7280;
  --border: #e5e7eb;
}
```

---

## Layout

```text id="c2r8jk"
| Sidebar | Content Area |
```

---

## Spacing

* Sidebar width: `240px`
* Content padding: `40px`
* Section gap: `24px`

---

## Typography

* Title: 28px–36px bold
* Subtitle: 16px–18px
* Body: 14px–16px

---

## Components

* Sidebar navigation
* Content container
* Info card
* Icon block

---

## Responsive Behavior

### Desktop

* Sidebar fixed
* Content centered

### Tablet

* Sidebar narrower
* Content adjusts

### Mobile

* Sidebar collapsible (hamburger menu)
* Full-width content

---

## Micro-interactions

* Sidebar hover highlight
* Smooth content transition
* Subtle card hover effect

---

# 🔗 Navigation Flow

```text id="r9a2xz"
Homepage (Welcome)
 ├── Sidebar क्लिक → Load Page Content
 └── Default → Welcome Screen
```

---

# 📎 References

## UI Reference

* Attached frontend homepage screenshot

## Design Inspiration

* Notion Docs
* GitBook
* Confluence

---

# ⚠️ Important Notes

* Content must be **fetched dynamically from backend**
* Ensure **project-based data isolation**
* Sidebar structure must reflect **page hierarchy**
* Welcome screen controlled via admin setting

---

# ✅ Future Enhancements

* Search within documentation
* Breadcrumb navigation
* Dark mode
* Page feedback (helpful / not helpful)

---
