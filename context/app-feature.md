# App Feature

User Guide Management System — a platform for creating, managing, and displaying structured user guides with separate admin (backend) and public (frontend) experiences.

## Status

In Progress — Markdown Editor Insert Table feature in development (toolbar button, row/column management, pipe-table markdown rendering)

## Goals

### Admin Dashboard (Project Control Panel)
- Project-scoped dashboard with top header (logo, project breadcrumb, view live site, user profile)
- Left sidebar: project switcher, management links (Dashboard, Manage Pages), Create New Page CTA
- Stats cards: Total Pages count, Guide Setup toggle (welcome screen ON/OFF), Create Page CTA
- Recently Updated Pages table: Title, Parent, Last Updated, Edit action
- Responsive: fixed sidebar on desktop, collapsible on mobile

### Frontend Homepage (End-User Guide View)
- Welcome screen as default landing; togglable from admin dashboard
- Left sidebar as table of contents showing hierarchical page structure (root + nested sub-pages)
- Main content area: welcome icon, title, subtitle, Getting Started card with navigation instructions
- Content fetched dynamically from backend; project-isolated
- Responsive: fixed sidebar on desktop, collapsible hamburger on mobile


### Admin Signup Page
- Centered card layout (400–480px wide) on full-screen height with light background (`#f9fafb`)
- Header: `AdminConsole` logo/product name with optional Back to Home link
- Form fields: Full Name, Email Address, Phone Number (with country code), Password, Confirm Password
- Validation: all fields required; valid email format; password minimum 6–8 characters; confirm password must match
- Primary button: `Create Account` with gradient style and loading spinner state
- Secondary link: `Already have an account? Login` → redirects to login page
- Inline field validation error messages; optional top-level error banner
- Success flow: redirect to Login Page on successful signup
- Responsive: fixed-width centered card on desktop, slightly reduced on tablet, full-width with padding on mobile
- Micro-interactions: input focus highlight, button loading spinner, smooth validation messages

### Admin Login Page
- Centered card layout (400–480px wide) on full viewport height with light background (`#f9fafb`)
- Header: `AdminConsole` logo/product name with optional View Website link
- Form fields: Email Address, Password; Forgot Password link right-aligned under password field
- Validation: all fields required; valid email format; password cannot be empty
- Global error message: `Invalid email or password` on failed authentication
- Primary button: `Login` with gradient style and loading spinner state
- Secondary link: `Don't have an account? Sign up` → redirects to signup page
- Success flow: redirect to Admin Dashboard; store authentication token (JWT/session)
- Responsive: fixed-width centered card on desktop, slightly reduced on tablet, full-width with padding on mobile
- Micro-interactions: input focus highlight, button loading spinner, smooth error transitions
- Security: passwords never stored plain text; rate limiting on backend; token-based auth (JWT)

### All Projects Dashboard
- Main landing screen after admin login; central hub for project management
- Layout: fixed left sidebar (240px) + main content area (project list + add form side-by-side on desktop)
- Top header: `AdminConsole` logo, optional current project context, user profile (name, email, avatar), Logout button (ends session → redirects to login)
- Left sidebar: Switch Project dropdown with `Manage All Projects` active state; Management links (Dashboard, Manage Pages); Create New Page CTA
- Page header: title `Project Management`, subtitle `Create and manage documentation scopes for different product URLs.`
- Project listing (`Existing Projects`): card rows showing project name, slug, status indicator; per-row actions: View (opens frontend guide), Edit (reuses create form), Activate/Deactivate toggle, Delete (with confirmation)
- Add New Project form (right panel or modal): Title, Slug (with `.guide` auto-preview), Description, Frontend URL, Backend URL; `Create Project` gradient button
- Validation: title required; slug required and globally unique (`Slug already exists` error); valid URL format
- Success flow: success toast, project added to list instantly, form reset
- Responsive: sidebar fixed + list/form side-by-side on desktop; form below list on tablet; single column with modal form on mobile
- Micro-interactions: card hover elevation, button hover animation, toast notifications, smooth form transitions

### Project Dashboard (Project-Specific Admin Panel)
- Opens when admin clicks View from All Projects Dashboard or selects a project via Switch Project dropdown
- Layout: fixed left sidebar (240px) + main content area scoped to the selected project
- Top header: `AdminConsole` logo, project breadcrumb/name, View Live Site button, user profile (name, email, avatar), Logout button
- Left sidebar: Switch Project dropdown (current project selected; switching reloads with new project data); `Manage All Projects` link; Management links (Dashboard active, Manage Pages); Create New Page CTA
- Page header: project label (uppercased), title `System Overview`, description, session active timestamp
- Dashboard cards (3-column grid): Total Pages count, Guide Setup (welcome screen ON/OFF toggle), Create Page (gradient CTA card → create page form)
- Recently Updated Pages table: Title, Description, Parent, Last Updated, Edit action; max 5–10 rows; click row → page editor
- Empty state: `No pages created yet` message with `Create First Page` CTA
- Responsive: 3-column cards on desktop, 2-column on tablet, single column + collapsible sidebar on mobile
- Micro-interactions: card hover elevation, toggle animation, button hover, table row hover highlight

