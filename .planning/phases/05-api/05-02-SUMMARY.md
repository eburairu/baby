---
phase: 05-api
plan: 02
subsystem: api
tags: [fastapi, sqlalchemy, alembic, pydantic, openapi, baby, thresholds]

# Dependency graph
requires:
  - phase: 05-01
    provides: TDD RED フェーズテスト（tests/test_baby_thresholds.py）
provides:
  - feeding_threshold_minutes と diaper_threshold_minutes の Baby モデル・スキーマ対応
  - Alembic マイグレーション（a1b2c3d4e5f0）
  - openapi.json 閾値フィールド反映
affects: [06-frontend, 07-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [nullable Integer カラム追加パターン（モデル＋スキーマ＋マイグレーション＋ルーター同時対応）]

key-files:
  created:
    - alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py
  modified:
    - app/models/baby.py
    - app/schemas/baby.py
    - app/routers/baby.py
    - frontend/openapi.json

key-decisions:
  - "create_baby ルーターは Baby() コンストラクタに新フィールドを明示列挙するパターンのため、新カラム追加時はルーターも必ず修正が必要"

patterns-established:
  - "新 nullable カラム追加時: モデル・スキーマ・マイグレーション・ルーター（create エンドポイントの Baby() コンストラクタ）の4点セットで修正する"

requirements-completed: [THRES-03]

# Metrics
duration: 8min
completed: 2026-02-28
---

# Phase 5 Plan 02: 閾値フィールド実装フェーズ Summary

**Baby モデル・スキーマに feeding_threshold_minutes / diaper_threshold_minutes を追加し、Alembic マイグレーション・ルーター修正・openapi.json 更新で全5テスト GREEN**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-28T14:10:00Z
- **Completed:** 2026-02-28T14:18:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- app/models/baby.py に feeding_threshold_minutes と diaper_threshold_minutes (Integer, nullable=True) を追加
- app/schemas/baby.py の BabyBase・BabyUpdate に Optional[int] = None で両フィールドを追加（BabyResponse は継承により自動対応）
- alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py を新規作成（down_revision=f2e3d4c5）
- app/routers/baby.py の create_baby で Baby() コンストラクタに両フィールドを追加（バグ修正）
- frontend/openapi.json を最新スキーマに更新
- pytest tests/test_baby_thresholds.py 全5件 PASSED、全体152件 PASSED

## Task Commits

Each task was committed atomically:

1. **Task 1: Baby モデルとスキーマに閾値フィールドを追加** - `3bb6dd9` (feat)
2. **Task 2: Alembicマイグレーション・ルーター修正・openapi.json更新** - `9b2b134` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `app/models/baby.py` - feeding_threshold_minutes と diaper_threshold_minutes カラム追加
- `app/schemas/baby.py` - BabyBase と BabyUpdate に Optional[int] = None で両フィールド追加
- `app/routers/baby.py` - create_baby の Baby() コンストラクタに閾値フィールド追加（バグ修正）
- `alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py` - 閾値カラム追加マイグレーション新規作成
- `frontend/openapi.json` - 閾値フィールドを含む最新スキーマに更新

## Decisions Made
- プランでは「app/routers/baby.py は変更不要」と記載されていたが、create_baby の Baby() コンストラクタがフィールドを明示列挙するパターンのため修正が必須だった。新カラム追加時はルーターも4点セットで修正するパターンを確立。

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] create_baby ルーターに閾値フィールドを追加**
- **Found during:** Task 2（テスト実行時に test_create_baby_with_thresholds が FAILED）
- **Issue:** プランでは「ルーター変更不要」と記載されていたが、create_baby 関数の Baby() コンストラクタがフィールドを明示列挙するパターンのため、feeding_threshold_minutes / diaper_threshold_minutes が渡されず NULL になっていた
- **Fix:** app/routers/baby.py の Baby() コンストラクタに feeding_threshold_minutes=baby_in.feeding_threshold_minutes と diaper_threshold_minutes=baby_in.diaper_threshold_minutes を追加
- **Files modified:** app/routers/baby.py
- **Verification:** pytest tests/test_baby_thresholds.py 全5件 PASSED
- **Committed in:** 9b2b134 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** ルーターへの修正は正確な動作に必須。スコープクリープなし。

## Issues Encountered
- プランの「ルーター変更不要」という前提が誤りだった。update_baby_service は model_dump(exclude_unset=True) + hasattr で汎用的に動作するが、create_baby は Baby() コンストラクタでフィールドを明示列挙しているため新フィールドを手動追加が必要。

## Self-Check: PASSED
- app/models/baby.py: feeding_threshold_minutes, diaper_threshold_minutes FOUND
- app/schemas/baby.py: BabyBase と BabyUpdate に両フィールド FOUND
- alembic/versions/a1b2c3d4e5f0_add_threshold_columns_to_babies.py: FOUND
- frontend/openapi.json: feeding_threshold_minutes, diaper_threshold_minutes FOUND
- commit 3bb6dd9: FOUND in git log
- commit 9b2b134: FOUND in git log
- pytest tests/test_baby_thresholds.py: 5/5 PASSED

## User Setup Required
None - テスト用DBはインメモリSQLiteのため自動対応。本番DBへのマイグレーション（`alembic upgrade head`）は PR マージ後に別途実施。

## Next Phase Readiness
- THRES-03 バックエンド実装完了。閾値フィールド付きの Baby API が動作する
- Phase 6（フロントエンド閾値UI）で feeding_threshold_minutes / diaper_threshold_minutes を利用可能
- frontend/openapi.json 更新済みのため型生成（pnpm generate）でフロントエンド型を利用可能

---
*Phase: 05-api*
*Completed: 2026-02-28*
