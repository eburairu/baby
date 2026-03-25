## 2026-03-19 - AI Settings API Specification Drift
**学び:** A pattern of specification drift occurs when new backend configuration properties (like `llm_reasoning_effort` in `app/services/ai_settings.py`) are introduced but omitted from the corresponding TypeScript interfaces (e.g., `AISettings`) and initial seed data documented in `.specify/specs/settings/ai_settings.md`.
**アクション:** When analyzing AI settings endpoints, verify that any new backend configuration parameters are accurately reflected in the frontend's TypeScript interface definitions and initial seed data documentation.

## 2024-03-20 - 通知サービスの仕様書と実装のズレ修正
**学び:** `notification_center.md` において、将来実装予定の `notification_service.py` (`async def`) の仕様が記載されていたが、実際の実装は `app/utils/notifications.py` に同期的な `BackgroundTasks` を使って (`notify_family_members_bg` 等) 実装されていた。また、実績解除(`achievement`)等のトリガーに関するメソッド(`notify_achievements_bg`)の記載も漏れていたため、仕様と実装の間で不整合が発生していた。
**アクション:** 将来の実装や設計ドキュメントが、実際の実装（今回はFastAPIのBackgroundTasksを用いた通知ユーティリティ）と乖離しがちであることを念頭に、各種ドキュメントに記載された関数シグネチャと実際のコードとの一致を注視する。

## 2026-03-25 - ダッシュボード仕様書の統合レコードスキーマ実装同期
**学び:** `app/routers/baby.py` の `UnifiedRecord` (統合APIのレスポンススキーマ) と、フロントエンドの `BabyRecord` の型定義において、必須/任意の制約の乖離がありました。具体的には、API仕様書では `has_ai_feedback`, `has_ai_concern` 等が必須 (boolean) で定義されていましたが、フロントエンドではオプショナル (`boolean | undefined`) として扱われていました。バックエンドはデフォルト値を持って必須で返却していましたが、型としての堅牢性をフロントエンドの実装側に合わせる形で仕様書を修正しました。
**アクション:** 仕様書のレスポンススキーマのインターフェース名も `UnifiedRecord` からフロントエンド側の実装である `BabyRecord` に統一しました。今後もAPI仕様とフロントエンドの型定義（特にOptionalの扱い）のズレに注意して仕様書を同期します。
