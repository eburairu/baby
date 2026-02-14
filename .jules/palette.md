## 2026-02-14 - Button Accessibility and Feedback
**Learning:** Icon-only buttons (like those using Lucide icons) are often missed by screen readers if they lack `aria-label`. Also, async actions in widgets often used `disabled={loading}` which lacks visual feedback compared to `loading={loading}` which shows a spinner.
**Action:** Always verify icon-only buttons have `aria-label` or `title`. Prefer `loading={loading}` over `disabled={loading}` for `Button` components to provide immediate visual feedback.

## 2026-02-14 - Navigation Context Awareness
**Learning:** Users may have different mental models for "Back" vs "Menu" depending on the context. In deep hierarchies like Settings, a "Back" button is expected, while in flat feature areas (Dashboard, Feeding, etc.), a "Menu" button is preferred for lateral navigation.
**Action:** Implement dynamic navigation headers that switch between "Back" and "Hamburger Menu" based on the current path depth and context, rather than forcing a single pattern globally.
