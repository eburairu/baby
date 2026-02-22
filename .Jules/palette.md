# Palette's UX Journal

## 2026-02-20 - [Password Visibility Toggle Pattern]
**Learning:** Adding a password visibility toggle requires careful positioning relative to the input field. While implementing this directly in the page works, it leads to code duplication and inconsistent positioning across different forms (Login vs Register).
**Action:** In the future, advocate for extending the base `Input` component to support an `endAdornment` prop or creating a dedicated `PasswordInput` component in the design system to encapsulate this pattern and ensure accessibility consistency.

## 2026-02-23 - [Icons and Feedback in Quick Actions]
**学び:** 絵文字のみのボタンはスクリーンリーダーのサポートが不足しがちで、意図が正しく伝わらない可能性があります。また、非同期アクション（ミルク記録など）が実行されている間、フィードバックがないとユーザーは操作が成功したのか不安になり、連打してしまう可能性があります。
**アクション:** アイコンのみのボタンには必ず `aria-label` を付与し、非同期アクション中は `Loader2` などのスピナーを表示して明確なフィードバックを提供するパターンを標準化します。
