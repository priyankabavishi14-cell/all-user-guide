# View Live Site Page Spec

## Overview
The **View Live Site** page represents the end-user facing documentation portal where published guide content is displayed. It allows users to navigate through structured documentation using a sidebar and view content in a clean, readable format.

This page is designed for **read-only access**, focusing on usability, navigation, and content clarity.

---

## Requirements for Phase 1

### 1. Layout Structure

#### A. Top Header
- Display application branding (e.g., GuideManager)
- Show current project name (e.g., SellSync Application)
- Minimal and clean design (no admin controls)

---

#### B. Sidebar Navigation

- Display list of all available pages
- Support hierarchical structure:
  - Parent pages
  - Child pages (indented)

**Example Structure:**
Product Management
Sales Person
├── Sales Person Order Flow
├── Sales Person Profile

---

#### C. Main Content Area

- Center-aligned content display
- Default landing state includes:
  - Welcome icon/illustration
  - Title:
    **Welcome to the SellSync Application Guide**
  - Subtitle:
    "SellSync Application User Guide"
  - Info card:
    - Title: "Getting Started"
    - Description: "Use the sidebar on the left to navigate through the available documentation pages."

---

### 2. Navigation Behavior

- Clicking on a sidebar item:
  - Loads corresponding page content
  - Highlights active item

- For parent items:
  - Expand/collapse child items

- Maintain navigation state during browsing

---

### 3. Content Rendering

- Render content created in Markdown editor
- Support:
  - Headings (H1–H5)
  - Text styles (bold, italic, etc.)
  - Lists (bullet, numbered, checkbox)
  - Code blocks and inline code
  - Quotes

- Ensure clean typography and spacing

---

### 4. Default State

When no page is selected:
- Show welcome screen
- Guide users with "Getting Started" card

---

### 5. Responsiveness

- Desktop:
  - Sidebar fixed on left
  - Content centered

- Tablet/Mobile:
  - Sidebar collapsible (hamburger menu)
  - Content takes full width

---

### 6. Behavior Rules

- Read-only mode (no edit/delete options)
- Fast page load and smooth transitions
- Maintain scroll position per page (optional enhancement)
- Handle empty or missing content gracefully

---

### 7. Accessibility

- Proper contrast for readability
- Keyboard navigation support
- Focus states for sidebar items

---

## References

### UI Reference (Based on Provided Design)

#### Header
- Logo: GuideManager
- Project name: SellSync Application

---

#### Sidebar
- Vertical navigation menu
- Page list with hierarchy
- Active item highlight
- Indented child pages

---

#### Main Content
- Centered welcome message
- Icon above title
- Title:
  "Welcome to the SellSync Application Guide"
- Subtitle:
  "SellSync Application User Guide"
- Info card:
  - "Getting Started"
  - Instructional text

---

### Content Rendering Reference

- Markdown-based rendering
- Styled output:
  - Headings with hierarchy
  - Lists with proper spacing
  - Code blocks with background
  - Quote blocks with left border

---

### Future Enhancements (Out of Scope for Phase 1)

- Search within documentation
- Table of contents (auto-generated)
- Breadcrumb navigation
- Dark/light mode toggle
- Page feedback (like/dislike)
- Print/download (PDF)
- Versioned documentation

---