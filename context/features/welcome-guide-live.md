# Live Guide Welcome Page Spec

## Overview
The **Live Guide Welcome Page** is the default landing experience for end-users accessing the documentation portal. It provides an introduction to the project and guides users on how to navigate the available content.

This page is **configurable by admin** and supports dynamic content based on the selected project.

A **toggle control (Guide Setup → Welcome Screen)** determines whether:
- Users see the Welcome Page (ON)
- OR are redirected to the first documentation page (OFF)

---

## Requirements for Phase 1

### 1. Welcome Screen Toggle (Admin Control)

#### Location:
- Guide Setup → Project Control

#### Behavior:

| Toggle State | Behavior |
|-------------|--------|
| ON | Show Welcome Page as default landing |
| OFF | Redirect user to first available page |

#### Rules:
- Default state: ON (recommended)
- If OFF:
  - System auto-loads first page based on sequence
- Toggle state should be saved per project

---

### 2. Layout Structure (Live Site)

#### A. Header
- Logo: GuideManager
- Project Name (dynamic)

---

#### B. Sidebar
- List of all documentation pages
- Supports hierarchy (parent-child)
- Active state highlighting

---

#### C. Main Content Area (Welcome Page)

When toggle = ON:

Display centered content:

##### 1. Icon / Illustration
- Default icon (book/help style)
- Optional: customizable (future scope)

---

##### 2. Title (Dynamic)
- Example:
  **Welcome to the SellSync Application Guide**

- Editable by admin

---

##### 3. Subtitle (Dynamic)
- Example:
  *SellSync Application User Guide*

- Editable by admin

---

##### 4. Info Card (Getting Started Section)

- Card Title: "Getting Started"
- Description:
  "Use the sidebar on the left to navigate through the available documentation pages."

- Fully editable by admin

---

### 3. Admin Configuration (Dynamic Welcome Page)

Admin should be able to configure:

| Field | Type | Description |
|------|------|------------|
| Welcome Title | Text | Main heading |
| Subtitle | Text | Supporting text |
| Info Card Title | Text | Section title |
| Info Card Description | Text | Instructional content |
| Icon (optional) | Upload / Select | Visual representation |

---

### 4. Default Behavior

#### A. When Toggle = ON
- Show Welcome Page
- No page selected in sidebar by default

#### B. When Toggle = OFF
- Auto-redirect to:
  - First page based on sequence (Seq = 1)
- Highlight that page in sidebar

---

### 5. Navigation Behavior

- Sidebar always visible
- Clicking any page:
  - Replaces welcome content with actual page content
- No reload required (SPA behavior preferred)

---

### 6. Behavior Rules

- Welcome content must be project-specific
- Changes made by admin reflect instantly (or after publish)
- Handle empty states:
  - If no pages exist → show message
- Fallback content if fields are empty

---

### 7. Responsiveness

- Desktop:
  - Sidebar fixed
  - Centered welcome content

- Mobile:
  - Sidebar collapsible
  - Content full width

---

### 8. Accessibility

- Proper heading hierarchy (H1 for title)
- Readable contrast
- Keyboard navigation support

---

## References

### UI Reference (Based on Provided Design)

#### Guide Setup (Admin)
- "Welcome Screen" toggle switch
- Description:
  "Visitors will be redirected to the first documentation page automatically." (when OFF)

---

#### Live Site Layout

##### Sidebar:
- Pages:
  - Login & Forgot Password
  - Product Management
  - Sales Person
    - Sales Person Order Flow
    - Sales Person Profile
  - Customer Management

---

##### Welcome Content:
- Center aligned
- Icon above title
- Title:
  "Welcome to the SellSync Application Guide"
- Subtitle:
  "SellSync Application User Guide"

---

##### Info Card:
- Title: "Getting Started"
- Description:
  "Use the sidebar on the left to navigate through the available documentation pages."

---
