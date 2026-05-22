# 🔐 Admin Login UI Spec

---

# 📌 Overview

The **Admin Login Page** allows existing administrators to securely access the **Admin Console**.

This page follows the same design principles used across:

* Admin Dashboard
* Signup Page

It ensures:

* Clean, distraction-free UI
* Fast authentication flow
* Consistent branding and layout

---

# 🎯 Requirements for Phase 1

## 1. Page Layout

### Structure:

```text id="p9x2ka"
Centered Authentication Card
```

* Full viewport height
* Light background (`--bg-light`)
* Card centered vertically and horizontally

---

## 2. Header (Top)

### Components:

* **Logo / Product Name**

  * `AdminConsole`

* Optional:

  * Link to frontend (`View Website`)

---

## 3. Login Card

### Card Design:

* Width: `400px – 480px`
* Padding: `24px – 32px`
* Rounded corners
* Soft shadow
* White background

---

## 🧾 3.1 Title Section

* **Title:**

  * `Welcome Back`

* **Subtitle:**

  * `Login to manage your documentation`

---

## 📝 3.2 Form Fields

### Fields:

1. **Email Address**

   * Input type: `email`
   * Placeholder: `Enter your email`

2. **Password**

   * Input type: `password`
   * Placeholder: `Enter your password`

---

### Additional Options:

* **Forgot Password Link**

  * Positioned right-aligned under password field
  * Action:

    * Redirect to Forgot Password page

---

### Validation Rules:

* All fields required
* Email must be valid format
* Password cannot be empty

---

## 🔘 3.3 Actions

### Primary Button

* Label: `Login`
* Style:

  * Primary gradient button
* Behavior:

  * Submit form
  * Show loading spinner

---

### Secondary Link

* Text:

  * `Don’t have an account? Sign up`
* Action:

  * Redirect to Signup page

---

## ⚠️ 3.4 Error Handling

### Inline Errors:

* Invalid email format
* Required field missing

### Global Error:

* Example:

  * `Invalid email or password`

---

## 🔐 3.5 Success Flow

* On successful login:

  * Redirect to **Admin Dashboard**
  * Store authentication token (JWT/session)

---

## 🔒 3.6 Security Considerations

* Use secure API (HTTPS)
* Password never stored in plain text
* Rate limiting (backend)
* Token-based authentication (JWT recommended)

---

# 🎨 UI/UX Specifications

## Colors

```css id="czp7x1"
:root {
  --primary: #5b5ce2;
  --primary-gradient: linear-gradient(135deg, #5b5ce2, #7c3aed);
  --bg-light: #f9fafb;
  --border: #e5e7eb;
  --text-dark: #111827;
  --text-light: #6b7280;
  --error: #ef4444;
}
```

---

## Typography

* Title: `24px – 28px` bold
* Labels: `14px` medium
* Input text: `14px`
* Error text: `12px`

---

## Inputs

* Height: `40px – 44px`
* Border radius: `8px`
* Border: light gray
* Focus:

  * Primary color border
  * Subtle shadow

---

## Buttons

* Height: `44px`
* Full width
* Rounded corners
* Hover:

  * Slight brightness increase

---

## Spacing

* Field gap: `16px`
* Section gap: `24px`

---

## Responsive Behavior

### Desktop

* Centered card with fixed width

### Tablet

* Slightly reduced width

### Mobile

* Full-width card with padding
* Optimized touch spacing

---

## Micro-interactions

* Input focus highlight
* Button loading spinner
* Smooth error message transitions

---

# 🔗 Navigation Flow

```text id="j8zq2m"
Login Page
 ├── Login Success → Admin Dashboard
 ├── Forgot Password → Reset Flow
 └── Signup Link → Signup Page
```

---

# 📎 References

## UI Reference

* Based on existing Admin Dashboard design (cards, spacing, colors)

## Design Consistency

* Matches:

  * Admin Signup Page
  * Main Dashboard
  * Frontend Homepage

---

# ⚠️ Important Notes

* Backend must handle validation and authentication
* Do not expose sensitive errors
* Maintain consistent UI across auth screens

---

# ✅ Future Enhancements

* Remember Me option
* Social login (Google, GitHub)
* Multi-factor authentication (MFA)
* Device/session management

---
