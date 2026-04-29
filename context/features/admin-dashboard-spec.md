# 🛠️ Admin Dashboard UI Spec

---

# 📌 Overview

The **Admin Dashboard** is the central control panel for managing a specific project’s user guide.

It enables admins to:

* View project-level statistics
* Manage pages and content
* Control guide settings
* Quickly create new pages

This dashboard is **project-scoped**, meaning all data shown belongs to the currently selected project.

---

# 🎯 Requirements for Phase 1

## 1. Top Header

### Components:

* **Logo / Product Name**

  * `AdminConsole`

* **Project Breadcrumb**

  * Example:

    * `SellSync Website`

* **View Live Site Button**

  * Redirect to frontend URL

* **User Profile (Right)**

  * Name
  * Email
  * Avatar
  * Logout option

---

## 2. Left Sidebar

### Sections:

#### 🔄 Switch Project

* Dropdown to select project

* Shows current project name

* Action:

  * Switching project requires re-authentication

* Button:

  * `Manage All Projects`

---

#### 📊 Management

* Dashboard (Active)
* Manage Pages

---

#### 📁 Content

* **Create New Page (CTA)**

  * Primary highlighted button

---

### Behavior:

* Sticky sidebar
* Active menu highlight
* Icons for each item

---

## 3. Main Content Area

---

## 🧾 3.1 Page Header

* **Project Label**

  * Small uppercase text

* **Title**

  * `System Overview`

* **Description**

  * Example:

    * Manage documentation for selected project

* **Session Info**

  * Example:

    * `Session Active • 12:25 PM`

---

## 📊 3.2 Stats & Actions Cards

### Grid Layout (3 Cards)

---

### 🧮 Card 1: Total Pages

* Count display (e.g., `3`)
* Label: `Total Pages`
* Icon

---

### ⚙️ Card 2: Guide Setup

* Section Title: `Guide Setup`
* Toggle:

  * **Welcome Screen ON/OFF**
* Description:

  * Controls default landing experience

---

### ➕ Card 3: Create Page

* CTA Card (highlighted)
* Label: `Create Page`
* Description:

  * Add content to your guide
* Action:

  * Redirect to create page form

---

## 📋 3.3 Recently Updated Pages

### Section Header:

* Title: `Recently Updated Pages`
* Action: `View All →`

---

### Table Structure:

| Column       | Description     |
| ------------ | --------------- |
| Title        | Page title      |
| Parent       | Root / Sub-page |
| Last Updated | Timestamp       |
| Action       | Edit icon       |

---

### Example Rows:

* Introduction (Root)
* Manage Locations (Sub-page)
* Locations (Root)

---

### Behavior:

* Click row → open edit page
* Edit icon → direct edit
* Sorting (future)
* Pagination (future)

---

# 🎨 UI/UX Specifications

## Colors

```css id="p4cxae"
:root {
  --primary: #5b5ce2;
  --primary-gradient: linear-gradient(135deg, #5b5ce2, #7c3aed);
  --bg-light: #f9fafb;
  --border: #e5e7eb;
  --text-dark: #111827;
  --text-light: #6b7280;
}
```

---

## Layout

```text id="r7xg1f"
| Sidebar | Main Content |
```

---

## Spacing

* Sidebar width: `240px`
* Card padding: `20px`
* Section spacing: `24px`

---

## Typography

* Title: 24px–32px bold
* Card title: 16px–18px
* Body text: 14px

---

## Components

* Cards (rounded, shadow)
* Toggle switch
* Table with hover state
* Buttons (primary, secondary)

---

## Responsive Behavior

### Desktop

* Sidebar fixed
* 3-column cards

### Tablet

* 2-column cards

### Mobile

* Sidebar collapsible
* Cards stacked
* Table scrollable

---

## Micro-interactions

* Toggle animation
* Card hover elevation
* Button ripple/hover
* Smooth transitions

---

# 🔗 Navigation Flow

```text id="i9w2m1"
Dashboard
 ├── Manage Pages → Page List
 ├── Create Page → Editor Form
 └── View Live Site → Frontend
```

---

# 📎 References

## UI Reference

* Attached Admin Dashboard screenshot

## Design Inspiration

* Notion
* Linear
* Stripe Dashboard

---

# ⚠️ Important Notes

* All data must be **project-specific**
* Switching project requires **re-authentication**
* Ensure **fast loading for dashboard stats**
* Maintain **consistent design system**

---

# ✅ Future Enhancements

* Analytics (page views)
* Draft vs Published status
* Role-based access
* Activity logs

---
