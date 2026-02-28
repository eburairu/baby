---
phase: 05-api
verified: 2026-02-28T14:30:00Z
status: passed
score: 6/6 must-haves verified
re_verification: false
---

# Phase 5: api (バックエンド閾値API) Verification Report

**Phase Goal:** Baby API に feeding_threshold_minutes / diaper_threshold_minutes を追加し、家族共有のバックエンド閾値APIを実装する（THRES-03）
**Verified:** 2026-02-28T14:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | GET /api/babies/ のレスポンスに feeding_threshold_minutes と diaper_threshold_minutes が含まれる | VERIFIED | BabyResponse は BabyBase を継承。BabyBase に両フィールドが Optional[int] = None で定義済み。GET / は response_model=List[BabyResponse] |
| 2  | 両フィールドは未設定時に null を返す | VERIFIED | 両フィールドは Optional[int] = None。モデル側も nullable=True。デフォルトは NULL |
| 3  | PATCH /api/babies/{id} で閾値を更新すると次のGETで更新後の値が返る | VERIFIED | BabyUpdate に両フィールド追加済み。update_baby_service が model_dump(exclude_unset=True) + hasattr で部分更新を処理。PATCH エンドポイントは response_model=BabyResponse |
| 4  | pytest tests/test_baby_thresholds.py が全件 GREEN になる | VERIFIED | SUMMARY (05-02) が 5/5 PASSED と記録。コミット 9b2b134 でテスト GREEN を確認。テストコードは実際のエンドポイントを呼ぶ実装テスト（スタブではない） |
| 5  | frontend/openapi.json が更新されている | VERIFIED | frontend/openapi.json に feeding_threshold_minutes と diaper_threshold_minutes が BabyCreate・BabyResponse・BabyUpdate の3スキーマすべてに含まれている |
| 6  | Alembicマイグレーションファイルが作成されている | VERIFIED | alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py が存在。down_revision=f2e3d4c5（前のHEAD）。upgrade() で babies テーブルに両カラムを追加。downgrade() で削除 |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/models/baby.py` | feeding_threshold_minutes, diaper_threshold_minutes カラム追加済み | VERIFIED | 行17-18 に `Column(Integer, nullable=True)` で両カラム定義済み |
| `app/schemas/baby.py` | BabyBase, BabyUpdate, BabyResponse に両フィールド追加済み | VERIFIED | BabyBase(行12-13)・BabyUpdate(行26-27)に Optional[int]=None。BabyResponse は BabyBase 継承で自動対応 |
| `alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py` | 新規マイグレーション | VERIFIED | ファイル存在確認済み。revision='a1b2c3d4e5f0', down_revision='f2e3d4c5' |
| `frontend/openapi.json` | 最新スキーマ反映済み | VERIFIED | feeding_threshold_minutes が行357・517・612、diaper_threshold_minutes が行334・490・589 に存在 |
| `tests/test_baby_thresholds.py` | 5つのテスト関数を含む | VERIFIED | 5関数定義済み。auth_client フィクスチャ使用。THRES-03 コメント含む |
| `app/routers/baby.py` | create_baby の Baby() コンストラクタに閾値フィールド追加 | VERIFIED | 行90-91 に feeding_threshold_minutes=baby_in.feeding_threshold_minutes, diaper_threshold_minutes=baby_in.diaper_threshold_minutes |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| BabyUpdate の閾値フィールド | DB保存 | update_baby_service (model_dump + hasattr) | WIRED | update_baby_service は exclude_unset=True で部分更新し、hasattr チェックでモデルに反映。BabyUpdate に両フィールドが追加されているため通過する |
| BabyResponse の閾値フィールド | GET /api/babies/ | response_model=List[BabyResponse] | WIRED | router.get("/") が response_model=List[BabyResponse] を使用。BabyResponse は BabyBase を継承し両フィールドを含む |
| BabyCreate の閾値フィールド | Baby() コンストラクタ | routers/baby.py create_baby | WIRED | app/routers/baby.py 行90-91 に明示的に feeding_threshold_minutes=baby_in.feeding_threshold_minutes, diaper_threshold_minutes=baby_in.diaper_threshold_minutes |
| Alembicマイグレーション | babies テーブル | op.add_column | WIRED | upgrade() が babies テーブルに sa.Integer(nullable=True) で両カラムを追加 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| THRES-03 | 05-01-PLAN.md, 05-02-PLAN.md | 家族共有の授乳・おむつ閾値をバックエンドのBabyプロフィールに保存・取得 | SATISFIED | モデル・スキーマ・マイグレーション・ルーター・openapi.json がすべて更新済み。テスト5件 GREEN。クロスユーザー検証は Phase 7 で行う設計（SUMMARY に記録） |

**Note:** .planning/REQUIREMENTS.md は別プロジェクト（ダッシュボードのハニカム構造化）の要件ドキュメントであり、THRES-03 はそこに定義されていない。THRES-03 は計画ファイル (05-01-PLAN.md, 05-02-PLAN.md) および STATE.md に定義されており、実装によって満たされていることを確認した。

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | なし | — | — |

スキャン対象: app/models/baby.py, app/schemas/baby.py, app/routers/baby.py, tests/test_baby_thresholds.py
TODO / FIXME / PLACEHOLDER / return null / 空ハンドラ — いずれも検出されなかった。

### Human Verification Required

#### 1. 本番DB（Neon develop ブランチ）へのマイグレーション適用確認

**Test:** `alembic upgrade head` を develop ブランチに対して実行し、babies テーブルに feeding_threshold_minutes と diaper_threshold_minutes カラムが追加されることを確認する
**Expected:** マイグレーションが正常完了し、カラムが存在する
**Why human:** CI/テストはインメモリ SQLite を使用するため、Neon PostgreSQL への実際のマイグレーション適用は PR マージ後に手動で行う必要がある（SUMMARY に明記）

#### 2. フロントエンド型生成の動作確認

**Test:** `cd frontend && pnpm generate` を実行し、生成された型に feeding_threshold_minutes と diaper_threshold_minutes が含まれることを確認する
**Expected:** 型定義ファイルに両フィールドが Optional で生成される
**Why human:** openapi.json は正しく更新されているが、型生成コマンドの実行結果は静的解析では確認できない

---

## Summary

Phase 5 のゴール（バックエンド閾値API）は完全に達成されている。

検証した6項目すべてがパスした:

1. `app/models/baby.py` に両カラムが `Column(Integer, nullable=True)` で追加済み
2. `app/schemas/baby.py` の BabyBase・BabyUpdate に `Optional[int] = None` で追加済み（BabyResponse は継承で自動対応）
3. `app/routers/baby.py` の create_baby コンストラクタに明示的に両フィールドを追加（プランの「変更不要」という誤った前提をエグゼキューターが自力で修正した）
4. `alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py` が down_revision=f2e3d4c5 で作成済み
5. `frontend/openapi.json` に3つのスキーマ(BabyCreate・BabyUpdate・BabyResponse)すべてで両フィールドが反映済み
6. `tests/test_baby_thresholds.py` に5テスト関数が実装され、SUMMARY では全件 PASSED と記録されている

アンチパターンは検出されなかった。本番DB（Neon）へのマイグレーション適用とフロントエンド型生成の実行確認のみ人間による検証が必要。

---

_Verified: 2026-02-28T14:30:00Z_
_Verifier: Claude (gsd-verifier)_
