# Markdown Editor Headings Spec

## Overview
The Markdown Editor provides users with a simple and efficient way to format content using standard Markdown syntax. A key feature of the editor is the **header (heading) toolbar**, allowing users to quickly apply heading styles (H1–H5) without manually typing Markdown symbols.

This feature improves usability, especially for non-technical users, by offering quick formatting options similar to modern text editors.

---

## Requirements for Phase 1

### 1. Header Toolbar UI
- Display a horizontal toolbar at the top of the editor.
- Include heading options:
  - **H1 | H2 | H3 | H4 | H5**
- Each option should be clearly visible and clickable.
- Active state should be highlighted when applied.

---

### 2. Heading Functionality
When a user clicks a heading option:

| Heading | Markdown Syntax | Example Output |
|--------|----------------|----------------|
| H1 | `# ` | # Heading 1 |
| H2 | `## ` | ## Heading 2 |
| H3 | `### ` | ### Heading 3 |
| H4 | `#### ` | #### Heading 4 |
| H5 | `##### ` | ##### Heading 5 |

- Apply heading syntax at the start of the current line.
- If text is selected:
  - Apply heading to the selected text.
- If no text is selected:
  - Insert heading prefix and allow user to type.

---

### 3. Live Preview
- Split screen layout:
  - **Left:** Markdown editor
  - **Right:** Preview panel
- Preview should render headings dynamically as user types.
- Styling should match standard Markdown rendering:
  - H1 → largest
  - H5 → smallest

---

### 4. Behavior Rules
- Replace existing heading if already applied.
- Prevent multiple heading prefixes on the same line.
- Maintain cursor position after applying heading.
- Support undo/redo actions.

---

### 5. Keyboard Support (Optional - Phase 1+)
- Allow manual typing:
  - `#` + space → H1
  - `##` + space → H2
- Toolbar should reflect applied heading dynamically.

---

### 6. Responsive Design
- Toolbar should be responsive across:
  - Desktop
  - Tablet
  - Mobile
- On smaller screens:
  - Convert toolbar into scrollable or dropdown format.

---

## References

### UI Reference (Based on Provided Design)
- Dark theme editor layout
- Top heading toolbar with inline options: H1 | H2 | H3 | H4 | H5
- Left panel:
- Markdown input area
- Shows raw syntax (`#`, `##`, etc.)

- Right panel:
- Live preview rendering headings
- Proper spacing and typography hierarchy

---

### Markdown Standard
- Follow CommonMark specification
- Heading syntax:
- `#` through `#####`
- Ensure compatibility with standard Markdown parsers

---

### Future Enhancements (Out of Scope for Phase 1)
- H6 support
- Rich text toggle (WYSIWYG mode)
- Custom heading styles (font, color)
- Table of Contents auto-generation
- Drag-and-drop content structuring

---