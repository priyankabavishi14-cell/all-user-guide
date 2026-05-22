# Markdown Editor Upload Image Spec

## Overview
The Markdown Editor includes an **image upload feature** that allows users to insert images into their content easily. Users can upload images directly from their device and see them rendered instantly in the **live preview panel**.

This feature enhances documentation by enabling visual content such as screenshots, diagrams, and illustrations.

The editor follows a **split-screen layout**:
- **Left panel:** Markdown input (raw syntax)
- **Right panel:** Live preview (rendered output with images)

---

## Requirements for Phase 1

### 1. Image Upload Toolbar Option

- Add an **Image Upload icon/button** in the top toolbar
- Icon suggestion: 🖼️ or image symbol
- Tooltip: "Upload Image"
- Position: Alongside other formatting tools (text styles, lists, headers)

---

### 2. Upload Functionality

#### A. Upload Action
- On click:
  - Open file picker
- Supported formats:
  - `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- File size limit:
  - Configurable (default: 2MB–5MB)

---

#### B. After Upload
- Image is uploaded to server/storage
- Return a **public URL**
- Automatically insert Markdown syntax into editor:

---

### 3. Editor Behavior

#### A. Cursor-Based Insert
- Insert image syntax at current cursor position

#### B. Selection-Based Insert (Optional)
- Replace selected text with image syntax

#### C. Alt Text Handling
- Default alt text:
  - "Image" OR filename
- Allow user to edit alt text manually

---

### 4. Live Preview Behavior

- Preview panel should render uploaded images instantly
- Image display:
  - Maintain aspect ratio
  - Fit within content width
  - Responsive scaling

---

### 5. Image Rendering Rules

- Max width: 100% of container
- Auto height adjustment
- Add spacing (margin) around images
- Optional caption (future scope)

---

### 6. Error Handling

- Invalid file type:
  - Show error message
- File too large:
  - Show validation error
- Upload failure:
  - Show retry option
- Broken image URL:
  - Show placeholder or fallback UI

---

### 7. Storage & URL Handling

- Images stored in:
  - Cloud storage (AWS S3, Firebase, etc.) OR server
- Generate unique file names
- Ensure public accessibility for preview rendering

---

### 8. Security Considerations

- Validate file type and size
- Prevent malicious uploads
- Sanitize file names
- Use secure URLs (HTTPS)

---

### 9. Responsiveness

- Images should:
  - Resize properly on all devices
  - Not overflow container
- Preview panel should adapt accordingly

---

### 10. Behavior Rules

- Do not duplicate image syntax
- Maintain cursor position after insertion
- Support undo/redo
- Allow manual editing of Markdown image syntax

---

## References

### UI Reference (Based on Provided Design)

#### Toolbar
- Dark theme toolbar
- Image upload icon placed with:
  - Bold, Italic, Code, List, etc.

---

#### Editor Panel (Left)
- Displays Markdown syntax:
-
---

#### Preview Panel (Right)
- Displays actual image
- Clean rendering with spacing
- Matches content styling

---

### Markdown Syntax Reference

- Basic Image Syntax:  
- With Title (optional):

---

### Example Flow

1. User clicks "Upload Image"
2. Selects file
3. Image uploads successfully
4. Markdown inserted:
5. Preview shows image instantly

---
