# Manage Pages - Small Changes Spec

## Overview
This document defines minor but important behavior updates for the **Manage Pages** module to improve default usability and navigation flow.

---

## Requirements for Phase 1

### 1. Default Hierarchy View

#### Behavior:
- **"Hierarchy View" must be selected by default**
- Every time user opens **Manage Pages screen**:
  - Data should be displayed in **hierarchical structure**
  - Parent-child relationship must be visible

#### Rules:
- Do not persist last selected view
- Always reset to **Hierarchy View on page load**
- Expand/collapse behavior remains functional

---

### 2. Create Page Redirect Flow

#### Current Action:
- User creates a new page

#### Updated Behavior:
- After clicking **"Save Changes"**:
  - System should **redirect to Manage Pages screen**

#### Expected Flow:
1. User clicks **Create New Page**
2. Fills page details
3. Clicks **Save Changes**
4. Page is created successfully
5. User is redirected to:
   → **Manage Pages (Content Inventory screen)**

---

### 3. Post-Redirect Behavior

- Newly created page should:
  - Appear in the list immediately
  - Follow hierarchy rules (based on parent selection)
  - Be visible in correct sequence position

---

### 4. Success Feedback

- Show success message:
  - Example: **"Page created successfully"**
- Message can be:
  - Toast notification OR inline alert

---

## References

### UI Behavior Reference

#### Manage Pages Screen:
- Default:
  - **Hierarchy View active**
- Table shows:
  - Nested pages
  - Expandable structure

---

#### Create Page Flow:
- Button: **Create New Page**
- After save:
  - Redirect back to listing screen
  - Updated data visible immediately

---

### Future Enhancements (Out of Scope)

- Remember user preferred view (Grid/List/Hierarchy)
- Redirect to Edit Page instead of listing (optional setting)
- Highlight newly created page in list
- Auto-scroll to newly created page

---

### 5. Icon Picker (Add / Edit Page)

#### Behavior:
- Replace the free-text Icon input with a **visual icon picker**
- Icons sourced from `public/icons/` SVG files
- Available icons: `location`, `sales`, `user`

#### UI:
- Button showing the currently selected icon (or a placeholder if none)
- Click opens a small popover grid with all available SVG icons
- Each icon displayed as the SVG image with its name label below
- Clicking an icon selects it, closes the popover, stores the icon name (filename without `.svg`)
- A "None" option to clear the icon

#### Rendering:
- In Manage Pages table and Frontend Sidebar: if icon value matches a known SVG name render `<img src="/icons/{name}.svg" />`; otherwise fall back to rendering as emoji text
- Selected icon stored as the filename without extension (e.g. `location`, `sales`, `user`)

---