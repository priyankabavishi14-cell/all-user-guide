# Small Changes Spec

## Overview
This document defines small UI/UX behavior improvements for both:

- Admin Panel
- View Live Site

The goal is to improve usability, navigation visibility, and user experience during page scrolling and project management.

---

## Requirements for Phase 1

# Admin Panel Changes

---

### 1. Static Header (Sticky Header)

#### Behavior
The top header section must remain fixed while scrolling.

#### Applicable Areas
- Page title section
- Markdown editor toolbar/options

#### Expected Result
- Header remains visible at the top
- User can access editor actions anytime without scrolling back up

#### Example Elements
- Page title
- Save button
- Markdown formatting options:
  - H1–H5
  - Bold
  - Lists
  - Insert Link
  - Upload Image

---

### 2. Static Left Sidebar Menu

#### Behavior
The left navigation menu must remain fixed while page content scrolls.

#### Expected Result
- Sidebar always visible
- Navigation accessible during long page scrolling

#### Applicable Screens
- Dashboard
- Manage Pages
- Create/Edit Page
- User & Permission Management
- All admin pages

---

### 3. Existing Projects - Highlight Change

#### Current Behavior
- "Edit" button currently highlighted

#### Updated Behavior
- "View" button should be highlighted instead of "Edit"

#### Expected Result
- Primary action emphasis shifts to:
  → View Project

#### Applicable Screen
- Manage All Projects
- Existing Projects listing

---

# View Live Site Changes

---

### 4. Static Left Sidebar Menu

#### Behavior
The left documentation navigation menu must remain fixed while content scrolls.

#### Expected Result
- Sidebar navigation always accessible
- Users can quickly switch between pages without scrolling back

#### Applicable Areas
- Documentation live view
- Welcome screen
- Content pages

---

## References

### UI Reference (Based on Existing Design)

#### Admin Panel
- Sticky top header
- Sticky markdown toolbar
- Fixed left sidebar navigation

---

#### Existing Projects Screen
- Highlight:
  - "View" button (primary action)
- Reduce emphasis on:
  - "Edit" button

---

#### Live Site
- Fixed documentation sidebar
- Scroll only main content area

---

## Layout Behavior Reference

### Admin Layout

| Section | Behavior |
|---------|----------|
| Header | Fixed / Sticky |
| Left Sidebar | Fixed |
| Main Content | Scrollable |

---

### Live Site Layout

| Section | Behavior |
|---------|----------|
| Left Sidebar | Fixed |
| Content Area | Scrollable |

---

## Future Enhancements (Out of Scope)

- Collapsible sticky sidebar
- Auto-hide header on scroll
- Resizable sidebar width
- Sticky breadcrumb navigation
- Floating quick action buttons

---