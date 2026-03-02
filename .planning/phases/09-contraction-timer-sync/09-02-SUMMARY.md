---
phase: 09-contraction-timer-sync
plan: 02
status: completed
date: 2026-03-02
---

### 実施内容
- `frontend/hooks/useContractionTimerSync.ts` フックを新規作成。
- SWR を用いた 3 秒間隔のポーリングを実装。
- 取得データを `contractionStore.sync` に自動反映。

### 検証結果
- コンポーネントでのフック呼び出しが正常。
- 3 秒間隔の API リクエストを確認。
