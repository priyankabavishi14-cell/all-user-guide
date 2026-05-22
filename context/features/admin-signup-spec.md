# 🔐 Admin Signup UI Spec

---

# 📌 Overview

The **Admin Signup Page** allows new administrators to register and gain access to the **Admin Console**.

This screen follows the same design system as:

* Admin Dashboard

It should maintain:

* Clean layout
* Centered form
* Minimal distractions
* Strong focus on form completion

---

# 🎯 Requirements for Phase 1

## 1. Page Layout

### Structure:

```text
Centered Card Layout
```

* Full-screen height
* Light background (`--bg-light`)
* Form card centered both vertically and horizontally

---

## 2. Header (Top)

### Components:

* **Logo / Product Name**

  * `AdminConsole`
* Optional:

  * Back to Home link

---

## 3. Signup Card

### Card Design:

* Width: `400px – 480px`
* Padding: `24px – 32px`
* Rounded corners
* Soft shadow
* White background

---

## 🧾 3.1 Title Section

* **Title:**

  * `Create Admin Account`

* **Subtitle:**

  * `Start managing your documentation platform`

---

## 📝 3.2 Form Fields

### Fields:

1. **Full Name**

   * Input type: text
   * Placeholder: `Enter your full name`

2. **Email Address**

   * Input type: email
   * Placeholder: `Enter your email`

3. **Phone Number**

   * Input type: tel
   * Format:

     * Include country code (e.g., +1)

4. **Password**

   * Input type: password
   * Placeholder: `Enter password`

5. **Confirm Password**

   * Input type: password
   * Placeholder: `Confirm password`

---

### Validation Rules:

* All fields required
* Email must be valid format
* Password:

  * Minimum 6–8 characters
* Confirm password must match

---

## 🔘 3.3 Actions

### Primary Button

* Label: `Create Account`
* Style:

  * Primary gradient (same as dashboard)
* Behavior:

  * Submit form
  * Show loading state

---

### Secondary Link

* Text:

  * `Already have an account? Login`
* Action:

  * Redirect to login page

---

## ⚠️ 3.4 Error Handling

* Inline field validation messages
* Top-level error (optional):

  * "Something went wrong. Please try again."

---

## ✅ 3.5 Success Flow

* On successful signup:

  * Redirect to **Login Page**
  * OR auto-login (optional future)

---

# 🎨 UI/UX Specifications

## Colors

```css id="k3md92"
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

* Title: 24px–28px bold
* Labels: 14px medium
* Input text: 14px
* Helper/Error text: 12px

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
* Rounded
* Full width
* Hover:

  * Slight brightness increase

---

## Spacing

* Field gap: `16px`
* Section gap: `24px`

---

## Responsive Behavior

### Desktop

* Centered fixed-width card

### Tablet

* Slightly reduced width

### Mobile

* Full-width card with padding
* No horizontal scroll

---

## Micro-interactions

* Input focus highlight
* Button loading spinner
* Smooth validation messages

---

# 🔗 Navigation Flow

```text
Signup Page
 ├── Submit → Login Page
 └── Login Link → Login Page
```

---

# 📎 References

## UI Reference

* Based on Admin Dashboard design system (cards, colors, spacing)

## Design Consistency

* Same as:

  * Admin Dashboard
  * Main Dashboard
  * Frontend Homepage

---

# ⚠️ Important Notes

* Ensure secure password handling
* Do not expose validation logic in frontend only
* Backend must validate all inputs
* Use HTTPS for all requests

---

# ✅ Future Enhancements

* Social signup (Google, GitHub)
* Email verification
* Password strength meter
* Terms & conditions checkbox

---
