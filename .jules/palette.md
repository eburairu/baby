# Palette's UX Journal

## 2026-02-20 - [Password Visibility Toggle Pattern]
**Learning:** Adding a password visibility toggle requires careful positioning relative to the input field. While implementing this directly in the page works, it leads to code duplication and inconsistent positioning across different forms (Login vs Register).
**Action:** In the future, advocate for extending the base `Input` component to support an `endAdornment` prop or creating a dedicated `PasswordInput` component in the design system to encapsulate this pattern and ensure accessibility consistency.

## 2026-02-23 - [Icons and Feedback in Quick Actions]
**学び:** 絵文字のみのボタンはスクリーンリーダーのサポートが不足しがちで、意図が正しく伝わらない可能性があります。また、非同期アクション（ミルク記録など）が実行されている間、フィードバックがないとユーザーは操作が成功したのか不安になり、連打してしまう可能性があります。
**アクション:** アイコンのみのボタンには必ず `aria-label` を付与し、非同期アクション中は `Loader2` などのスピナーを表示して明確なフィードバックを提供するパターンを標準化します。

## 2026-02-24 - [Widget Context in Action Links]
**学び:** 複数のウィジェットが並ぶダッシュボードにおいて、各ウィジェットの「詳細を見る」ボタン（矢印アイコン）がすべて同じラベル（"詳細を見る"）だと、スクリーンリーダーユーザーは文脈を理解しにくい。
**アクション:** 汎用的なウィジェットコンポーネントには `ariaLabel` プロパティを追加し、呼び出し元から具体的な文脈（例: "授乳の詳細を見る"）を注入できるようにする。

## 2024-05-24 - [RecentActivityFeedのキーボード操作不能] **学び:** リストアイテムに `onClick` を直接付与すると、キーボードユーザーやスクリーンリーダーユーザーがアクセスできない。 **アクション:** インタラクティブなリストアイテムは必ず `<button>` でラップし、適切なフォーカススタイルとARIAロールを提供する。

## 2026-02-24 - [Feedback on Async Actions]
**学び:** 非同期アクション（フォーム送信など）において、スピナーを表示するだけでなく、ボタンのテキストを「登録中...」のように変更することで、ユーザーにより明確な進捗状況を伝えることができる。特に時間がかかる処理や、ユーザーの不安を解消したい重要な場面（オンボーディングなど）で有効。
**アクション:** 重要なアクションボタンには `loading` プロップだけでなく、状態に応じたテキスト変更も検討する。
