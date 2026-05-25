# Design Changes Spec

## Overview

This update includes multiple UI/UX and responsive design improvements for the Live Site and Manage Pages modules. The purpose of these changes is to improve menu visibility, page responsiveness, markdown editor behavior, and editor usability without affecting existing functionality or workflows.

---

## Requirements for phase 1

### 1. Live Site View

#### Left Side Menu Design

* ~~Long menu option names currently not displaying properly~~ **[DONE]** Long menu option names now show in full — text wraps instead of being cut off with ellipsis
* ~~Improve menu design and spacing for long text labels~~ **[DONE]**
* ~~Make sure menu items display properly in all screen sizes~~ **[DONE]**

#### Responsive Layout

* ~~Improve overall responsiveness for desktop, tablet, and mobile screens~~ **[DONE]**
* ~~Make sure content and menu fit properly in all resolutions~~ **[DONE]**

#### Arrow Icon Design

* ~~Improve left side menu arrow icon alignment/design~~ **[DONE]** Replaced unicode arrows with SVG chevrons that rotate 90° on expand
* ~~Arrow icon should display properly with menu items~~ **[DONE]**

---

### 2. Manage Pages → Edit Page

#### Icon Field UI Issue

* ~~When user clicks on Icon field options, left side layout/design breaks~~ **[DONE]** IconPicker popover uses `position: fixed` with `getBoundingClientRect()` to escape overflow ancestors
* ~~Fix left side UI alignment and spacing issue~~ **[DONE]**

#### Responsive Design

* ~~Make Edit Page screen responsive in all screen sizes~~ **[DONE]**
* ~~Ensure editor and side sections display properly~~ **[DONE]**

---

### 3. Manage Pages → Edit Page

#### Markdown List Rendering

* ~~When user opens existing page, bullet list and numbered list not showing properly initially~~ **[DONE]**
* ~~After pressing Enter key formatting becomes correct~~ **[DONE]**

##### Required Fix

* ~~Existing bullet/numbered list formatting should display properly on page load~~ **[DONE]** `renderMarkdown` paragraph guard updated to skip blocks with block-level closing tags
* ~~No manual action should be required from user~~ **[DONE]**

---

### 4. Manage Pages → Create/Edit Page

#### Auto Scroll Issue

* ~~When user adds heading in markdown editor, page automatically scrolls to top~~ **[DONE]** All toolbar `el.focus()` calls updated to `el.focus({ preventScroll: true })`
* ~~Fix automatic unwanted page scrolling behavior~~ **[DONE]**

#### Icon Section Scroll Issue

* ~~When user adds icons in last section of page, editor scrolls to top automatically~~ **[DONE]**
* ~~Prevent unexpected scroll movement during editing~~ **[DONE]**

#### Editor Stability

* ~~Markdown editor should maintain current scroll position while editing~~ **[DONE]** All `el.focus()` calls in both `CreatePageEditor` and `EditPageEditor` (toolbar functions: headings, text styles, lists, divider, table, image) use `preventScroll: true`
* ~~Smooth editing experience should work consistently~~ **[DONE]**

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
