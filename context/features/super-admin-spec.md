# Super Admin Spec

## Overview

This update adds Super Admin management functionality with centralized project and user access control. 
Super Admin can access all projects and manage assistant admin users from a dedicated Users Management module. 
Created users will only access assigned projects after login. 
Current Project Management screen and existing functionality remain unchanged.

---

## Requirements for phase 1

### Super Admin Login

* Super Admin can login using admin credentials
* Super Admin has access to all projects and modules

---

### Left Side Mega Menu

#### Add New Menu Options

1. Projects Management
2. Users Management

---

### Projects Management

* Current Project Management screen remains same
* No design or functionality changes required
* Existing project flow continues as it is

---

### Users Management

#### Users Listing

* Show users listing in table format
* Display created assistant admin users
* Add search user filter functionality

#### Create User

* Add "Create User" button in Users Management page
* Click on Create User button then popup opens

##### Create User Popup Fields

1. Username
2. Email
3. Password
4. Select Project

   * Show all active projects list
   * Super Admin can select any one project
   * Created user gets access only for selected project

#### User Actions

* Edit User
* Delete User

---

### Project Specific Access

#### User Login Access

* Created user can login using email and password
* After login only assigned project should display
* User cannot access other projects

#### Super Admin Access

* Super Admin can access all projects
* Super Admin can manage all users and projects

---

## References

### Modules

* Projects Management
* Users Management

### Features

* Super Admin access control
* Project specific user access
* User creation and management
* Project assignment system
