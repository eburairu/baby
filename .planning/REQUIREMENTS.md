# Requirements: Botoro v1.3

**Defined:** 2026-03-02
**Core Value:** 家族全員が同じ記録を見ながら育児を分担できる

## v1.3 Requirements

### バックエンド — タイマー状態管理 (TIMER-BE)

- [ ] **TIMER-BE-01**: `GET /api/babies/{baby_id}/timer/contraction` で陣痛タイマー状態（status, start_time）を取得できる
- [ ] **TIMER-BE-02**: `PUT /api/babies/{baby_id}/timer/contraction` で陣痛タイマー状態を更新できる（開始/停止）
- [ ] **TIMER-BE-03**: `GET /api/babies/{baby_id}/timer/feeding` で授乳タイマー状態（active_side, 左右累積秒数, アクティブ区間開始時刻）を取得できる
- [ ] **TIMER-BE-04**: `PUT /api/babies/{baby_id}/timer/feeding` で授乳タイマー状態を更新できる
- [ ] **TIMER-BE-05**: タイマー状態は baby_id に紐づき、同じ家族のユーザーのみアクセスできる

### フロントエンド — ポーリング同期 (TIMER-FE)

- [ ] **TIMER-FE-01**: 陣痛タイマーページが3秒ごとにバックエンドから状態を取得し UIを自動更新する
- [ ] **TIMER-FE-02**: 陣痛タイマーの開始/停止操作が即座にバックエンドに書き込まれる
- [ ] **TIMER-FE-03**: 授乳記録フォームのタイマーが3秒ごとにバックエンドから状態を取得し UIを自動更新する
- [ ] **TIMER-FE-04**: 授乳タイマーの開始/一時停止操作が即座にバックエンドに書き込まれる
- [ ] **TIMER-FE-05**: 別デバイスで操作された場合、ポーリングにより UIのタイマー状態・経過時間が更新される

## v2 Requirements

### 拡張同期

- **SYNC-01**: WebSocket によるサブ秒リアルタイム同期（ポーリングから昇格が必要な場合）
- **SYNC-02**: 睡眠タイマーの共有（睡眠記録の特性を踏まえた設計が必要）

## Out of Scope

| Feature | Reason |
|---------|--------|
| WebSocket リアルタイム同期 | ポーリング（数秒）で十分。インフラ複雑性を避ける |
| プッシュ通知 | Web Push インフラが必要、v2以降 |
| 睡眠タイマーの共有 | 睡眠は連続記録で「経過時間」の意味が異なる |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TIMER-BE-01 | Phase 8 | Pending |
| TIMER-BE-02 | Phase 8 | Pending |
| TIMER-BE-03 | Phase 8 | Pending |
| TIMER-BE-04 | Phase 8 | Pending |
| TIMER-BE-05 | Phase 8 | Pending |
| TIMER-FE-01 | Phase 9 | Pending |
| TIMER-FE-02 | Phase 9 | Pending |
| TIMER-FE-03 | Phase 10 | Pending |
| TIMER-FE-04 | Phase 10 | Pending |
| TIMER-FE-05 | Phase 10 | Pending |

**Coverage:**
- v1.3 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 — traceability updated (Phase 8-10)*
