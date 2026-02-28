# Requirements: Botoro v1.2

**Defined:** 2026-02-28
**Core Value:** 家族全員が同じ記録を見ながら育児を分担できる

## v1.2 Requirements

### インジケーター (INDICATOR)

- [x] **INDIC-01**: 授乳ウィジェットの六角形に、前回授乳からの経過時間プログレスストローク（円弧）が表示される
- [x] **INDIC-02**: おむつウィジェットの六角形に、前回交換からの経過時間プログレスストローク（円弧）が表示される
- [x] **INDIC-03**: ストロークは経過時間/警告閾値（0→100%）で緑（0–60%）→黄（60–80%）→赤（80–100%）と変 化する
- [x] **INDIC-04**: 100%到達後（閾値超過）はストロークが赤で点滅表示される
- [x] **INDIC-05**: インジケーターは1分ごとにリアル タイム更新される

### 閾値管理 (THRESHOLD)

- [x] **THRES-01**: 赤ちゃんの月齢からWHO/小児科ガイドラインに基づく授乳・おむつ警告閾値が自動決定される
- [ ] **THRES-02**: ユーザーが設定画面から赤ちゃんごとに授乳・おむつ閾値を個別設定できる
- [x] **THRES-03**: カスタム閾値はバックエンドのBabyプロフィールに保存され、家族全員が同じ値を参照できる

## v2 Requirements

### 通知 (NOTIFICATION)

- **NOTIF-01**: 閾値超過時にプッシュ通知を送信する（別インフラが必要なためv2以降）

### 拡張インジケーター

- **INDIC-EXT-01**: 睡眠ウィジェットへのインジケーター追加（睡眠記録の特性を踏まえた設計が必要）

## Out of Scope

| Feature | Reason |
|---------|--------|
| プッシュ通知 | 閾値超過時の通知は別インフラ（Web Push）が必要 |
| 睡眠インジケーター | 睡眠は連続記録のため「経過時 間」の意味が異なる |
| 家族間の閾値個別設定 | 同一赤ちゃんの記録を共有す る家族は同じ閾値を使う設計 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INDIC-01 | Phase 6 | Completed |
| INDIC-02 | Phase 6 | Completed |
| INDIC-03 | Phase 6 | Completed |
| INDIC-04 | Phase 6 | Completed |
| INDIC-05 | Phase 6 | Completed |
| THRES-01 | Phase 6 | Completed |
| THRES-02 | Phase 7 | Pending |
| THRES-03 | Phase 5 | Completed |

**Coverage:**
- v1.2 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-03-01 — Phase 6 完了に伴う更新*
