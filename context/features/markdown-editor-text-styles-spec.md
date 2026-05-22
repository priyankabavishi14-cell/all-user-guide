# Markdown Editor Text Styles Spec

## Overview
The Markdown Editor includes a **text styling toolbar** that allows users to quickly format content using common Markdown syntax. This feature enhances usability by providing easy access to formatting options such as bold, italic, strikethrough, inline code, quotes, and more.

The editor follows a **split-screen layout**:
- **Left panel:** Markdown input
- **Right panel:** Live preview

This ensures users can instantly see how their styled content will render.

---

## Requirements for Phase 1

### 1. Text Style Toolbar UI
Display a horizontal toolbar at the top of the editor with the following options:

- **Bold (B)**
- **Italic (I)**
- **Strikethrough (S)**
- **Inline Code (`</>`)**
- **Small Text (Tt)**
- **Quote (" icon)**

Toolbar should:
- Use icons similar to the reference design
- Highlight active styles when applied
- Support hover tooltips (e.g., "Bold", "Italic")

---

### 2. Text Formatting Functionality

| Style | Markdown Syntax | Example Input | Example Output |
|------|----------------|--------------|----------------|
| Bold | `**text**` | `**Bold**` | **Bold** |
| Italic | `*text*` | `*Italic*` | *Italic* |
| Strikethrough | `~~text~~` | `~~Strike~~` | ~~Strike~~ |
| Inline Code | `` `text` `` | `` `code` `` | `code` |
| Small Text | `<small>text</small>` | `<small>Text</small>` | Small Text |
| Quote | `> text` | `> Quote` | Quote block |

---

### 3. Interaction Behavior

#### Selection-Based Formatting
- If user selects text:
  - Apply corresponding Markdown syntax around selection

#### Cursor-Based Formatting
- If no text is selected:
  - Insert syntax and place cursor inside

Example:
- Clicking **Bold** inserts: `****` with cursor in between

---

### 4. Live Preview Behavior
- Preview panel updates in real-time
- Styled text should render as:
  - Bold → strong text
  - Italic → emphasized text
  - Strikethrough → crossed text
  - Inline code → highlighted monospace
  - Quote → indented block with left border
  - Small text → reduced font size

---

### 5. Behavior Rules
- Avoid duplicate syntax wrapping
- Toggle formatting if already applied
- Maintain cursor position after action
- Support undo/redo functionality

---

### 6. Compatibility
- Follow standard Markdown (CommonMark)
- Allow inline HTML (`<small>`) where required
- Ensure compatibility with Markdown preview renderer

---

### 7. Responsive Design
- Toolbar should adapt to different screen sizes:
  - Desktop → full toolbar
  - Tablet → compact layout
  - Mobile → scrollable or grouped options

---

## References

### UI Reference (Based on Provided Design)
- Dark theme editor
- Top toolbar with icons: same as screenshots show
- Left panel:
- Markdown input (raw syntax visible)
- Right panel:
- Live preview rendering formatted output

---

### Supported Syntax Reference
- Bold: `**text**`
- Italic: `*text*`
- Strikethrough: `~~text~~`
- Inline Code: `` `text` ``
- Quote: `> text`
- Small Text: `<small>text</small>`

---

### Future Enhancements (Out of Scope for Phase 1)
- Code blocks with language support
- Highlight / background color
- Font size variations
- Text alignment options
- Rich text (WYSIWYG) editing mode

---
