## 概要
AIフィードバックおよび育児日誌生成において、Gemini 2.0 Thinking などの思考プロセスを出力するモデルを使用した場合に、回答が `max_tokens` 制限に達して途中で途切れてしまう（finishReason: "MAX_TOKENS"）問題を修正しました。

## 変更内容
- `app/services/ai_feedback.py`: `max_tokens` のデフォルト値を 512 から 2048 に引き上げ。
- `app/services/ai_summary.py`: 育児日誌生成の `max_tokens` を 600 から 2048 に、特徴更新を 400 から 1024 に引き上げ。
- データベースマイグレーションを追加し、`system_settings` テーブルの `llm_max_tokens` 設定を 800 から 2048 に更新。
- 各所の `max_tokens` および `temperature` 設定において、DBから取得した値を安全に数値型（int/float）へキャストするように修正。

## 確認事項
- [x] `sh scripts/verify_all.sh` が正常にパスすること。
- [x] マイグレーションファイルが正しく生成・実行可能であること。

Closes #226