### Create New Page
- Opens from: Create New Page (sidebar), Create Page (dashboard card), Create First Page (empty state)
- Layout: 3-column — Left metadata panel (260px) | Markdown editor (flex) | Live preview (flex)
- Top header: Back button (→ Project Dashboard), project name (uppercased), dynamic page title (default `Untitled Page`); right side: Editor / Preview / Split view mode toggle, `Save Changes` gradient button
- Left panel fields: Page Title (required), Sequence (numeric, default `0`), Icon (selector, future picker), Parent Page (dropdown, default `No Parent (Root)`), Short Description (textarea); Markdown tip box below fields
- Center panel: Markdown textarea with placeholder `# Start writing your awesome guide content here...`; supports headings, lists, links, bold/italic, code blocks
- Right panel: live rendered markdown preview; empty state shows `Nothing to preview`
- View modes: Editor (editor only), Preview (preview only), Split (default — editor + preview side by side with live sync)
- Save validation: title required; on success show toast (stay on page or redirect); on failure show error toast
- Responsive: 3-column on desktop; editor + preview stacked on tablet; single view with section toggle on mobile
- Micro-interactions: live preview rendering, button hover, smooth layout transitions, input focus highlight

### Markdown Editor List Formatting
- List dropdown button in the toolbar with three options: Standard List (`* item`), Numbered List (`1. item`), Checkbox List (`- [ ] item`)
- Selection-based: if multiple lines are selected, apply the chosen list format to every line
- Cursor-based: if no selection, insert the list prefix and place cursor after it
- Toggle: if a line already has a list prefix, convert it to the selected list type; prevent duplicate prefixes
- Numbered list auto-increments across selected lines (1., 2., 3. …)
- Cursor position maintained after applying list format
- Live preview renders: bullet list with dots, numbered list with sequence, checkbox list with `☐` / `☑` checkboxes
- Supported syntax: `* item` / `- item` (bullet), `1. item` (numbered), `- [ ] item` / `- [x] item` (checkbox)
- Responsive: dropdown collapses/scrolls on smaller screens

