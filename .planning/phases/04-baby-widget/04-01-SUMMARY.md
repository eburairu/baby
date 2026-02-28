# Plan 04-01 Summary

**Status:** COMPLETED
**Completed:** 2026-02-28

## What was done

- Created `frontend/__tests__/babyWidget.test.tsx` — TDD Red/Green サイクルによるユニットテスト
- Created `frontend/components/dashboard/BabyInfoPopup.tsx` — Sheet(bottom) ベースの赤ちゃん詳細ポップアップ
- Created `frontend/components/dashboard/BabyWidget.tsx` — HexagonWidgetCard を使った六角形ウィジェット

## Artifacts

- **BabyWidget** (`frontend/components/dashboard/BabyWidget.tsx`): `BabyForWidget` 型と `BabyWidget` コンポーネントを named export。HexagonWidgetCard でイニシャル・名前・月齢を表示し、クリックで BabyInfoPopup を開く。
- **BabyInfoPopup** (`frontend/components/dashboard/BabyInfoPopup.tsx`): Sheet(side="bottom") で赤ちゃんの名前・誕生日・月齢・性別・特徴を表示し、`/babies/${id}/edit` への編集リンクを含む。

## Interface for Plan 04-02

```typescript
interface BabyForWidget {
  id: number
  name: string
  birthday?: string | null
  due_date?: string | null
  gender?: ("boy" | "girl" | "unknown") | null
  characteristics?: string | null
}
export function BabyWidget({ baby, size }: { baby: BabyForWidget, size?: number }): JSX.Element
```

## Test results

```
Test Files  10 passed (10)
      Tests 123 passed (123)
   Duration 2.80s

babyWidget.test.tsx (12 tests):
  - イニシャル計算: 3 tests passed
  - 月齢ラベル (calcAge 経由): 1 test passed
  - 性別ラベル変換: 5 tests passed
  - 誕生日フォーマット: 2 tests passed
  - BabyWidget コンポーネント: 1 test passed
```

## TypeScript check

0 errors (`pnpm exec tsc --noEmit` 出力なし)

## Commits

| Hash | Message |
| ---- | ------- |
| `89b024e` | test(04-01): BabyWidget の表示ロジックに関するテストを追加（Red） |
| `2847a43` | feat(04-01): BabyWidget と BabyInfoPopup コンポーネントを実装（Green） |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @vitejs/plugin-react が node_modules に存在しなかった**
- **Found during:** Task 1（テスト実行時）
- **Issue:** `package.json` に記載済みだが `pnpm install` されておらず、vitest が起動不能
- **Fix:** `pnpm install --frozen-lockfile` を実行してインストール
- **Files modified:** `node_modules/` (symlink 先の `/Users/ry1e/Documents/work/baby/frontend/node_modules/`)
- **Commit:** なし（依存インストールのみ）

**2. [TDD Warning 対応] `import type` を value import に変更**
- **Found during:** Task 1（TDD Warning の指摘通り）
- **Issue:** `import type { BabyForWidget }` はランタイムで消えるため、コンポーネントが存在しなくてもテストが Pass してしまう
- **Fix:** `import { BabyWidget }` の value import に変更し、ファイル不在時に確実に Red になるよう修正
- **Files modified:** `frontend/__tests__/babyWidget.test.tsx`
- **Commit:** `89b024e`（同コミット内で修正済み）
