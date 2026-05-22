# 📝 Create New Page UI Spec

---

# 📌 Overview

The **Create New Page** screen allows admins to create and manage documentation pages within a selected project.

This page opens when admin clicks:

* **Create New Page** (sidebar)
* **Create Page** (dashboard card)
* **Create First Page** (empty state)

By default, a new page is opened as:

* `Untitled Page`

The screen includes:

* Page metadata form (left panel)
* Markdown editor (center)
* Live preview (right panel)

---

# 🎯 Requirements for Phase 1

## 1. Page Layout

### Structure:

```text id="x3m9kd"
| Metadata Panel | Markdown Editor | Preview Panel |
```

---

## 2. Top Header

### Components:

* **Back Button**

  * Navigate to Project Dashboard

* **Project Name**

  * Example: `SELLSYNC APPLICATION`

* **Page Title (Dynamic)**

  * Default: `Untitled Page`
  * Updates based on input

---

### Right Side Controls:

* **View Modes Toggle**

  * Editor
  * Preview
  * Split (Default recommended)

* **Save Changes Button**

  * Primary gradient button
  * Saves page

---

## 3. Left Panel (Metadata Form)

---

### 🧾 Fields:

#### 1. Page Title

* Input text
* Placeholder:

  * `e.g. Getting Started`

---

#### 2. Sequence

* Numeric input
* Default: `0`
* Controls page ordering

---

#### 3. Icon

* Icon selector button
* Opens icon picker (future enhancement)

---

#### 4. Parent Page

* Dropdown
* Default:

  * `No Parent (Root)`
* Displays existing pages for hierarchy

---

#### 5. Short Description

* Textarea
* Used in listing preview

---

---

### 💡 Markdown Tip Box

* Informational card
* Content:

  * `Use # for Header 1, ## for Header 2, and [Title](URL) for links.`

---

## 4. Center Panel (Markdown Editor)

---

### Editor Features:

* Text editor for writing markdown
* Placeholder:

  ```
  # Start writing your awesome guide content here...
  ```

---

### Supported Markdown:

* Headings (`#`, `##`, `###`)
* Lists (ordered/unordered)
* Links `[text](url)`
* Bold / Italic
* Code blocks
* Images (future)

---

### Behavior:

* Auto-save draft (optional future)
* Sync with preview in real-time (Split mode)

---

## 5. Right Panel (Rendered Preview)

---

### Preview States:

#### 1. Empty State

* Message:

  * `Nothing to preview`

---

#### 2. Rendered Content

* Displays formatted markdown
* Updates live in Split mode

---

## 6. View Modes

---

### 1. Editor Mode

* Only markdown editor visible

---

### 2. Preview Mode

* Only rendered content visible

---

### 3. Split Mode (Default)

* Editor (left) + Preview (right)

---

### Behavior:

* Toggle instantly switches layout
* In Split mode:

  * Live rendering enabled

---

## 7. Save Functionality

---

### Save Changes Button

* Action:

  * Validate form
  * Save page data

---

### Validation Rules:

* Page title required
* Content optional (but recommended)

---

### On Save:

* Success:

  * Show toast message
  * Redirect OR stay on page

* Failure:

  * Show error message

---

## ⚠️ 8. Error Handling

* Empty title → inline error
* API failure → global error toast

---

## ✅ 9. Success States

* Page created successfully
* Appears in:

  * Project Dashboard (recent updates)
  * Manage Pages list
  * Sidebar (frontend)

---

# 🎨 UI/UX Specifications

## Colors

```css id="m7k2sx"
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

* Left panel: `260px`
* Editor: flexible width
* Preview: flexible width

---

## Typography

* Labels: 12px–14px
* Input text: 14px
* Editor font: monospace

---

## Components

* Form inputs
* Markdown editor
* Preview renderer
* Toggle buttons
* Action button

---

## Responsive Behavior

### Desktop

* 3-column layout

### Tablet

* Editor + Preview stacked
* Metadata collapsible

### Mobile

* Single view (toggle between sections)

---

## Micro-interactions

* Live preview rendering
* Button hover effects
* Smooth layout transitions
* Input focus highlight

---

# 🔗 Navigation Flow

```text id="c9l1pz"
Project Dashboard
   ↓
Create New Page
   ↓
Fill Data + Write Content
   ↓
Save Changes
   ↓
Page Added to Project
```

---

# 📎 References

## UI Reference

* Attached Create Page screen

## Design Consistency

* Matches:

  * Project Dashboard
  * Admin Dashboard
  * All Projects Dashboard

---

# ⚠️ Important Notes

* Content must be stored as **Markdown**
* Ensure safe rendering (sanitize HTML)
* Maintain **page hierarchy**
* Sequence must control ordering properly

---

# ✅ Future Enhancements

* Image upload in markdown
* Drag-drop page hierarchy
* Auto-save drafts
* Version history
* Rich text editor (optional alternative)

---
