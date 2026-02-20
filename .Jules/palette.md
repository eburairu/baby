# Palette's UX Journal

## 2026-02-20 - [Password Visibility Toggle Pattern]
**Learning:** Adding a password visibility toggle requires careful positioning relative to the input field. While implementing this directly in the page works, it leads to code duplication and inconsistent positioning across different forms (Login vs Register).
**Action:** In the future, advocate for extending the base `Input` component to support an `endAdornment` prop or creating a dedicated `PasswordInput` component in the design system to encapsulate this pattern and ensure accessibility consistency.
