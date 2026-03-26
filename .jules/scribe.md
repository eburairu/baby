## 2026-03-19 - AI Settings API Specification Drift
**学び:** A pattern of specification drift occurs when new backend configuration properties (like `llm_reasoning_effort` in `app/services/ai_settings.py`) are introduced but omitted from the corresponding TypeScript interfaces (e.g., `AISettings`) and initial seed data documented in `.specify/specs/settings/ai_settings.md`.
**アクション:** When analyzing AI settings endpoints, verify that any new backend configuration parameters are accurately reflected in the frontend's TypeScript interface definitions and initial seed data documentation.

## 2024-03-20 - 通知サービスの仕様書と実装のズレ修正
**学び:** `notification_center.md` において、将来実装予定の `notification_service.py` (`async def`) の仕様が記載されていたが、実際の実装は `app/utils/notifications.py` に同期的な `BackgroundTasks` を使って (`notify_family_members_bg` 等) 実装されていた。また、実績解除(`achievement`)等のトリガーに関するメソッド(`notify_achievements_bg`)の記載も漏れていたため、仕様と実装の間で不整合が発生していた。
**アクション:** 将来の実装や設計ドキュメントが、実際の実装（今回はFastAPIのBackgroundTasksを用いた通知ユーティリティ）と乖離しがちであることを念頭に、各種ドキュメントに記載された関数シグネチャと実際のコードとの一致を注視する。
## 2026-03-26 - APIページネーション上限値と仕様書の同期
**学び:** `MAX_PAGINATION_LIMIT` のようなアプリケーション全体に適用される定数が変更された際、各機能固有の仕様書（ダッシュボードのAPI仕様など）にベタ書きされた制約数値（例: `max: 100`）が見落とされ、実装と仕様の間に乖離が生じることがある。定数変更の影響範囲は広いため、影響を受ける全ての関連仕様書をgrepなどで検索し網羅的に更新する必要がある。
**アクション:** 将来的にAPIの制約や制限に関する数値を変更する場合は、コードベース内の定数定義だけでなく、`.specify/specs/` ディレクトリ全体に対してその数値を検索し、追随して仕様書を更新するフローを導入する。
