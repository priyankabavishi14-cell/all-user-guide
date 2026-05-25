# Design Changes Spec

## Overview

This update includes multiple UI/UX and responsive design improvements for the Live Site and Manage Pages modules. The purpose of these changes is to improve menu visibility, page responsiveness, markdown editor behavior, and editor usability without affecting existing functionality or workflows.

---

## Requirements for phase 1

### 1. Live Site View

#### Left Side Menu Design

* Long menu option names currently not displaying properly
* Improve menu design and spacing for long text labels
* Make sure menu items display properly in all screen sizes

#### Responsive Layout

* Improve overall responsiveness for desktop, tablet, and mobile screens
* Make sure content and menu fit properly in all resolutions

#### Arrow Icon Design

* Improve left side menu arrow icon alignment/design
* Arrow icon should display properly with menu items

---

### 2. Manage Pages → Edit Page

#### Icon Field UI Issue

* When user clicks on Icon field options, left side layout/design breaks
* Fix left side UI alignment and spacing issue

#### Responsive Design

* Make Edit Page screen responsive in all screen sizes
* Ensure editor and side sections display properly

---

### 3. Manage Pages → Edit Page

#### Markdown List Rendering

* When user opens existing page, bullet list and numbered list not showing properly initially
* After pressing Enter key formatting becomes correct

##### Required Fix

* Existing bullet/numbered list formatting should display properly on page load
* No manual action should be required from user

---

### 4. Manage Pages → Create/Edit Page

#### Auto Scroll Issue

* When user adds heading in markdown editor, page automatically scrolls to top
* Fix automatic unwanted page scrolling behavior

#### Icon Section Scroll Issue

* When user adds icons in last section of page, editor scrolls to top automatically
* Prevent unexpected scroll movement during editing

#### Editor Stability

* Markdown editor should maintain current scroll position while editing
* Smooth editing experience should work consistently

---

## References

### Modules

* Live Site View
* Manage Pages
* Markdown Editor

### Pages

* Create Page
* Edit Page

### Features

* Responsive UI improvements
* Markdown editor usability fixes
* Menu design improvements
* Scroll behavior fixes
