# Super Admin & Manage All Projects Page Changes Spec

## Overview

This document defines UI and functionality changes for:
- Super Admin access management
- Manage All Projects page improvements

The goal is to simplify project management access and improve project listing usability for Super Admin users.

---

# Requirements for phase 1

# Super Admin

## Features

### Full Project Access
- Super Admin can access all projects
- Super Admin can access all modules inside any project

### Full Permission Access
- All permissions automatically enabled for Super Admin
- No permission restrictions applied

### Project Module Access
When Super Admin opens any project, user can access:
- Dashboard
- Manage Pages
- Manage Users

---

# Manage All Projects Page Changes

## Existing Projects Design

### Current Changes
- Existing projects display in table format
- Improve project listing visibility
- Better project management layout

---

## Create Project Button

### Changes
- Move Create Project button to left side corner
- Button visible above projects table

---

## Create New Project Popup

### Popup Features
When user clicks on "Create New Project":
- Create New Project popup opens

### Fields

| Field Name | Description |
|------------|-------------|
| Project Title | Enter project title |
| Slug | Project unique slug |
| Description | Enter project description |

---

## Removed Fields

The following fields should be removed from Create Project popup:
- Frontend URL
- Backend URL

---

## Search Filter

### Features
- Search filter available above project table
- Search result displays matching project name/title

---

## Other Features
- Existing functionality remains unchanged
- No additional workflow changes

---

# Left Side Menu Changes

## Menu Options

### Show Only
Left side menu should display only:
- Switch Project list
- Manage All Projects button

---

## Remove Menu Options

The following menu sections should be removed:
- Management
- Content

Other functionality remains unchanged.

---

# Screenshots

## Existing Project Management Screen

![Project Management Screen](./screenshots/manage-all-projects-page.png)

**Description**
- Existing projects visible in table/list format
- Create Project section available
- Left side menu simplified for Super Admin access

---

# Notes
- Super Admin has unrestricted module access
- All existing project functionality remains active
- Only UI/menu structure changes included in this phase
