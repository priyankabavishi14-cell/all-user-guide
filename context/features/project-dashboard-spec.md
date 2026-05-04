# 📊 Project Dashboard UI Spec

---

# 📌 Overview

The **Project Dashboard** is a **project-specific admin panel** that opens when:

* Admin clicks **“View”** from *All Projects Dashboard*
  **OR**
* Admin selects a project via **Switch Project**

This dashboard allows admins to:

* View project-level statistics
* Manage guide settings
* Quickly create pages
* Monitor recently updated content

All data shown here is strictly **scoped to the selected project**.

---

# 🎯 Requirements for Phase 1

## 1. Page Layout

### Structure:

```text id="r4k8zm"
| Sidebar | Project Dashboard Content |
```

* Left: Sidebar navigation
* Right: Project-specific dashboard

---

## 2. Top Header

### Components:

* **Logo / Product Name**

  * `AdminConsole`

* **Project Breadcrumb / Name**

  * Example: `SellSync Application`

* **View Live Site Button**

  * Redirect to frontend (`project-frontend-url`)

* **User Profile (Right)**

  * Name
  * Email
  * Avatar

* **Logout Button**

  * Ends session

---

## 3. Left Sidebar

### Sections:

#### 🔄 Switch Project

* Dropdown with current project selected

* Admin can switch projects

* On change:

  * Reload dashboard with selected project data

* Button:

  * `Manage All Projects`

---

#### 📊 Management

* **Dashboard (Active)**
* Manage Pages

---

#### 📁 Content

* **Create New Page (CTA Button)**

---

### Behavior:

* Sticky sidebar
* Active menu highlight
* Icon + label

---

## 4. Main Content Area

---

## 🧾 4.1 Page Header

* **Project Label**

  * Example: `SELLSYNC APPLICATION PROJECT`

* **Title**

  * `System Overview`

* **Description**

  * Example:

    * `Manage documentation for sellsync-app from this console.`

* **Session Info**

  * Example:

    * `Session Active • 6:36:09 PM`

---

## 📊 4.2 Dashboard Cards

### Layout:

* 3-column grid (desktop)

---

### 🧮 Card 1: Total Pages

* Displays:

  * Total number of pages (e.g., `6`)
* Label:

  * `Total Pages`
* Icon included

---

### ⚙️ Card 2: Guide Setup

* Title:

  * `Guide Setup`

* Control:

  * **Welcome Screen Toggle (ON/OFF)**

* Description:

  * Controls whether users see the welcome screen first

---

### ➕ Card 3: Create Page

* Highlighted gradient card

* Title:

  * `Create Page`

* Description:

  * `Add content to your guide.`

* Action:

  * Redirect to Create Page form

---

## 📋 4.3 Recently Updated Pages

### Section Header:

* Title:

  * `Recently Updated Pages`

* Action:

  * `View All →`

---

### Table Structure:

| Column       | Description     |
| ------------ | --------------- |
| Title        | Page name       |
| Description  | Short preview   |
| Parent       | Root / Sub-page |
| Last Updated | Timestamp       |
| Action       | Edit icon       |

---

### Example Data:

* Customer Management
* Sales Person Profile
* Sales Person Order Flow

---

### Behavior:

* Click row → open page editor
* Edit icon → direct edit
* Show max 5–10 recent items

---

## 🔘 4.4 Quick Actions

* Create Page (card + sidebar)
* View All Pages
* Toggle Welcome Screen

---

## ⚠️ 4.5 Error & Empty States

### Empty State:

* If no pages exist:

  * Show message:

    * `No pages created yet`
  * CTA:

    * `Create First Page`

---

### Error Handling:

* API failure → show toast message
* Retry option

---

## ✅ 4.6 Success States

* Page created → reflected in total pages count
* Recently updated list updates dynamically

---

# 🎨 UI/UX Specifications

## Colors

```css id="z8u2pe"
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

* Sidebar width: `240px`
* Content padding: `24px – 32px`
* Card gap: `20px`

---

## Typography

* Page title: `28px` bold
* Section title: `18px`
* Body: `14px`

---

## Components

* Cards (stats + CTA)
* Toggle switch
* Data table
* Buttons

---

## Responsive Behavior

### Desktop

* 3-column cards
* Full sidebar

### Tablet

* 2-column cards

### Mobile

* Single column
* Sidebar collapsible

---

## Micro-interactions

* Card hover elevation
* Toggle animation
* Button hover effects
* Table row hover highlight

---

# 🔗 Navigation Flow

```text id="k7n2lp"
All Projects
   ↓
Select / View Project
   ↓
Project Dashboard
   ├── Manage Pages
   ├── Create Page
   └── View Live Site
```

---

# 📎 References

## UI Reference

* Attached project dashboard screenshot

## Design Consistency

* Matches:

  * All Projects Dashboard
  * Admin Dashboard
  * Frontend Homepage

---

# ⚠️ Important Notes

* All data must be **project-specific**
* Ensure fast loading of dashboard stats
* Keep UI consistent across all admin screens
* Welcome screen toggle must reflect on frontend immediately

---

# ✅ Future Enhancements

* Analytics (page views, usage)
* Activity logs
* Draft vs Published states
* Role-based access control

---
