# ロードマップ: Botoro

## Milestones

- [x] **v1.0 ダッシュボードUIのハニカム構造化** — Phase 1-3 (完了)
- [ ] **v1.1 赤ちゃん情報ウィジェット** — Phase 4 (進行中)

---

## v1.0 (完了) — Phase 1-3

ダッシュボードUIのハニカム構造化。全 REQ 達成。詳細: `.planning/milestones/v1.0-REQUIREMENTS.md`

---

## v1.1 赤ちゃん情報ウィジェット

**Goal:** ダッシュボードのハニカムグリッド中央に赤ちゃん情報ウィジェットを追加し、上部の BabyProfileCard を廃止して情報を一本化する

### Phase 4: 赤ちゃん情報ウィジェット

**Goal:** ユーザーがダッシュボード上でウィジェットから赤ちゃんの全情報にアクセスできる

**Requirements:** WIDGET-01, WIDGET-02, WIDGET-03, WIDGET-04, CLEANUP-01

**Success Criteria:**
1. ダッシュボードのハニカムグリッド中段中央に赤ちゃんのイニシャル・名前・月齢が表示されたウィジェットが見える
2. ウィジェットをタップするとポップアップが開き、名前・誕生日・月齢・性別・特徴（characteristics）が表示される
3. ポップアップ内のリンクをタップすると赤ちゃんプロフィール編集ページに移動できる
4. ダッシュボード上部に BabyProfileCard が存在せず、情報の重複がない

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — BabyWidget + BabyInfoPopup コンポーネントを TDD で実装
- [ ] 04-02-PLAN.md — ダッシュボードへの組み込みと BabyProfileCard 削除

---

## Progress

| Phase | Milestone | Status | Completed |
|-------|-----------|--------|-----------|
| 1 | v1.0 | ✓ 完了 | 2024-03-20 |
| 2 | v1.0 | ✓ 完了 | 2024-03-20 |
| 3 | v1.0 | ✓ 完了 | 2024-03-20 |
| 4 | v1.1 | ○ 未着手 | - |

**Coverage v1.1:** 5/5 requirements mapped ✓
