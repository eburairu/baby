# Wave 1 Summary - 09-01-PLAN.md

## Objective
`frontend/stores/contractionStore.ts` に `sync` メソッドを追加し、外部（SWRポーリング等）からタイマー状態（status, startTime）を同期できるようにする。

## Changes
- `ContractionTimerState` インターフェースに `sync` メソッドの型定義を追加。
- `useContractionTimer` ストアに `sync` メソッドの実装を追加。
  - `startTime` が文字列（ISO形式）の場合に `Date` オブジェクトへ変換するロジックを実装。
  - `status === 'timing'` の場合に、現在時刻との差分から `elapsedSeconds` を自動計算するロジックを実装。
  - `status !== 'timing'` の場合は `elapsedSeconds` を 0 にリセット。

## Verification Result
- 新規テストファイル `frontend/__tests__/contractionStore.test.ts` を作成。
- `vitest` にて以下の 3 つのケースが全てパスすることを確認。
  1. `Date` オブジェクトによる `timing` 状態の同期と `elapsedSeconds` の計算。
  2. ISO 文字列による `timing` 状態の同期と `elapsedSeconds` の計算。
  3. `idle` 状態への同期と `elapsedSeconds` の 0 リセット。

## Files Modified
- `frontend/stores/contractionStore.ts`
- `frontend/__tests__/contractionStore.test.ts` (new)
