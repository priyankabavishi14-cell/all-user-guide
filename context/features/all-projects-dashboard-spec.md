# 📁 All Projects Dashboard UI Spec

---

# 📌 Overview

The **All Projects Dashboard** is the main landing screen after admin login. It allows administrators to:

* View all created projects
* Create new projects
* Manage existing projects (Edit, Activate/Deactivate, Delete, View)

This page acts as the **central project management hub** for the entire system.

---

# 🎯 Requirements for Phase 1

## 1. Page Layout

### Structure:

```text
| Sidebar | Main Content (Projects + Form) |
```

* Left: Navigation Sidebar
* Center: Project listing
* Right: Add New Project form (or modal)

---

## 2. Top Header

### Components:

* **Logo / Product Name**

  * `AdminConsole`

* **Project Context (Optional)**

  * Shows currently selected project (if any)

* **User Profile (Right)**

  * Name
  * Email
  * Avatar

* **Logout Button**

  * Icon-based action
  * Ends session and redirects to Login page

---

## 3. Left Sidebar

### Sections:

#### 🔄 Switch Project

* Dropdown with placeholder: `Select Project`
* When open: lists all projects (name + status dot); clicking a project navigates to `/admin/[slug]`
* Closes on outside click
* Button below dropdown:

  * `Manage All Projects` — clickable link to `/admin`; highlighted (active state) when on the All Projects Dashboard

---

#### 📊 Management

* Dashboard
* Manage Pages

---

#### 📁 Content

* **Create New Page** (CTA button)

---

### Behavior:

* Sticky sidebar
* Active menu highlight
* Icon + label

---

## 4. Main Content Area

---

## 🧾 4.1 Page Header

* **Title:**

  * `Project Management`

* **Subtitle:**

  * `Create and manage documentation scopes for different product URLs.`

---

## 📋 4.2 All Projects Listing

### Section Title:

* `Existing Projects`

---

### Project Card/List Item

Each project appears as a **card row**.

#### Elements:

* **Project Name**

  * Example:

    * `SellSync Application`
    * `SellSync Website`

* **Project Slug**

  * Example:

    * `sellsync-app.guide`
    * `sellsync-website.guide`

---

### Actions per Project:

1. **View**

   * Opens frontend guide

2. **Edit**

   * Opens project edit form (reuse create form)

3. **Activate / Deactivate**

   * Toggle project status

4. **Delete**

   * Removes project (with confirmation)

---

### Behavior:

* Hover highlight
* Click row → open project dashboard (future enhancement)
* Status indicator (Active / Inactive)

---

## ➕ 4.3 Add New Project

### Trigger Options:

* Button above listing
  **OR**
* Right-side fixed form (as per current UI)

---

### Form Fields:

1. **Project Title**

   * Input text

2. **Unique Slug (URL Prefix)**

   * Example: `sellsync-app`
   * Auto-preview:

     * `sellsync-app.guide`

3. **Description**

   * Textarea

4. **Frontend URL**

   * Example: `project.web.gu`

5. **Backend URL**

   * Example: `project.web.ad`

---

### Action Button:

* **Create Project**

  * Primary gradient button

---

### Behavior:

* On submit:

  * Validate fields
  * Save project
  * Add to listing instantly

---

### Validation Rules:

* Title required
* Slug required & unique
* URLs must be valid format

---

## 🪟 4.4 Modal Behavior (Optional)

If using popup instead of side form:

* Center modal
* Background blur
* Close icon (top-right)
* Same form fields

---

## ⚠️ 4.5 Error Handling

* Inline validation messages
* Duplicate slug error:

  * `Slug already exists`
* API failure message

---

## ✅ 4.6 Success Flow

* Project created successfully:

  * Show success toast
  * Add to list dynamically
  * Reset form

---

# 🎨 UI/UX Specifications

## Colors

```css
:root {
  --primary: #5b5ce2;
  --primary-gradient: linear-gradient(135deg, #5b5ce2, #7c3aed);
  --bg-light: #f9fafb;
  --border: #e5e7eb;
  --text-dark: #111827;
  --text-light: #6b7280;
  --success: #10b981;
  --danger: #ef4444;
}
```

---

## Layout

* Sidebar width: `240px`
* Content padding: `24px – 32px`
* Form width: `350px – 420px`

---

## Components

* Project cards
* Input fields
* Buttons
* Toggle switch
* Modal (optional)

---

## Typography

* Page title: 28px bold
* Section title: 18px
* Body: 14px

---

## Responsive Behavior

### Desktop

* Sidebar fixed
* List + form side-by-side

### Tablet

* Form moves below list

### Mobile

* Single column
* Form as modal

---

## Micro-interactions

* Card hover elevation
* Button hover animation
* Toast notifications
* Smooth form transitions

---

# 🔗 Navigation Flow

```text
All Projects Dashboard
 ├── Create Project → Add to List
 ├── Edit Project → Update Data
 ├── View → Frontend Guide
 ├── Activate/Deactivate → Toggle Status
 └── Delete → Remove Project
```

---

# 📎 References

## UI Reference

* Attached screenshots:

  * Project listing view
  * Add project form (right panel)

## Design Consistency

* Matches:

  * Admin Dashboard
  * Signup/Login UI
  * Frontend Homepage

---

# ⚠️ Important Notes

* Each project must be **fully isolated**
* Slug must be globally unique
* Do not expose inactive projects in frontend
* Ensure fast rendering of project list

---

# ✅ Future Enhancements

* Search & filter projects
* Pagination
* Project analytics
* Bulk actions (delete, activate)
* Role-based project access

---
