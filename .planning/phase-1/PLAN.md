---
phase: 1
plan: "ハニカムウィジェットの設計"
type: "feature"
requirements: ["REQ-UI-01", "REQ-UI-02", "REQ-UI-03", "REQ-NFR-01", "REQ-NFR-02", "REQ-NFR-03"]
depends_on: []
wave: 1
files_modified: 8
must_haves:
  truths:
    - "ダッシュボードの各ウィジェットが六角形の形状で表示されている"
    - "各ウィジェット内の情報（授乳時間、睡眠時間等）が欠損なく読み取れる"
    - "ダークモードにおいてもウィジェットの境界と内容が明確に判別できる"
  artifacts:
    - path: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      provides: "ハニカム構造用ウィジェットのベースコンポーネント"
      min_lines: 50
    - path: "frontend/components/dashboard/FeedingWidget.tsx"
      provides: "ハニカム対応の授乳記録ウィジェット"
      min_lines: 80
    - path: "frontend/components/dashboard/SleepWidget.tsx"
      provides: "ハニカム対応の睡眠記録ウィジェット"
      min_lines: 80
    - path: "frontend/components/dashboard/DiaperWidget.tsx"
      provides: "ハニカム対応のおむつ記録ウィジェット"
      min_lines: 80
    - path: "frontend/components/dashboard/GrowthWidget.tsx"
      provides: "ハニカム対応の成長記録ウィジェット"
      min_lines: 50
    - path: "frontend/components/dashboard/NoteWidget.tsx"
      provides: "ハニカム対応のノートウィジェット"
      min_lines: 50
    - path: "frontend/components/dashboard/DiaryWidget.tsx"
      provides: "ハニカム対応の日記ウィジェット"
      min_lines: 50
    - path: "frontend/__tests__/HexagonWidgetCard.test.ts"
      provides: "HexagonWidgetCard のユニットテスト"
      min_lines: 40
  key_links:
    - from: "frontend/components/dashboard/FeedingWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
    - from: "frontend/components/dashboard/SleepWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
    - from: "frontend/components/dashboard/DiaperWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
    - from: "frontend/components/dashboard/GrowthWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
    - from: "frontend/components/dashboard/NoteWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
    - from: "frontend/components/dashboard/DiaryWidget.tsx"
      to: "frontend/components/dashboard/HexagonWidgetCard.tsx"
      via: "import"
---

# フェーズ 1: ハニカムウィジェットの設計

## 目標
ハニカム構造に適したウィジェット用のベースコンポーネント `HexagonWidgetCard` を作成し、既存の各ウィジェット（授乳、睡眠等）がハニカム構造に収まるように内部レイアウトを調整する。

## タスク

<task id="1.1" title="HexagonWidgetCard の実装" type="tdd">
  <files>
    <file>frontend/components/dashboard/HexagonWidgetCard.tsx</file>
    <file>frontend/__tests__/HexagonWidgetCard.test.ts</file>
  </files>
  <action>
    `Hexagon` コンポーネントを基盤とし、タイトル、アイコン、情報を六角形の中央に配置する `HexagonWidgetCard.tsx` を作成する。既存の `WidgetCard` が持つエラー表示やアクセス制限のロジックを継承させる。
  </action>
  <verify>
    <automated>
      npm run test:frontend -- __tests__/HexagonWidgetCard.test.ts
    </automated>
  </verify>
  <done>
    `HexagonWidgetCard.tsx` が存在し、テストがパスすること。
  </done>
</task>

<task id="1.2" title="既存ウィジェットの内部調整: 記録系 (Feeding, Sleep, Diaper)" type="auto">
  <files>
    <file>frontend/components/dashboard/FeedingWidget.tsx</file>
    <file>frontend/components/dashboard/SleepWidget.tsx</file>
    <file>frontend/components/dashboard/DiaperWidget.tsx</file>
  </files>
  <action>
    `FeedingWidget`, `SleepWidget`, `DiaperWidget` の内容を `HexagonWidgetCard` を使用するように更新し、六角形内の限られたスペースに合わせてフォントサイズやレイアウトを調整する。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm eslint components/dashboard/{Feeding,Sleep,Diaper}Widget.tsx
    </automated>
  </verify>
  <done>
    3 つのウィジェットが `HexagonWidgetCard` を使用し、Lint が通ること。
  </done>
</task>

<task id="1.3" title="既存ウィジェットの内部調整: 情報系 (Growth, Note, Diary)" type="auto">
  <files>
    <file>frontend/components/dashboard/GrowthWidget.tsx</file>
    <file>frontend/components/dashboard/NoteWidget.tsx</file>
    <file>frontend/components/dashboard/DiaryWidget.tsx</file>
  </files>
  <action>
    `GrowthWidget`, `NoteWidget`, `DiaryWidget` を `HexagonWidgetCard` 向けに調整し、アイコンと直近のサマリーテキストを中央に配置する。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm eslint components/dashboard/{Growth,Note,Diary}Widget.tsx
    </automated>
  </verify>
  <done>
    3 つのウィジェットが `HexagonWidgetCard` を使用し、Lint が通ること。
  </done>
</task>

<task id="1.4" title="スタイルとアクセシビリティの最終確認" type="auto">
  <files>
    <file>frontend/components/dashboard/HexagonWidgetCard.tsx</file>
  </files>
  <action>
    ダークモードでの視認性、クリック/タップ領域の適切さ、レスポンスサイズ（size: 160-180px 基準）をコンポーネントレベルで最終確認する。
  </action>
  <verify>
    <automated>
      cd frontend && pnpm tsc --noEmit
    </automated>
  </verify>
  <done>
    型チェックが通り、目視確認（Storybook またはローカル開発画面）で視認性とアクセシビリティ要件 (REQ-NFR-03) を満たしていること。
  </done>
</task>

## 成功基準 (AC)
- [ ] `HexagonWidgetCard` コンポーネントが作成されている。
- [ ] 既存の 6 つのウィジェットが `HexagonWidgetCard` を使った実装に変更されている。
- [ ] ウィジェット内の文字サイズやアイコンがハニカムの境界をはみ出していない。
- [ ] ダークモードでもハニカムの視認性が保たれている。
- [ ] ウィジェット全体のクリック/タップ領域が適切に設定されている。
