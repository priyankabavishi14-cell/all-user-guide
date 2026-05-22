# Markdown Editor Dynamic Icons Spec

## Overview

This update adds dynamic icon search and selection functionality in the Markdown Editor Add/Edit Page screen. Users can search icons using keywords and select any suitable icon for the page — both from project-specific SVG files and from a global icon library. Selected icons should save properly and display correctly in the live site menu/page listing. No other existing functionality or design flow should change.

---

## Requirements for phase 1

### Manage Pages → Add/Edit Page

#### Dynamic Icon Search

* Existing "Icon" field remains available in Add/Edit Page
* Add dynamic icon search functionality in icon selection
* User can search icon by keyword/name
* Matching icons should display instantly while typing
* Multiple related icons should show in search results
* Search covers **both** local project icons and global icon library

#### Icon Sources

* **Your Icons** (local): SVG files stored in `public/icons/`; searched by filename
* **Global Icons**: icons from the bundled Lucide icon library (~100 curated icons); searched by name and display label
* If no local icons match the search query, global icons still show (and vice versa)
* Both sections shown simultaneously when results exist
* Stored as filename (local) or `lucide:<name>` (global)

#### Icon Selection

* User can select any icon from available search results
* Selected icon should preview properly in editor (trigger button shows icon)
* Selected icon should save successfully with page data

#### Live Site Display

* Saved icon should display properly in:

  * Left side menu
  * Page listing
  * Live site navigation
* Same selected icon should show consistently across all pages/modules
* Local SVG icons rendered as `<img src="/icons/{name}.svg" />`
* Lucide global icons rendered as inline SVG via `PageIcon` component

#### Existing Functionality

* No changes in other existing functionality
* Existing Add/Edit Page flow remains same
* Existing saved icons (local SVG filenames) continue working properly
* Legacy emoji/text icon values fall back to text rendering

---

## References

### Module

* Manage Pages

### Pages

* Add Page
* Edit Page

### Feature Reference

* Dynamic icon search (local + global)
* Icon selection and preview
* Live site icon display consistency
* `src/components/admin/IconPicker.tsx` — two-section search UI
* `src/components/PageIcon.tsx` — unified icon renderer
* `src/lib/lucide-icons.ts` — curated Lucide icon map
* `src/lib/icon-utils.ts` — `isSvgIcon`, `isLucideIcon`, `getLucideIconName`
