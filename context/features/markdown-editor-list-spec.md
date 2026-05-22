# Markdown Editor 3 Different List Option Spec

## Overview
The Markdown Editor includes a **list formatting feature** that allows users to easily create and manage different types of lists using dedicated toolbar buttons. This improves content structuring and readability by supporting commonly used list formats.

The editor follows a **split-screen layout**:
- **Left panel:** Markdown input (raw syntax)
- **Right panel:** Live preview (rendered output)

Users can choose from three list types:
1. Standard (Bullet) List
2. Numbered (Ordered) List
3. Checkbox (Task) List

---

## Requirements for Phase 1

### 1. List Toolbar UI
- Display **three separate buttons** side by side in the top toolbar (not a dropdown).
- Buttons:
  - **• Standard List** — bullet list icon
  - **1. Numbered List** — ordered list icon
  - **☐ Checkbox List** — checkbox icon
- Each button is always visible and individually clickable.
- Active state should highlight the button when the current line uses that list type.
- Buttons should be responsive and compact on smaller screens.

---

### 2. List Types & Markdown Syntax

| List Type | Toolbar Button | Markdown Syntax | Example Input | Example Output |
|----------|---------------|----------------|--------------|----------------|
| Standard List | • | `* item` or `- item` | `* List 1` | • List 1 |
| Numbered List | 1. | `1. item` | `1. List 1` | 1. List 1 |
| Checkbox List | ☐ | `- [ ] item` | `- [ ] List 1` | ☐ List 1 |

---

### 3. Functionality Behavior

#### A. Standard (Bullet) List
- On click:
  - Add `* ` at the beginning of the line
- Support multiple lines:
  - Apply to each selected line

#### B. Numbered List
- On click:
  - Add incremental numbering:
    ```
    1. Item 1
    2. Item 2
    3. Item 3
    ```
- Auto-increment numbers for multiple lines

#### C. Checkbox List
- On click:
  - Add `- [ ] ` prefix
- Allow toggling checked/unchecked state in preview (if supported)

---

### 4. Interaction Behavior

#### Selection-Based
- If multiple lines are selected:
  - Apply selected list format to all lines

#### Cursor-Based
- If no selection:
  - Insert list prefix and place cursor after it

#### Toggle Behavior
- If already a list:
  - Convert to selected list type
- Prevent duplicate prefixes

---

### 5. Live Preview Behavior
- Preview panel updates in real-time
- Render:
  - Bullet list with dots
  - Numbered list with sequence
  - Checkbox list with checkboxes
- Maintain spacing and indentation

---

### 6. Behavior Rules
- Maintain cursor position after applying list
- Support undo/redo functionality
- Preserve indentation for nested lists (basic support)
- Ensure consistent formatting across list types

---

### 7. Responsive Design
- Three separate toolbar buttons should:
  - Always be visible on desktop and tablet
  - Scroll horizontally on mobile if toolbar overflows

---

## References

### UI Reference (Based on Provided Design)
- Toolbar with three separate inline buttons:
  - `•` Standard List!
  - `1.` Numbered List
  - `☐` Checkbox List
- Left panel — Markdown syntax:
  ```
  * List 1
  1. List 1
  - [ ] List 1
  ```
- Right panel — Rendered lists:
  - Bullet points
  - Numbered items
  - Checkboxes
            
---

### Supported Syntax Reference
- Bullet List: `* item` or `- item`
- Numbered List: `1. item`
- Checkbox List: `- [ ] item`, `- [x] item` (checked)

---

### Future Enhancements (Out of Scope for Phase 1)
- Nested list controls (indent/outdent buttons)
- Drag-and-drop reordering
- Rich checkbox interaction (click to toggle in editor)
- Mixed list types in a single block
- Keyboard shortcuts for list creation

---
