# ロードマップ: Botoro

## Milestones

- [x] **v1.0 ダッシュボードUIのハニカム構造化** — Phase 1-3 (完了)
- [x] **v1.1 赤ちゃん情報ウィジェット** — Phase 4 (完了)
- [x] **v1.2 経過時間インジケーター** — Phase 5-7 (完了)

---

## v1.0 (完了) — Phase 1-3

ダッシュボードUIのハニカム構造化。全 REQ 達成。詳細: `.planning/milestones/v1.0-REQUIREMENTS.md`

---

## v1.1 (完了) — Phase 4

赤ちゃん情報ウィジェット。全 REQ 達成。

### Phase 4: 赤ちゃん情報ウィジェット

**Goal:** ユーザーがダッシュボード上でウィジェットから赤ちゃんの全情報にアクセスできる

**Requirements:** WIDGET-01, WIDGET-02, WIDGET-03, WIDGET-04, CLEANUP-01

**Success Criteria** (what must be TRUE):
  1. ダッシュボードのハニカムグリッド中段中央に赤ちゃんのイニシャル・名前・月齢が表示されたウィジェットが見える
  2. ウィジェットをタップするとポップアップが開き、名前・誕生日・月齢・性別・特徴（characteristics）が表示される
  3. ポップアップ内のリンクをタップすると赤ちゃんプロフィール編集ページに移動できる
  4. ダッシュボード上部に BabyProfileCard が存在せず、情報の重複がない

**Plans:** 2 plans

Plans:
- [x] 04-01-PLAN.md — BabyWidget + BabyInfoPopup コンポーネントを TDD で実装
- [x] 04-02-PLAN.md — ダッシュボードへの組み込みと BabyProfileCard 削除

---

## v1.2 (完了) — 経過時間インジケーター

**Milestone Goal:** 授乳・おむつウィジェットに経過時間プログレスインジケーターを追加し、前回記録からの経過を可視化する

## Phases

- [x] **Phase 5: バックエンド閾値API** - BabyスキーマにカスタムThreshold項目を追加しCRUD APIを提供する (完了)
- [x] **Phase 6: フロントエンドインジケーター** - 六角形ストロークによる経過時間プログレスを授乳・おむつウィジェットに実装する (完了)
- [x] **Phase 7: 閾値設定UI** - 設定画面でカスタム閾値を入力・保存できるUIを実装する (完了)

## Phase Details

### Phase 5: バックエンド閾値API (完了)
**Goal:** 家族が共有するカスタム閾値をバックエンドに保存・取得できる
**Depends on:** Phase 4
**Requirements:** THRES-03
**Success Criteria** (what must be TRUE):
  1. BabyプロフィールAPIのレスポンスに `feeding_threshold_minutes` と `diaper_threshold_minutes` フィールドが含まれる
  2. PATCHリクエストで閾値を更新すると、同じ家族の別ユーザーが取得したときも更新後の値が返る
  3. カスタム閾値未設定（null）のBabyでもAPIが正常に動作し、nullが返る

**Plans:** 2 plans
- [x] 05-01-PLAN.md — SQLAlchemy モデルと Pydantic スキーマの更新、テスト作成
- [x] 05-02-PLAN.md — Alembic マイグレーションと API ルーターの実装

### Phase 6: フロントエンドインジケーター (完了)
**Goal:** ユーザーが授乳・おむつウィジェットを見るだけで前回記録からの経過具合を直感的に把握できる
**Depends on:** Phase 5
**Requirements:** INDIC-01, INDIC-02, INDIC-03, INDIC-04, INDIC-05, THRES-01
**Success Criteria** (what must be TRUE):
  1. 授乳ウィジェットとおむつウィジェットの六角形外周に、経過時間の進捗を示す円弧ストロークが表示される
  2. ストロークの色が経過率に応じて緑（0–60%）→黄（60–80%）→赤（80–100%）と変化する
  3. 閾値を超過した場合、赤いストロークが点滅し視覚的に警告される
  4. 画面を開いたまま1分経過するとストロークが自動更新される
  5. 赤ちゃんの月齢が変わると警告閾値が自動的にガイドライン準拠の値に切り替わる（カスタム閾値未設定時）

**Plans:** 4 plans
- [x] 06-01-PLAN.md — TDD RED: thresholdUtils・indicatorUtils テスト作成
- [x] 06-02-PLAN.md — TDD GREEN: thresholdUtils・indicatorUtils 実装
- [x] 06-03-PLAN.md — HexagonProgressArc SVG コンポーネント + HexagonWidgetCard 統合
- [x] 06-04-PLAN.md — FeedingWidget・DiaperWidget・ダッシュボード統合

### Phase 7: 閾値設定UI (完了)
**Goal:** ユーザーが設定画面から赤ちゃんごとの閾値を自分の育児スタイルに合わせて変更できる
**Depends on:** Phase 5, Phase 6
**Requirements:** THRES-02
**Success Criteria** (what must be TRUE):
  1. 設定画面に赤ちゃんごとの授乳閾値・おむつ閾値の入力欄が表示される
  2. 値を変更して保存すると、ダッシュボードのインジケーターが即座に新しい閾値を反映する
  3. 同じ家族の別ユーザーがダッシュボードを開くと、保存されたカスタム閾値でインジケーターが表示される
  4. 入力欄を空にして保存すると月齢ベースの自動閾値に戻る

**Plans:** 1 plan
- [x] 07-01-PLAN.md — 赤ちゃん設定画面に閾値設定UIを実装 (完了)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1 | v1.0 | — | 完了 | 2024-03-20 |
| 2 | v1.0 | — | 完了 | 2024-03-20 |
| 3 | v1.0 | — | 完了 | 2024-03-20 |
| 4 | v1.1 | 2/2 | 完了 | 2026-02-28 |
| 5. バックエンド閾値API | v1.2 | 2/2 | 完了 | 2026-02-28 |
| 6. フロントエンドインジケーター | v1.2 | 4/4 | 完了 | 2026-03-01 |
| 7. 閾値設定UI | v1.2 | 1/1 | 完了 | 2026-03-01 |

**Coverage v1.2:** 8/8 requirements mapped
