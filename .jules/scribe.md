## 2026-03-19 - AI Settings API Specification Drift
**学び:** A pattern of specification drift occurs when new backend configuration properties (like `llm_reasoning_effort` in `app/services/ai_settings.py`) are introduced but omitted from the corresponding TypeScript interfaces (e.g., `AISettings`) and initial seed data documented in `.specify/specs/settings/ai_settings.md`.
**アクション:** When analyzing AI settings endpoints, verify that any new backend configuration parameters are accurately reflected in the frontend's TypeScript interface definitions and initial seed data documentation.

## 2024-03-20 - 通知サービスの仕様書と実装のズレ修正
**学び:** `notification_center.md` において、将来実装予定の `notification_service.py` (`async def`) の仕様が記載されていたが、実際の実装は `app/utils/notifications.py` に同期的な `BackgroundTasks` を使って (`notify_family_members_bg` 等) 実装されていた。また、実績解除(`achievement`)等のトリガーに関するメソッド(`notify_achievements_bg`)の記載も漏れていたため、仕様と実装の間で不整合が発生していた。
**アクション:** 将来の実装や設計ドキュメントが、実際の実装（今回はFastAPIのBackgroundTasksを用いた通知ユーティリティ）と乖離しがちであることを念頭に、各種ドキュメントに記載された関数シグネチャと実際のコードとの一致を注視する。

## 2024-05-18 - ページネーション最大許容件数(MAX_PAGINATION_LIMIT)のズレの修正
**学び:** バックエンド（`app/core/constants.py`）で `MAX_PAGINATION_LIMIT = 500` と定義されているにも関わらず、各機能の仕様書（`.specify/specs/`）に散在する API の `limit` 記述が `100` のままであるという仕様と実装の乖離が発生していた。仕様書にハードコードされたマジックナンバーは実装の変更に追従しにくく、陳腐化しやすい。
**アクション:** 仕様書内のすべてのページネーション `limit` のデフォルト/最大値を `500` に更新し、コード側の定数と同期させた。
