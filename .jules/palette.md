# Palette's UX Journal

## 2026-02-20 - [Password Visibility Toggle Pattern]
**Learning:** Adding a password visibility toggle requires careful positioning relative to the input field. While implementing this directly in the page works, it leads to code duplication and inconsistent positioning across different forms (Login vs Register).
**Action:** In the future, advocate for extending the base `Input` component to support an `endAdornment` prop or creating a dedicated `PasswordInput` component in the design system to encapsulate this pattern and ensure accessibility consistency.

## 2026-02-21 - [Notification Panel Accessibility]
**Learning:** カスタム実装されたポップオーバー（`NotificationBell`）は、標準的な `Popover` コンポーネントを使用していないため、ARIA属性（`role="dialog"`, `aria-expanded`, `aria-haspopup`）やキーボード操作（Escapeキーでの閉じる動作）が欠落しがちである。
**Action:** カスタムコンポーネントを実装する際は、WAI-ARIAパターンを確認し、同等のアクセシビリティ機能を実装するか、可能な限り既存のアクセシブルなUIライブラリ（shadcn/uiなど）を活用するべきである。
