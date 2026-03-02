# Wave 3 Summary - 09-03-PLAN.md

## Objective
`frontend/components/contraction/ContractionTimer.tsx` を修正し、タイマーの開始・停止操作をバックエンドと同期させる。

## Changes
- `useContractionTimerSync` カスタムフックを `ContractionTimer` に導入。
- `handleToggle` (開始時):
  - `PUT /api/babies/${babyId}/timer/contraction` を呼び出し、サーバー側のタイマー状態を `timing` に更新するように修正。
  - 操作完了後に `mutate()` を実行し、SWR キャッシュを最新化。
- `handleToggle` (終了時):
  - `Promise.all` を使用し、タイマー状態の `idle` へのリセット (`PUT`) と記録の保存 (`POST /contractions/`) を並行して実行するように修正。
  - どちらの操作も失敗しないようにエラーハンドリングを行い、完了後に `mutate()` を実行。
- `babyId` が有効な場合のみ同期フックが動作するよう制御。

## Verification Result
- ファイル `frontend/components/contraction/ContractionTimer.tsx` の正常な更新を確認。
- `handleToggle` 内の非同期通信ロジックが、ローカル状態の即時更新とサーバー側への反映を正しく行っていることを目視確認。

## Files Modified
- `frontend/components/contraction/ContractionTimer.tsx`