### Markdown Editor Text Styles Toolbar
- Horizontal toolbar above the markdown editor with: Bold (B), Italic (I), Strikethrough (S), Inline Code (`</>`), Small Text (Tt), Quote (")
- Selection-based: if text is selected, wrap it with the corresponding markdown syntax
- Cursor-based: if nothing is selected, insert syntax markers with cursor placed inside (e.g. `****` with cursor between the stars for Bold)
- Toggle: if the selected text is already wrapped in a style, remove the syntax (unwrap)
- Prevent duplicate syntax wrapping on the same selection
- Active state highlight on toolbar buttons when cursor is inside styled text
- Live preview renders: bold → `<strong>`, italic → `<em>`, strikethrough → `<del>`, inline code → monospace highlight, quote → indented block with left border, small text → reduced font size
- Supported syntax: `**bold**`, `*italic*`, `~~strikethrough~~`, `` `code` ``, `> quote`, `<small>text</small>`
- Responsive toolbar: compact/scrollable on smaller screens

### Markdown Editor Insert Table
- "Insert Table" button (⊞) in markdown editor toolbar, positioned after the image upload button with a divider
- Clicking Insert Table inserts a default 3-column pipe-table at cursor position with placeholder headers and 2 empty data rows
- Table management buttons enabled when cursor is inside a table: +Row (add row at end), -Row (remove last data row), +Col (add column), -Col (remove last column)
- Row/column management buttons disabled when cursor is outside a table
- Generated markdown uses standard pipe-table format: `| Header | Header |`, separator line `| --- | --- |`, data rows `|  |  |`
- Live preview renders pipe-tables as HTML `<table>` with styled header row (highlighted background), bordered cells, and alternating-friendly layout
- Existing tables in Edit Page load and render correctly; table modifications save with the page content
- All existing editor features (headings, text styles, lists, image upload, preview, save) remain unchanged

### Manage Pages
- Layout: fixed left sidebar (240px) + main content area scoped to the selected project
- Top header: `AdminConsole` logo, current project name, View Live Site button, user profile (name, email, avatar, logout)
- Left sidebar: Switch Project dropdown, Manage All Projects button; menu items: Dashboard, Manage Pages (active), Create New Page CTA
- Page title section: title `Manage Pages`, subtitle `Manage, sort, and organize all your guide pages.`, Create Page primary CTA button
- Search bar: placeholder `Search by title or description...`; filters results dynamically
- View controls: Hierarchy View toggle, total rows count display (e.g. `6 rows`)
- Pages listing table columns: Title (with short description), Seq (sequence number), ID / Parent (slug + parent reference), Updated (time + date), Actions (Edit / Delete / more options)
- Hierarchy: parent-child relationships; parent pages expandable/collapsible; child pages indented under parent
- Row actions: Edit (opens page in editor), Delete (confirmation before deletion), optional additional dropdown
- Hierarchy toggle: expand/collapse child pages
- Sorting: sort by sequence (ascending/descending); maintain hierarchy structure during sorting
- Behavior rules: prevent deletion of parent without handling children; unique page slug enforced; sequence order integrity preserved
- Responsive: sidebar collapses on smaller screens; table scrollable horizontally; actions accessible via dropdown on mobile

### Small Changes — Phase 2 (Super Admin & Manage All Projects)

#### Super Admin

1. **Full Project Access**
   - Super Admin can access all projects
   - Super Admin can access all modules inside any project

2. **Full Permission Access**
   - All permissions automatically enabled for Super Admin
   - No permission restrictions applied

3. **Project Module Access**
   - When Super Admin opens any project, accessible modules: Dashboard, Manage Pages, Manage Users

#### Manage All Projects Page Changes

4. **Existing Projects**
   - Projects displayed in table format with improved listing visibility

5. **Create Project Button**
   - Moved to left side corner, visible above the projects table

6. **Create New Project Popup**
   - Opens when user clicks "Create New Project"
   - Fields: Project Title, Slug, Description
   - Removed fields: Frontend URL, Backend URL

7. **Search Filter**
   - Search filter above project table; filters by matching project name/title

8. **Left Side Menu Changes**
   - Show only: Switch Project list, Manage All Projects button
   - Remove: Management section, Content section

---

### Small Changes — Phase 1 (UI/UX Improvements)

#### Admin Panel

1. **Static Header (Sticky Header)**
   - Top header section remains fixed while scrolling
   - Applies to: page title section, markdown editor toolbar/options
   - Expected: header always visible; Save button and formatting tools (H1–H5, Bold, Lists, Insert Link, Upload Image) accessible without scrolling up

2. **Static Left Sidebar Menu**
   - Left navigation menu remains fixed while main content scrolls
   - Applies to: Dashboard, Manage Pages, Create/Edit Page, User & Permission Management, all admin pages
   - Expected: sidebar always visible; navigation accessible during long page scrolling

3. **Existing Projects — Highlight Change**
   - Current: "Edit" button is highlighted (primary emphasis)
   - Updated: "View" button highlighted instead; "Edit" de-emphasised
   - Applies to: Manage All Projects → Existing Projects listing

#### View Live Site

4. **Static Left Sidebar Menu**
   - Documentation navigation sidebar remains fixed while content scrolls
   - Applies to: documentation live view, welcome screen, content pages
   - Expected: sidebar always accessible; users can switch pages without scrolling back up

#### Layout Behaviour Summary

| Section (Admin) | Behaviour |
|---|---|
| Header | Fixed / Sticky |
| Left Sidebar | Fixed |
| Main Content | Scrollable |

| Section (Live Site) | Behaviour |
|---|---|
| Left Sidebar | Fixed |
| Content Area | Scrollable |

---

### Manage Pages — Small Changes
- Hierarchy View is active by default every time Manage Pages loads; does not persist last selected view
- Create New Page: after clicking Save Changes, redirect to Manage Pages (not Project Dashboard)
- Newly created page appears in the list immediately in the correct hierarchy position and sequence order
- Success feedback on page creation: toast notification (e.g. "Page created successfully")
- Icon field on Add/Edit Page replaced with a visual SVG icon picker; icons from `public/icons/` (`location`, `sales`, `user`); stored as filename without extension; rendered as `<img>` in table and sidebar with emoji fallback for legacy values

### Edit Page
- Entry points: Manage Pages → Actions → Edit button or Edit icon on page listing row
- Opens Edit Page screen with all existing page data pre-filled
- Layout: 3-column — Left metadata panel (260px) | Markdown editor (flex) | Live preview (flex); same shell as Create New Page
- Top header: Back button (→ Manage Pages), project name (uppercased), dynamic page title; right side: Editor / Preview / Split view mode toggle, `Save / Update` gradient button, Cancel button
- Left panel fields: Page Title (required), Description (textarea), Slug (auto-generated from title, editable, lowercase+hyphens, must be unique), Parent Page (dropdown/tree), Sequence (numeric), Icon
- Slug rules: auto-generated from title; editable; must be unique per project; lowercase, hyphen-separated (e.g. `sales-person-order-flow`)
- Hierarchy: parent page dropdown; selecting parent makes page a child; no parent = top-level
- Markdown editor: pre-loads existing content; supports H1–H5, bold/italic/strikethrough, lists, image upload, insert link; real-time split preview
- Save/Update: validates title required, slug unique, sequence numeric; shows success message; reflects changes in Manage Pages and Live Site immediately
- Cancel: discards unsaved changes; navigates back to Manage Pages
- Validation: duplicate slug shows inline error; missing required fields show validation messages; save failure shows retry option
- Security: only Admin and Editor roles can access edit; permissions validated before update
- Behavior: preserves page ID and existing hierarchy if unchanged; updates timestamps on save
- Responsive: desktop split editor view; mobile/tablet stacked layout with toggle between editor and preview

### View Live Site (Frontend Documentation Portal)
- Read-only end-user facing documentation portal; no admin controls
- Top header: application branding (`GuideManager`), current project name; minimal and clean design
- Left sidebar: hierarchical page list with parent/child structure; active item highlighted; child pages indented; parent items expand/collapse on click
- Main content area: centered display; default welcome state shows icon, title (`Welcome to the [Project] Guide`), subtitle, and a `Getting Started` info card with sidebar navigation instructions
- Content rendering: markdown output supporting H1–H5 headings, bold/italic text styles, bullet/numbered/checkbox lists, inline code and code blocks, blockquotes; clean typography and spacing
- Navigation behavior: clicking sidebar item loads page content and highlights active item; expand/collapse child pages; maintain navigation state during browsing
- Default state: welcome screen with Getting Started card when no page is selected; graceful handling of empty or missing content
- Responsive: sidebar fixed on desktop; collapsible hamburger menu on tablet/mobile; content takes full width on mobile
- Accessibility: proper contrast, keyboard navigation support, focus states for sidebar items

### Live Guide Welcome Page
- Default landing experience for end-users accessing the documentation portal; configurable per project by admin
- Welcome Screen toggle (Guide Setup card in Project Dashboard): ON → show welcome page; OFF → auto-redirect to first page by sequence
- Toggle state saved per project; default state: ON
- Layout: same shell as View Live Site (header + sidebar + main content)
- Welcome content (toggle ON): centered icon (📘), dynamic title (`Welcome to the [Project] Guide`), dynamic subtitle (project description), Getting Started info card with instructional text
- When toggle OFF: frontend auto-redirects to the first active page ordered by sequence; that page is highlighted in the sidebar
- Admin configuration fields (future): Welcome Title, Subtitle, Info Card Title, Info Card Description, Icon
- Empty state: if no pages exist, show informational message
- Responsive: sidebar fixed on desktop, collapsible on mobile; content full-width on mobile
- Accessibility: H1 for welcome title, readable contrast, keyboard navigation support

### Markdown Editor Upload Image
- Image upload button in the toolbar (🖼️ icon), positioned alongside other formatting tools; tooltip: "Upload Image"
- On click: opens file picker; supported formats: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`; file size limit configurable (default 2MB–5MB)
- After upload: image stored in cloud/server storage with unique filename, public URL returned, markdown syntax `![alt](url)` inserted at cursor position
- Alt text defaults to filename; user can edit manually; selection-based insert replaces selected text
- Live preview renders uploaded images instantly; maintain aspect ratio; fit within content width; responsive scaling
- Image rendering rules: max-width 100% of container, auto height, margin spacing around images
- Error handling: invalid file type, file too large, upload failure (retry option), broken URL (fallback UI)
- Security: validate file type and size, prevent malicious uploads, sanitize filenames, use HTTPS URLs
- Behavior rules: no duplicate image syntax, maintain cursor position after insertion, support undo/redo, allow manual editing of markdown syntax
- Responsive: images resize on all devices; preview panel adapts accordingly

### Manage Users
- Entry: left sidebar "Manage Users" link; opens Manage Users page in the main content area
- Layout: same shell as other admin pages; "Manage Users" sidebar item highlighted when active
- Existing project design and layout remain the same; only Manage Users menu item highlights

#### User Listing
- Table format: Name, Email, Role, Access Type, Assigned Project, Actions (View / Edit / Delete)
- Search filter above table; filters by name or email

#### Add New User
- "Add User" button opens Add New User popup
- Fields: Name, Email, Password, Confirm Password
- Role Selection: Admin User (project-scoped full/restricted access), Normal User (restricted module access)
- Access Type:
  - Full Access — project-specific full access; user can access all allowed modules for the selected project
  - Restricted Access — shows pages/modules list; admin selects allowed modules/pages
- Project Selection: assign a specific project to the user; user login shows only the assigned project

#### Edit User
- Update name, email, role, access type, assigned project, and allowed modules

#### Delete User
- Confirmation popup before deletion; user removed on confirm

#### Project-Specific Admin User Login
- Project Management page shows only the assigned project
- Can access: Dashboard, Manage Pages, Manage Users, other allowed modules
- Created pages and users are scoped to the assigned project
- Access based on assigned permissions

#### Project-Specific Normal User Login
- Project Management page shows only the assigned project
- Module access limited to assigned permissions (e.g. Manage Pages — view/edit; Manage Users — view/edit)
- Restricted modules hidden from menu

#### Permission Rules
- Super Admin: full access to all projects and all modules; can create and manage all users
- Admin User: access only assigned project; access based on assigned permissions
- Normal User: access only assigned project; restricted module access based on permissions

#### Behavior Rules
- Permission changes reflect immediately
- If an assigned page is deleted, remove it from user permissions automatically
- Security enforced at both frontend (UI visibility) and backend (API validation)

### Manage Users — Changes (Phase 1)

#### 1. Manage Users Menu Highlight Fix
- When clicking "Manage Users" page, only "Manage Users" option should highlight
- "Dashboard" option must not also highlight
- Other menu items behavior unchanged

#### 2. Restricted Access User Creation Fix
- Restricted access user creation currently shows a failed message but actually succeeds (visible after refresh)
- Same issue affects update user functionality
- Fix: restricted access user should create/update successfully without requiring a page refresh
- Proper success message should display immediately
- No duplicate user creation

#### 3. Add New User Popup Changes
- Remove "Confirm Password" field
- Role dropdown options: Admin User, Normal User (no other roles)
- Add show/hide password eye icon to Password field; user can toggle password visibility
- All other existing fields remain unchanged

#### 4. Created User Login Fix
- Created Admin User / Normal User accounts currently cannot log in (shows "Invalid email or password")
- Fix: project-specific users should log in using their created email and password
- User sees only the assigned project on login
- Access permissions apply based on assigned role and access type

### Markdown Editor Headings Toolbar
- Horizontal toolbar at the top of the markdown editor with H1 | H2 | H3 | H4 | H5 buttons
- Clicking a heading button applies the correct markdown prefix (`#` through `#####`) at the start of the current line
- If text is selected: apply heading to the selected line; if no text selected: insert prefix and allow typing
- Replace existing heading prefix if a heading is already applied; prevent multiple heading prefixes on the same line
- Maintain cursor position after applying a heading
- Active state highlight on the button matching the heading level of the current line
- Live preview renders heading hierarchy dynamically (H1 largest → H5 smallest) in the preview panel
- Responsive toolbar: scrollable on smaller screens

### Database — Prisma ORM + Neon PostgreSQL
- Prisma 7 with Neon serverless PostgreSQL
- Schema models: `User`, `Project`, `Page` (self-referencing hierarchy)
- All tables use snake_case column names mapped to camelCase in Prisma
- Unique constraint on `(project_id, slug)` per page; cascade delete on project removal
- Always use migrations (`prisma migrate dev`) — never direct schema push
- Development branch for `DATABASE_URL`; separate production branch
- Prisma client singleton via Neon adapter at `src/lib/prisma.ts`
- Generated client output at `generated/prisma/` (gitignored)

## Notes

- All three screens share the same design system: primary `#5b5ce2`, gradient to `#7c3aed`, background `#f9fafb`, text `#111827`
- Micro-interactions required: button hover, card elevation, smooth scroll, loading skeletons
- Switching projects in admin requires re-authentication
- Only active projects shown on the main dashboard
- Welcome screen visibility controlled via admin toggle

## History

### 2026-05-21 — Implemented Markdown Editor Insert Table
- Added module-level table helpers to both `CreatePageEditor.tsx` and `EditPageEditor.tsx`: `isTableLine`, `isSeparatorLine`, `parseTableRow`, `getLineIndex`, `findTableBlock`
- Updated `renderMarkdown` in both editors: line-by-line table detection converts consecutive `|`-starting lines into `<table>` HTML with styled header (`bg-[#f3f4f6]`), bordered cells, and `<thead>`/`<tbody>` structure; runs before paragraph split step
- Added `inTable` state and updated `syncToolbarState` to detect when cursor is inside a table block
- Added 5 table operation functions inside each editor component: `insertTable` (3-col default), `addTableRow`, `removeTableRow`, `addTableColumn`, `removeTableColumn`
- Added toolbar section after image upload: divider, ⊞ Insert Table button (always enabled), +Row / -Row / +Col / -Col buttons (disabled when cursor is outside a table)
- Build verified: `npm run build` passes with no TypeScript errors

### 2026-05-21 — Added Markdown Editor Insert Table Spec
- Added `context/features/markdown-editor-insert-table-spec.md` defining Insert Table feature for Add Page and Edit Page
- Requirements: Insert Table toolbar option, row/column add/remove management, header row with highlight, standard pipe-table markdown format, live preview rendering, no changes to existing editor design or functionality

### 2026-05-13 — Added Manage Users Changes Spec
- Defined Manage Users Changes Phase 1 spec (`context/features/manage-users-changes-spec.md`)
- Fix 1: Menu highlight — only "Manage Users" highlights when on Manage Users page; Dashboard highlight removed
- Fix 2: Restricted access user creation/update shows failure message but succeeds; fix to show proper success without refresh and prevent duplicates
- Fix 3: Add New User popup — remove Confirm Password field; add show/hide password eye icon; role options Admin User/Normal User only
- Fix 4: Project-specific Admin User/Normal User login fails with "Invalid email or password"; fix authentication to use created credentials; user sees only assigned project on login

### 2026-05-13 — Implemented Manage Users
- Created `src/app/admin/[slug]/users/UsersClient.tsx` (Client Component: full rewrite — search bar filtering by name/email, table with Name/Email/Role/Access Type/Assigned Project/Actions columns, View/Edit/Delete actions per row)
- View action opens read-only user detail modal showing role badge, access type, assigned project, and allowed pages list
- Add/Edit action opens centered popup modal with fields: Name, Email, Password, Confirm Password, Role (Admin User / Normal User), Access Type (Full / Restricted), page permission tree for restricted access, Assigned Project (read-only current project)
- Delete action shows confirmation modal; user removed on confirm
- Updated `src/app/admin/[slug]/users/page.tsx`: role cast updated from `'editor'` to `'admin'`
- Updated `src/types/index.ts`: `ProjectUser.role` changed from `'editor' | 'viewer'` to `'admin' | 'viewer'`
- Role labels: `'admin'` → "Admin User" (blue badge), `'viewer'` → "Normal User" (grey badge)
- Existing `src/app/admin/[slug]/users/actions.ts` retained: `createProjectUserAction`, `updateProjectUserAction`, `deleteProjectUserAction` with scrypt password hashing and `PagePermission` sync for restricted access
- Route: `/admin/[slug]/users`

### 2026-05-13 — Added Manage Users Spec
- Defined Manage Users spec (`context/features/manage-users-spec.md`)
- Roles: Super Admin (unrestricted), Admin User (project-scoped), Normal User (permission-restricted)
- Manage Users listing: table with Name, Email, Role, Access Type, Assigned Project, Actions
- Add New User popup: Name, Email, Password, Confirm Password, Role, Access Type (Full / Restricted), Project assignment
- Edit User: update all fields including role, permissions, assigned project
- Delete User: confirmation popup required before removal
- Project-Specific Admin User login: sees only assigned project; access to Dashboard, Manage Pages, Manage Users per permissions
- Project-Specific Normal User login: sees only assigned project; limited module access (view/edit per module); restricted modules hidden
- Permission rules: Super Admin full access; Admin User and Normal User scoped to assigned project and permissions
- Security enforced at both UI and API levels; deleted pages auto-removed from user permissions

### 2026-05-13 — Added Small Changes Phase 2 Spec
- Defined Small Changes Phase 2 spec (`context/features/small-changes-02-spec.md`)
- Super Admin: full access to all projects and modules; all permissions enabled by default
- Super Admin project modules: Dashboard, Manage Pages, Manage Users
- Manage All Projects: projects shown in table format; Create Project button moved to top-left
- Create New Project popup: fields reduced to Title, Slug, Description (Frontend URL and Backend URL removed)
- Added search filter above project table for filtering by project name/title
- Left side menu simplified: shows only Switch Project list and Manage All Projects button; Management and Content sections removed

### 2026-05-12 — Added Small Changes Phase 1 Spec
- Defined Small Changes Phase 1 UI/UX improvements (`context/features/small-changes-01-spec.md`)
- Admin Panel: sticky top header (page title + markdown toolbar always visible on scroll)
- Admin Panel: fixed left sidebar on all admin screens (Dashboard, Manage Pages, Create/Edit Page, User Management)
- Admin Panel: Existing Projects listing — "View" button now primary highlighted action instead of "Edit"
- Live Site: fixed left documentation sidebar; only main content area scrolls

### 2026-05-05 — Added Icon Picker to Small Changes Spec
- Added Icon Picker requirement to `context/features/small-changes.md`
- Replaces free-text Icon input on Add/Edit Page with visual SVG picker
- Icons from `public/icons/`: `location.svg`, `sales.svg`, `user.svg`
- Stored as filename without extension; rendered as `<img>` in table + sidebar; emoji fallback for legacy values

### 2026-05-05 — Added Manage Pages Small Changes Spec
- Defined Manage Pages small changes spec (`context/features/small-changes.md`)
- Hierarchy View enabled by default on every Manage Pages load; never persisted
- Create New Page save redirects to Manage Pages instead of Project Dashboard
- Newly created page visible immediately in correct hierarchy and sequence position
- Success toast shown after page creation

### 2026-05-04 — Added Edit Page Spec
- Defined Edit Page UI spec (`context/features/edit-page-spec.md`)
- Entry points: Manage Pages → Edit action or page listing row Edit icon
- Same 3-column layout as Create New Page; all fields pre-filled with existing page data
- Fields: Page Title (required), Description, Slug (auto-generated, editable, unique, lowercase+hyphens), Parent Page (dropdown), Sequence (numeric), Icon
- Full markdown editor with all toolbar features; pre-loads existing content; real-time split preview
- Save/Update validates required fields; cancel discards changes and returns to Manage Pages
- Security: only Admin and Editor roles can edit; permissions enforced before save
- Responsive: desktop split view; mobile/tablet stacked layout with editor/preview toggle

### 2026-05-04 — Added User & Permission Management Spec
- Defined User & Permission Management spec (`context/features/user-permission-spec.md`)
- Three roles: Admin (full), Editor (create/edit), Viewer (view only)
- Full Access vs Restricted Access (selected pages); page selector uses hierarchy checkbox tree
- Live site enforces permissions: sidebar hides restricted pages; direct URL access shows "Access Denied"
- Security: enforcement required at both frontend UI and backend API
- Edge cases: deleted assigned page removes from permissions; empty assignment shows informational message

### 2026-05-04 — Added Markdown Editor Upload Image Spec
- Defined Markdown Editor Upload Image spec (`context/features/markdown-editor-upload-image-spec.md`)
- Image upload toolbar button opens file picker; supports PNG/JPG/JPEG/GIF/WEBP up to 2–5MB
- Inserts `![alt](url)` at cursor after upload; alt text defaults to filename
- Live preview renders images with aspect ratio preserved and responsive scaling
- Error handling for invalid type, oversized file, upload failure, and broken URLs
- Security: file type/size validation, filename sanitization, HTTPS-only URLs

### 2026-05-04 — Added Live Guide Welcome Page Spec
- Defined Live Guide Welcome Page spec (`context/features/welcome-guide-live.md`)
- Welcome Screen toggle (ON/OFF) in Project Dashboard Guide Setup card controls landing behavior
- Toggle ON: show welcome page with icon, title, subtitle, Getting Started card
- Toggle OFF: auto-redirect to first page by sequence; sidebar highlights that page
- Toggle state saved per project; responsive and accessible

### 2026-05-04 — Implemented View Live Site
- Created `src/lib/render-markdown.ts` (shared renderer: H1–H5, bold/italic/strikethrough, inline code, code blocks, blockquotes, bullet/numbered/checkbox lists, links, small text; inline code stashed before HTML escaping to protect content)
- Created `src/components/frontend/FrontendShell.tsx` (Client Component: full layout wrapper — header with hamburger on mobile, sidebar with overlay + slide-in on mobile, main content slot; manages `sidebarOpen` state)
- Updated `src/components/frontend/FrontendSidebar.tsx` (Client Component: active page highlight in primary purple, expand/collapse per parent via `▸/▾` button, auto-expands parent of active page on load, `onNavigate` callback closes mobile sidebar on link click)
- Created `src/components/frontend/PageContent.tsx` (page title + description + `dangerouslySetInnerHTML` rendered markdown)
- Updated `src/app/[slug]/page.tsx` (Prisma fetch with mock fallback; uses `FrontendShell` + `WelcomeContent`)
- Created `src/app/[slug]/pages/[pageSlug]/page.tsx` (fetches project + all pages + active page by slug; 404 if page not found; uses `FrontendShell` + `PageContent`)
- Routes: `/[slug]` (welcome screen), `/[slug]/pages/[pageSlug]` (page view)

### 2026-05-04 — Added View Live Site Spec
- Defined View Live Site UI spec (`context/features/view-live-site.md`)
- Read-only documentation portal with hierarchical sidebar, markdown content rendering, and welcome screen default state
- Sidebar supports parent/child hierarchy with expand/collapse; active item highlighted
- Markdown rendering: headings, text styles, lists, code blocks, blockquotes
- Responsive: fixed sidebar on desktop, collapsible hamburger on mobile

### 2026-05-04 — Implemented Live Guide Welcome Page
- Added `welcomeScreenEnabled Boolean @default(true) @map("welcome_screen_enabled")` to `Project` model in `prisma/schema.prisma`; applied migration `20260504070337_add_welcome_screen_enabled` and regenerated Prisma client
- Added `welcomeScreenEnabled: boolean` to `Project` interface in `src/types/index.ts`; added `welcomeScreenEnabled: true` to both mock projects in `src/lib/mock-data.ts`
- Created `toggleWelcomeScreenAction(projectId, enabled)` in `src/app/admin/actions.ts`: updates `welcomeScreenEnabled` via Prisma, revalidates `/admin` path
- Updated `src/components/admin/StatsCards.tsx`: accepts `projectId` prop; Guide Setup toggle now persists state to DB via `toggleWelcomeScreenAction` with `useTransition`-based optimistic UI (reverts on error)
- Updated all 6 Prisma→Project mappings across server components to include `welcomeScreenEnabled: p.welcomeScreenEnabled`
- Updated `src/app/[slug]/page.tsx`: if `welcomeScreenEnabled` is false and pages exist, redirects straight to the first page (`/${slug}/pages/${projectPages[0].slug}`)

### 2026-05-04 — Implemented Manage Pages
- Created `src/app/admin/[slug]/pages/page.tsx` (Server Component: session check → redirect to login; fetches all project pages from Prisma ordered by sequence; falls back to mock data)
- Created `src/app/admin/[slug]/pages/ManagePagesClient.tsx` (Client Component: search bar, Hierarchy View toggle, pages table with Title/Seq/ID+Parent/Updated/Actions columns)
- Created `src/app/admin/[slug]/pages/actions.ts` (Server Action `deletePageAction`: guards against deleting parents with children, hard-deletes page, revalidates dashboard and pages paths)
- Hierarchy view: builds parent-child tree, all parent nodes expanded by default, expand/collapse toggle per row; flat list used when search is active
- Delete flow: confirmation modal → `deletePageAction` → success/error toast → `router.refresh()`
- Updated `src/components/admin/AdminSidebar.tsx`: added `activePage` prop; Dashboard/Manage Pages links switch active highlight dynamically
- Route: `/admin/[slug]/pages`

### 2026-05-04 — Added Manage Pages Spec
- Defined Manage Pages UI spec (`context/features/manage-pages-spec.md`)
- Table with Title, Seq, ID/Parent, Updated, Actions columns; expandable hierarchy view
- Search bar, Hierarchy View toggle, row count display
- Edit/Delete actions per row; delete requires confirmation; parent deletion guarded
- Responsive: collapsible sidebar, horizontally scrollable table, mobile action dropdown

### 2026-04-30 — Implemented Markdown Editor List Formatting
- Added list dropdown button (☰ ▾) to the editor toolbar in `CreatePageEditor.tsx`, between the heading buttons and text style buttons
- `LIST_OPTIONS`: Standard List (`* `), Numbered List (`1. `), Checkbox List (`- [ ] `)
- `applyList(type)`: strips any existing list prefix from each selected line via `stripListPrefix`, applies the new prefix via `buildListPrefix`; numbered list auto-increments across lines
- Dropdown closes on outside click via `useRef` + `mousedown` listener
- `renderMarkdown` updated: `- [ ] item` → `☐ item`, `- [x] item` → `☑ item` (checked, struck through in primary purple)
- Cursor restored after mutation via `requestAnimationFrame`

### 2026-04-30 — Added Markdown Editor List Formatting Spec
- Defined Markdown Editor List spec (`context/features/markdown-editor-list-spec.md`)
- Dropdown button with Standard List, Numbered List, Checkbox List options
- Selection-based multi-line apply; cursor-based single-line insert; toggle between list types
- Live preview renders bullet dots, numbered sequence, and checkbox states

### 2026-04-30 — Implemented Markdown Editor Text Styles Toolbar
- Added Bold, Italic, Strikethrough, Inline Code, Small Text, Quote buttons to the editor toolbar in `CreatePageEditor.tsx`, sharing a row with the H1–H5 heading buttons (separated by a divider)
- `applyStyle(style)`: selection-based wrapping (wraps selected text), cursor-based insertion (places cursor between markers), and toggle/unwrap (removes markers if already wrapped around cursor)
- Quote is line-level: toggles `> ` prefix on the current line, same pattern as heading prefix
- Active state: `detectActiveStyles` checks if cursor/selection sits inside each style's markers and highlights the corresponding toolbar button
- `renderMarkdown` updated: `~~text~~` → `<del>`, `> text` → `<blockquote>` with left border, `<small>text</small>` stashed before HTML escaping and restored as `<small class="text-xs">`
- Toolbar scrolls horizontally on small screens via `overflow-x-auto`

### 2026-04-30 — Added Markdown Editor Text Styles Spec
- Defined Markdown Editor Text Styles UI spec (`context/features/markdown-editor-text-styles-spec.md`)
- Toolbar buttons: Bold, Italic, Strikethrough, Inline Code, Small Text, Quote
- Selection-based wrapping and cursor-based insertion; toggle (unwrap) if already applied
- Live preview renders all styles; responsive toolbar across screen sizes

### 2026-04-30 — Implemented Markdown Editor Headings Toolbar
- Added H1–H5 heading buttons to the toolbar above the markdown editor in `CreatePageEditor.tsx`
- `applyHeading(level)`: finds the current line via cursor position, strips any existing heading prefix, applies the new one, restores cursor position via `requestAnimationFrame`
- Prevents duplicate heading prefixes on the same line; clicking the same level replaces the old prefix cleanly
- Active heading button highlighted in primary purple based on cursor's current line
- Toolbar syncs active state on `onChange`, `onKeyUp`, and `onClick` of the textarea
- `editorRef` (useRef) used for direct DOM access to `selectionStart` and `setSelectionRange`

### 2026-04-30 — Added Markdown Editor Headings Spec
- Defined Markdown Editor Headings UI spec (`context/features/markdown-editor-headings-spec.md`)
- H1–H5 toolbar above the markdown editor; applies heading prefix to the current line
- Behavior rules: replace existing heading, prevent duplicate prefixes, maintain cursor position
- Live preview renders headings dynamically in the right panel

### 2026-04-30 — Implemented Create New Page
- Created `src/app/admin/[slug]/pages/new/page.tsx` (Server Component: session check → redirect to login; fetches project + existing pages via Prisma with mock fallback; renders `CreatePageEditor`)
- Created `src/app/admin/[slug]/pages/new/CreatePageEditor.tsx` (Client Component: 3-column layout — left metadata panel, center markdown editor, right live preview; view mode toggle: Editor / Preview / Split; `useActionState` for form submission and error display)
- Created `src/app/admin/[slug]/pages/new/actions.ts` (Server Action `createPageAction`: validates title required, auto-generates unique slug from title, creates `Page` via Prisma, `revalidatePath` for dashboard and pages list)
- Route: `/admin/[slug]/pages/new`
- Live markdown preview renders headings, bold/italic, inline code, links, lists, code blocks
- Success: toast notification → auto-redirect to Project Dashboard after 1.2s
- Sidebar "Create New Page" CTA and dashboard "Create Page" card both link to this route

### 2026-04-29 — Added Create New Page Spec
- Defined Create New Page UI spec (`context/features/create-new-page-spec.md`)
- 3-column layout: metadata form, markdown editor, live preview panel
- View mode toggle: Editor / Preview / Split (default); live sync in Split mode
- Save validates title; success toast; page appears in dashboard, manage pages, and frontend sidebar

### 2026-04-29 — Implemented Project Dashboard
- Created `src/components/admin/ProjectSwitcher.tsx` (Client Component: dropdown listing all projects with status dots; selecting a project navigates to `/admin/[slug]`; closes on outside click)
- Updated `src/components/admin/AdminSidebar.tsx` to accept `allProjects` prop and use `ProjectSwitcher`
- Updated `src/components/admin/AdminHeader.tsx` to add Logout button (server action form → `logoutAction`)
- Updated `src/components/admin/RecentPagesTable.tsx` — added Description column (hidden on mobile); empty state with `Create First Page` CTA
- Updated `src/app/admin/[slug]/page.tsx` — session cookie check (redirects to login if missing); fetches real user + projects + pages from Prisma with mock fallback; passes `allProjects` to sidebar; project-specific description and session timestamp

### 2026-04-29 — Added Project Dashboard Spec
- Defined Project Dashboard UI spec (`context/features/project-dashboard-spec.md`)
- Header with project breadcrumb, View Live Site, user profile, and Logout
- Stats cards: Total Pages, Guide Setup (welcome toggle), Create Page CTA
- Recently Updated Pages table with Edit action; empty state with Create First Page CTA
- Switch Project dropdown reloads dashboard for selected project

### 2026-04-29 — Implemented All Projects Dashboard
- Defined All Projects Dashboard UI spec (`context/features/all-projects-dashboard-spec.md`)
- Created `src/app/admin/page.tsx` (Server Component: checks `session_token` cookie → redirects to login if missing; tries Prisma for real data, falls back to mock)
- Created `src/app/admin/ProjectsDashboard.tsx` (Client Component: sidebar, header, project listing, create/edit form, toast, delete confirmation)
- Created `src/app/admin/actions.ts` (Server Actions: `createProjectAction`, `updateProjectAction`, `deleteProjectAction`, `toggleProjectAction`, `logoutAction`)
- Project card rows: status badge, View/Edit/Activate·Deactivate/Delete actions; inline delete confirmation
- Edit mode pre-fills the form with existing project data; Cancel restores create mode
- Slug field: enforces lowercase + hyphens only; live `.guide` preview below the input
- Optimistic UI for delete and toggle; `router.refresh()` syncs from server after mutations
- Logout action deletes session from DB, clears cookie, redirects to `/admin/login`
- "Manage All Projects" link in `AdminSidebar` now wired to `/admin`
- Route: `/admin` — dynamic server-rendered

### 2026-04-29 — Implemented Admin Login Page
- Defined Admin Login UI spec (`context/features/admin-login-spec.md`)
- Created `src/app/admin/login/page.tsx` (Client Component, `useActionState` for inline errors and loading state)
- Created `src/app/admin/login/actions.ts` (Server Action: validates fields, looks up user by email, verifies password with `crypto.timingSafeEqual` + `crypto.scrypt`, creates `Session` record in DB, sets `session_token` httpOnly cookie, redirects to `/`)
- Email + Password fields; Forgot Password link right-aligned under password; global `Invalid email or password` error banner
- Session expires in 7 days; cookie is `httpOnly`, `sameSite: lax`, `secure` in production
- Signup ↔ Login cross-links wired; route: `/admin/login`

### 2026-04-29 — Implemented Admin Signup Page
- Defined Admin Signup UI spec (`context/features/admin-signup-spec.md`)
- Created `src/app/admin/signup/page.tsx` (Client Component, `useActionState` for inline errors and loading state)
- Created `src/app/admin/signup/actions.ts` (Server Action: validates all fields, hashes password with `crypto.scrypt`, creates user via Prisma, redirects to `/admin/login`)
- Centered card layout with Full Name, Email, Phone, Password, Confirm Password fields
- Duplicate-email error handled gracefully; inline per-field validation messages
- Consistent with existing design system (colors, typography, spacing, micro-interactions)
- Route: `/admin/signup` — builds as static, renders as server-rendered form

### 2026-04-29 — Completed Admin Dashboard & Frontend Homepage
- Scaffolded project with `create-next-app` and configured Tailwind CSS
- Built Admin Dashboard (`/admin/[slug]`): header with logo/breadcrumb/user profile, left sidebar with project switcher and navigation, stats cards (total pages, welcome screen toggle, create page CTA), recently updated pages table
- Built Frontend Homepage (`/[slug]`): welcome screen, hierarchical sidebar TOC, main content area with getting started card
- Root `/` redirects to Admin Dashboard for active project
- All screens share design system: primary `#5b5ce2`, gradient to `#7c3aed`, background `#f9fafb`, text `#111827`
