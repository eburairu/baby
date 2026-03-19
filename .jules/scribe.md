## 2024-05-20 - AI Settings Drift Pattern
**学び:** バックエンド（app/services/ai_settings.py）で新しいシステム設定（llm_reasoning_effort）が追加されたが、対応する仕様書（.specify/specs/settings/ai_settings.md）の初期シードデータとTypeScriptインターフェース（AISettings）が更新されておらず、乖離が生じていた。
**アクション:** バックエンドで新しい設定プロパティを導入する際は、設定画面の仕様書のシードデータおよびフロントエンドで用いる型定義に必ず追記するよう監視する。
