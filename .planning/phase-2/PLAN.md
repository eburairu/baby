---
phase: 2
plan: "ダッシュボードのレイアウト刷新"
type: "feature"
requirements: ["REQ-UI-01", "REQ-UI-02", "REQ-UI-03", "REQ-NFR-01"]
depends_on: ["1"]
wave: 2
files_modified: 2
must_haves:
  truths:
    - "ダッシュボードの 2 カラムグリッドが HoneycombGrid に置き換えられている"
    - "各ウィジェットが適切なハニカムパターン (2-1-2-1 等) で配置されている"
    - "ローディング中のスケルトン表示もハニカム形状に沿ったものになっている"
    - "モバイル画面においてハニカムレイアウトが中央に配置されている"
  artifacts:
    - path: "frontend/app/(dashboard)/dashboard/page.tsx"
      provides: "ハニカムレイアウトを適用したダッシュボードページ"
      min_lines: 120
    - path: "frontend/components/dashboard/DashboardSkeleton.tsx"
      provides: "ハニカム構造に対応したスケルトン表示"
      min_lines: 30
  key_links:
    - from: "frontend/app/(dashboard)/dashboard/page.tsx"
      to: "frontend/components/ui/honeycomb-grid.tsx"
      via: "import"
    - from: "frontend/app/(dashboard)/dashboard/page.tsx"
      to: "frontend/components/dashboard/FeedingWidget.tsx"
      via: "import"
---

# フェーズ 2: ダッシュボードのレイアウト刷新

## 目標
ダッシュボードの既存の 2 カラムグリッドを `HoneycombGrid` を使ったハニカムレイアウトに置き換え、ウィジェットを適切に配置する。

## タスク

<task id="2.1" title="DashboardPage のレイアウト刷新" type="auto">
  <files>
    <file>frontend/app/(dashboard)/dashboard/page.tsx</file>
  </files>
  <action>
    既存の `grid grid-cols-2 gap-4` を `HoneycombGrid` に置き換える。ウィジェットを 2-1-2-1 のパターン（`rows={[[0, 1], [2], [3, 4], [5]]}`）で配置する。画面幅に合わせた `size` (160〜180px) と `gap` の調整を行う。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm eslint app/(dashboard)/dashboard/page.tsx
    </automated>
  </verify>
  <done>
    `DashboardPage` で `HoneycombGrid` が使用され、目視（ローカル開発環境）でウィジェットが六角形のグリッドに沿って配置されていること。
  </done>
</task>

<task id="2.2" title="DashboardSkeleton のハニカム対応" type="auto">
  <files>
    <file>frontend/components/dashboard/DashboardSkeleton.tsx</file>
  </files>
  <action>
    スケルトン表示も `HoneycombGrid` を使用するように変更し、六角形の形状のスケルトン（またはそれに近い形）を配置する。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm eslint components/dashboard/DashboardSkeleton.tsx
    </automated>
  </verify>
  <done>
    `DashboardSkeleton` がハニカム構造に対応し、読み込み中に六角形のパターンが表示されること。
  </done>
</task>

<task id="2.3" title="全体の整合性とレスポンシブ確認" type="auto">
  <files>
    <file>frontend/app/(dashboard)/dashboard/page.tsx</file>
  </files>
  <action>
    ハニカムレイアウトの各要素がモバイル画面で適切に中央寄せされ、画面幅に収まっているかを確認する。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm tsc --noEmit
    </automated>
  </verify>
  <done>
    型チェックが通り、モバイル表示（375px〜）で横スクロールが発生せず、中央寄せされていること。
  </done>
</task>

## 成功基準 (AC)
- [ ] ダッシュボードのウィジェットがハニカム構造で配置されている。
- [ ] スケルトン表示がハニカム構造と一致している。
- [ ] モバイル画面でハニカムレイアウトが中央寄せされ、横スクロールが発生していない。
- [ ] ウィジェット間の隙間が適切に保たれている。
