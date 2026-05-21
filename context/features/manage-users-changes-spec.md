# Manage Users Changes Spec

## Overview

This document defines the required changes and fixes for the Manage Users module.
The changes focus on menu highlight behavior, restricted access user creation issue, Add New User popup updates, and login issue fixes for created Admin User and Normal User accounts.

Reference of current project design no other changes.

---

## Requirements for phase 1

### 1. Manage Users Menu Highlight Fix

#### Existing Issue

* When click on "Manage Users" page then:

  * "Manage Users" option highlight
  * "Dashboard" option also highlight

#### Required Changes

* Only "Manage Users" menu option should highlight
* Dashboard menu highlight should remove
* Other menu behavior no changes

---

## 2. Restricted Access User Creation Fix

### Existing Issue

* Access Type = "Restricted"
* Click on create user
* User creation shows failed message
* After page refresh created user showing in listing
* Same issue happening in update user

### Required Changes

* Restricted access user should create successfully without refresh
* Proper success message should display
* Same fix required for update user functionality
* No duplicate user creation

---

## 3. Add New User Popup Changes

### Required Changes

#### Remove Field

* Remove "Confirm Password" field

#### Role Options

Role dropdown should show:

* Admin User
* Normal User

#### Password Field

* Add show/hide password eye icon
* User can view entered password when click on eye icon

### Other Fields

Existing remaining fields no changes.

---

## 4. Created User Login Fix

### Existing Issue

* Created Admin User / Normal User unable to login
* Login showing:

  * "Invalid email or password"

### Required Changes

* Created users should login successfully using created credentials
* Email and password authentication should work properly
* Login validation should work for project specific users

---

## Project Specific Login Rules

### Features

* Created Admin User and Normal User should login using:

  * Created email
  * Created password
* User only access assigned project
* Other projects should not display
* Access permissions should work based on assigned role and access type

---

## Notes

1. Make sure project specific created Admin User and Normal User login properly.
2. Use same email and password which entered during user creation.
3. Existing project design and layout no changes.
4. Only requested functionality changes required.

---

## References

* Existing Admin Console design
* Current Manage Users module
* Existing login module
* Existing popup design and sidebar menu structure
