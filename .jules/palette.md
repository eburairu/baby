## 2026-02-14 - Button Accessibility and Feedback
**Learning:** Icon-only buttons (like those using Lucide icons) are often missed by screen readers if they lack `aria-label`. Also, async actions in widgets often used `disabled={loading}` which lacks visual feedback compared to `loading={loading}` which shows a spinner.
**Action:** Always verify icon-only buttons have `aria-label` or `title`. Prefer `loading={loading}` over `disabled={loading}` for `Button` components to provide immediate visual feedback.
