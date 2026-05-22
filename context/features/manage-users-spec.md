# Manage Users Spec

## Overview

This document defines the Manage Users module changes for Super Admin, Admin User, and Normal User access management.
The module allows Super Admin to create project-specific users, assign roles and access permissions, and manage user visibility based on selected project permissions.

Reference of current project design no other changes.

---

## Requirements for phase 1

### Super Admin Access

1. Left side menu click on "Manage Users" option then Manage Users page opens on right side.
2. Existing project design and layout remain same.
3. Only "Manage Users" menu option highlight when active.
4. Super Admin has full access for all projects and all modules.

---

## Manage Users Listing

### Features

* View users list in table format
* Search users
* View assigned role
* View project access type
* View assigned project
* Action options:

  * View
  * Edit
  * Delete

---

## Add New User

### Steps

1. Click on "Add User" button
2. "Add New User" popup opens
3. Enter required details
4. Click on save button
5. User created successfully

---

## Add New User Popup Fields

### User Details

* Name
* Email
* Password
* Confirm Password

### Role Selection

* Admin User
* Normal User

### Access Type

#### Full Access

* Project specific full access
* User can access all allowed modules for selected project

#### Restricted Access

* Show pages/modules list
* Admin can select allowed modules/pages

---

## Project Selection

### Features

* Assign specific project to user
* User login only shows assigned project
* Other projects should not display

---

## Project Specific Admin User Login

### Features

1. Project Management page only assigned project visible
2. Admin User can access:

   * Dashboard
   * Manage Pages
   * Manage Users
   * Other allowed modules
3. Created pages and users only related selected project
4. Access based on assigned permissions

---

## Project Specific Normal User Login

### Features

1. Project Management page only assigned project visible
2. Normal User access limited based on permissions
3. Allowed module access example:

   * Manage Pages

     * View permission
     * Edit permission
   * Manage Users

     * View permission
     * Edit permission
4. Restricted modules should not display in menu

---

## Edit User

### Features

* Edit user details
* Update role permissions
* Update access permissions
* Update assigned project
* Update allowed modules

---

## Delete User

### Features

* Delete selected user
* Confirmation popup before delete
* User removed successfully

---

## Permission Rules

### Super Admin

* Full access for all projects
* Full access for all modules
* Can create and manage all users

### Admin User

* Access only assigned project
* Access based on assigned permissions

### Normal User

* Access only assigned project
* Restricted module access based on permissions

---

## Notes

1. Manage Users listing should display in table design format.
2. Permission management should work properly based on assigned role and access type.
3. Super Admin has full access.
4. Admin User and Normal User only access assigned project related modules and permissions.

---

## References

* Current project design reference
* Existing Admin Console layout
* Existing left sidebar structure
* Existing popup and table design patterns