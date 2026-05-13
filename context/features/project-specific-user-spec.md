# Project Specific Users Spec

## Overview

This document defines the required changes and fixes for project specific users access, user listing updates, login functionality, and assigned project permission flow.
The main purpose is to ensure created project users can login successfully, view only assigned projects, and access modules based on assigned permissions without requiring manual page refresh.

Reference of current project design no other changes.

---

## Requirements for phase 1

### 1. User Listing Refresh Issue Fix

#### Existing Issue

* Add new user successfully
* Newly created user not showing immediately in users listing
* Admin must refresh page manually
* After refresh created user showing

### Required Changes

* Newly created user should display immediately in users listing
* No manual refresh required
* Real-time listing update after:

  * Create user
  * Update user
  * Delete user
* Proper success message should display

---

## 2. Project Specific User Login

### Features

* Created project manager users should login successfully
* Login using:

  * Email
  * Password
* Authentication should work properly for:

  * Admin User
  * Normal User
* Invalid login issue should fix

---

## 3. User Login Default Flow

### Features

1. User login successfully
2. First page open:

   * "Project Management" page
3. Show only assigned project
4. Other projects should not display
5. Assigned permissions should apply properly

---

## 4. Project Access Permission Flow

### Features

* User can open assigned project
* Existing project flow remains same
* Modules and pages should display according to assigned permissions only

### Permission Based Access Example

#### Allowed Permissions

* Dashboard
* Manage Pages
* Manage Users
* View Pages
* Edit Pages

#### Restricted Permissions

* Hidden modules should not display
* User cannot access restricted pages directly using URL

---

## Project Specific Access Rules

### Admin User

* Access only assigned project
* Full project access based on assigned permission
* Can manage allowed modules

### Normal User

* Access only assigned project
* Restricted module access
* Only allowed permissions visible

---

---

## 5. Restricted Access — Normal User Behavior (Phase 2)

### Context

User created with:
* Role: Normal User
* Access Type: Restricted
* Specific pages assigned (e.g. 2 pages only)

### 5.1 Dashboard — Allowed Pages Only

* "Recently Updated Pages" table must show **only the pages the user has access to**
* Pages not in the user's allowed list must not appear
* Total Pages count card must reflect only the allowed page count
* Behavior applies when: role = Normal User AND access type = Restricted

### 5.2 Manage Users — Visible but Filtered

* "Manage Users" sidebar option **must be visible** to restricted-access Normal Users
* When the user opens Manage Users, the listing shows **only Normal User role users**
* Admin User role users must **not** appear in the list for a restricted Normal User
* Behavior applies when: role = Normal User (viewer role)

---

## Notes

1. Existing project design and layout no changes.
2. Only requested functionality changes required.
3. Assigned project permission should work properly for all users.
4. Unauthorized modules/pages should not display.
5. User access should fully depend on assigned role and permissions.

---

## References

* Existing Admin Console design
* Current Manage Users module
* Current Project Management page
* Existing Login module
* Existing permission management flow
