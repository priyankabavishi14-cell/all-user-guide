# Manage Pages Spec

## Overview
The **Manage Pages** module allows administrators to view, organize, and manage all content pages within the application. It provides a centralized interface to handle page hierarchy, search, sorting, and actions such as creating, editing, and deleting pages.

The interface is designed with a clean **admin dashboard layout**, ensuring easy navigation and efficient content management.

---

## Requirements for Phase 1

### 1. Layout Structure

#### A. Top Header
- Display application name (e.g., Admin Console)
- Show current project name (e.g., SellSync Application)
- Include:
  - "View Live Site" button
  - User profile section (name, email, avatar, logout)

---

#### B. Sidebar Navigation

**Sections:**
- Switch Project dropdown
- Manage All Projects button

**Menu Items:**
- Dashboard
- Manage Pages (active state)
- Create New Page (CTA button)

---

#### C. Main Content Area

##### Page Title Section
- Title: **Manage Pages**
- Subtitle: "Manage, sort, and organize all your guide pages."
- Primary CTA: **Create Page** button

---

### 2. Search & Controls

#### A. Search Bar
- Placeholder: "Search by title or description..."
- Should filter results dynamically

#### B. View Controls
- "Hierarchy View" toggle/button
- Display total rows count (e.g., "6 rows")

---

### 3. Pages Listing Table

#### Columns:

| Column Name | Description |
|------------|------------|
| Title | Page title with short description |
| Seq | Sequence/order number |
| ID / Parent | Unique page slug and parent reference |
| Updated | Last updated timestamp |
| Actions | Edit / Delete / More options |

---

### 4. Page Hierarchy

- Support **parent-child relationships**
- Parent pages expandable/collapsible
- Child pages indented under parent

Example: 
Sales Person
├── Sales Person Order Flow
├── Sales Person Profile
└── Customer Management

---

### 5. Page Details Display

#### A. Title Column
- Page title (bold)
- Short description (light text below)

#### B. Sequence (Seq)
- Numeric order indicator
- Used for sorting/display order

#### C. ID / Parent
- Show slug (e.g., `sales-person`)
- If child:
  - Display parent reference below

#### D. Updated
- Format: Time + Date (e.g., "2:18 PM, Apr 24")

---

### 6. Actions

Each row should include:
- Edit page
- Delete page
- Additional options (optional dropdown)

---

### 7. Functionality Behavior

#### A. Create Page
- Redirect to "Add New Page" screen

#### B. Edit Page
- Open existing page in editor

#### C. Delete Page
- Show confirmation before deletion

#### D. Hierarchy Toggle
- Expand/collapse child pages

#### E. Sorting
- Sort by sequence (ascending/descending)

---

### 8. Behavior Rules

- Maintain hierarchy structure during sorting
- Prevent deletion of parent without handling children
- Ensure unique page slug (ID)
- Preserve sequence order integrity

---

### 9. Responsive Design

- Sidebar collapses on smaller screens
- Table becomes scrollable horizontally
- Actions accessible via dropdown on mobile

---

## References

### UI Reference (Based on Provided Design)

#### Header
- Admin Console branding
- Project selection (SellSync Application)
- "View Live Site" button
- User info (name, email, avatar)

---

#### Sidebar
- Dashboard
- Manage Pages (selected)
- Create New Page button (highlighted)

---

#### Main Section
- Title: **Content Inventory**
- Search bar with icon
- "Hierarchy View" button
- Row count display

---

#### Table View
- Clean card-style table
- Rows with:
  - Title + description
  - Sequence number badge
  - Slug (highlighted)
  - Parent reference (if applicable)
  - Timestamp
- Expandable hierarchy (dropdown arrow)

---

### Future Enhancements (Out of Scope for Phase 1)

- Drag-and-drop page reordering
- Bulk actions (delete, move)
- Advanced filters (date, status)
- Pagination support
- Version history tracking
- Role-based access control
- Inline editing for quick updates

---