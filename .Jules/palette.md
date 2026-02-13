## 2026-02-14 - Standardizing Button Loading State
**Learning:** Found that key forms (Login, Register) used manual `disabled` states but lacked visual loading indicators, leaving users unsure if their action was processing.
**Action:** Implemented a reusable `loading` prop in the base `Button` component using `lucide-react`'s `Loader2`. This pattern should be used for all async actions going forward.
