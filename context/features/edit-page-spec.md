# Edit Page Spec

## Overview
The **Edit Page** feature allows admins and editors to modify existing documentation pages. It provides a structured interface to update page content, metadata, hierarchy, and formatting using the Markdown Editor.

This feature ensures that content can be easily maintained and updated while preserving page structure and relationships.

---

## Requirements for Phase 1

### 1. Accessing Edit Page

#### A. Entry Points
- From **Manage Pages → Actions → Edit**
- From page listing row (Edit icon/button)

#### B. Behavior
- Open **Edit Page screen**
- Pre-fill all existing page data

---

### 2. Page Layout Structure

#### A. Header Section
- Page Title: **Edit Page**
- Breadcrumb (optional): Manage Pages > Page > Edit Page
- Action Buttons:
    - **Save / Update**
    - **Cancel / Back**

---

#### B. Form Sections

### 3. Page Details Form

#### A. Basic Information

| Field | Type | Description |
|------|------|------------|
| Page Title | Text Input | Name of the page |
| Description | Textarea | Short summary |
| Slug (ID) | Text Input | Unique URL identifier |

---

#### B. Slug Rules
- Auto-generated from title (editable)
- Must be unique
- Format:
- Lowercase
- Hyphen-separated

Example: sales-person-order-flow

---

### 4. Page Hierarchy

#### A. Parent Page Selection
- Dropdown or tree selector
- Allows assigning parent page

#### B. Behavior
- If parent selected:
  - Page becomes child
- If no parent:
  - Page is top-level

---

### 5. Sequence / Ordering

- Field: **Sequence Number (Seq)**
- Determines display order
- Numeric input

#### Behavior:
- Lower number → higher priority
- Used in sidebar and listing

---

### 6. Markdown Editor (Content Section)

#### A. Editor Layout
- Split screen:
  - Left → Markdown input
  - Right → Live preview

#### B. Supported Features
- Headings (H1–H5)
- Text styles (bold, italic, etc.)
- Lists (bullet, numbered, checkbox)
- Insert link (internal/external)
- Image upload with preview

---

#### C. Content Behavior
- Load existing content on edit
- Allow full modification
- Real-time preview updates

---

### 7. Save / Update Functionality

#### A. On Click "Update"
- Validate all required fields
- Save updated data
- Show success message

#### B. Redirect
- Back to Manage Pages list OR
- Stay on page (based on UX decision)

---

### 8. Validation Rules

- Title is required
- Slug must be unique
- Sequence must be numeric
- Content should not be empty (optional rule)

---

### 9. Behavior Rules

- Maintain existing hierarchy if unchanged
- Update timestamps on save
- Preserve page ID
- Reflect changes immediately in:
  - Manage Pages
  - Live Site

---

### 10. Cancel Behavior

- Discard unsaved changes
- Navigate back to Manage Pages

---

### 11. Error Handling

- Duplicate slug → show error
- Missing required fields → validation message
- Save failure → retry option

---

### 12. Security

- Only authorized users can edit:
  - Admin
  - Editor
- Validate permissions before allowing update

---

### 13. Responsiveness

- Desktop:
  - Full split editor view

- Mobile/Tablet:
  - Stacked layout
  - Toggle between editor and preview

---

## References

### UI Reference (Expected Based on Design)

#### Manage Pages → Edit Action
- Click edit icon from table row

---

#### Edit Page Layout

##### Form Fields:
- Title
- Description
- Slug
- Parent Page
- Sequence

---

##### Editor Section:
- Toolbar with:
  - Headings
  - Text styles
  - Lists
  - Image upload
  - Insert link

---

##### Preview Panel:
- Live rendering of markdown

---

### Data Flow

1. User clicks Edit  
2. Page data loads  
3. User updates content  
4. Clicks Save  
5. Data updates in system  
6. Changes reflect in Live Site  

---

