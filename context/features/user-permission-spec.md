# User & Permission Management Spec

## Overview
The **User & Permission Management** module controls access to documentation based on user roles and page-level permissions.

The goal is to ensure:
- Some users can **view all pages**
- Some users can **view only selected pages**
- Admins can **manage users and assign permissions easily**

This module applies to both:
- **Admin Console (management side)**
- **Live Site (user access control)**

---

## Requirements for Phase 1

### 1. User Roles

Define basic roles:

| Role | Description |
|------|------------|
| Admin | Full access (create, edit, delete, manage users & permissions) |
| Editor | Can create/edit pages but limited permission control |
| Viewer | Can only view assigned pages |

---

### 2. User Management

#### A. Add User
- Fields:
  - Name
  - Email
  - Role (Admin / Editor / Viewer)

#### B. Edit User
- Update role
- Update assigned pages

#### C. Delete User
- Remove user access
- Confirmation required

---

### 3. Permission Types

#### A. Full Access
- User can view **all pages** in the project

#### B. Restricted Access
- User can view **only selected pages**

---

### 4. Page-Level Permissions

#### A. Assign Pages to User
- Multi-select list of pages
- Support hierarchy view

#### B. Behavior
- If parent page selected:
  - Option to auto-include child pages
- If only child selected:
  - Parent visibility handled (optional breadcrumb only)

---

### 5. Access Control (Live Site)

#### A. When User Logs In:

| Condition | Behavior |
|----------|---------|
| Full access | Show all pages |
| Restricted access | Show only assigned pages |

---

#### B. Sidebar Visibility
- Display only permitted pages
- Hide restricted pages completely

---

#### C. Direct URL Access
- If user tries to access restricted page:
  - Show **Access Denied** message OR redirect

---

### 6. Admin UI (Permission Assignment)

#### A. User Form
- Role selection
- Permission type:
  - Full Access
  - Custom (Selected Pages)

#### B. Page Selector
- Tree structure (hierarchy)
- Checkbox-based selection

Example:
Sales Person
[✔] Sales Person Order Flow
[ ] Sales Person Profile

---

### 7. Behavior Rules

- Admin always has full access
- Prevent user without access from viewing content
- Changes in permission reflect immediately (or after refresh)
- Ensure at least one access type is selected

---

### 8. Edge Cases

- If no pages assigned:
  - Show empty state or message
- If assigned page is deleted:
  - Remove from user permissions automatically
- If parent deleted:
  - Handle child permissions accordingly

---

### 9. Security

- Enforce permission check at:
  - Frontend (UI visibility)
  - Backend (API validation) ← mandatory
- Prevent unauthorized API access

---

### 10. Responsiveness

- Permission UI (checkbox tree) should:
  - Work on desktop and tablet
  - Be scrollable for large page lists

---

## References

### UI Reference (Expected)

#### Admin Side:
- User list table
- Add/Edit user form
- Page selection tree with checkboxes

---

#### Live Site:
- Sidebar shows only allowed pages
- Hidden pages are not visible
- Access denied handling

---

### Example Scenarios

#### Scenario 1: Full Access User
- User sees all pages:
  - Login
  - Product Management
  - Sales Person
  - etc.

---

#### Scenario 2: Restricted User
- User sees only:
  - Sales Person Order Flow
  - Customer Management

---

#### Scenario 3: Unauthorized Access
- User opens restricted URL:
  - Show "You do not have access" message

---

### Future Enhancements (Out of Scope)

- Role-based granular permissions (CRUD per page)
- Group-based permissions
- Permission inheritance rules
- Audit logs (who accessed what)
- Temporary access / expiry
- SSO integration

---