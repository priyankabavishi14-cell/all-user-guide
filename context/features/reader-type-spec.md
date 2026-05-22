# Reader Type Spec

## Overview

This update adds a new "Reader Type" module for project specific live site access management. Admin users can create different reader types and select which pages should be visible for each reader type. Every reader type will generate a unique publish/live site link that only displays selected project specific pages and menu items.

---

## Requirements for phase 1

### Reader Type Module

#### Left Side Mega Menu

* Add new menu option:

  * Reader Type
* Menu option should display only for specific project modules

---

### Reader Type Page

#### Create Reader Type

* Add create reader type functionality
* Reader Type form contains:

  1. Name
  2. Live Site Menu Design

---

### Live Site Menu Design

#### Project Specific Pages

* Show all project specific pages list
* Only selected project pages should display

#### Page Selection

* User can select/unselect pages
* Selected pages should reflect in live site menu preview

#### Live Site Preview

* Show live site menu preview dynamically
* Preview should display only selected pages

---

### Reader Type Publish Link

#### Unique Publish Link

* Every reader type should generate unique publish/live site link
* Publish link should open only selected reader type pages

#### Reader Type Access

* Users opening publish link should only view:

  * Selected project pages
  * Selected live site menu structure
* Other project pages should not display

---

## References

### Modules

* Reader Type
* Live Site Menu Design

### Features

* Project specific reader type management
* Dynamic menu preview
* Unique publish link generation
* Reader type wise page visibility
