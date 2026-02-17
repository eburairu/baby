# PWA プッシュ通知機能 仕様書 (PWA Push Notifications Specification)

## 1. 概要

本ドキュメントは、Baby App における PWA プッシュ通知機能の仕様を定義します。
Web Push API を使用して、ユーザーのデバイス（スマートフォン、PC）にタイムリーな通知を届けます。
また、ユーザーが通知の種類ごとに受信設定を行えるようにします。

## 2. 目的

* **リマインダー**: 次の授乳やオムツ替えの時間を通知し、育児をサポートする。
* **リアルタイム共有**: 家族が記録を追加した際に通知を受け取り、状況をリアルタイムに把握できるようにする。
* **ユーザーエンゲージメント**: デイリーサマリーの生成通知などを通じて、アプリの利用を促す。

## 3. 用語定義

| 用語 | 定義 |
| :--- | :--- |
| **Web Push API** | ブラウザがサーバーからプッシュメッセージを受け取るための標準API |
| **VAPID** | プッシュサーバーへのリクエストを認証するための公開鍵・秘密鍵ペア |
| **Service Worker** | ブラウザのバックグラウンドで動作し、プッシュイベントを処理するスクリプト |
| **PushSubscription** | ユーザーのブラウザがプッシュ通知を受信するために必要なエンドポイント情報 |
| **通知項目 (Preferences)** | ユーザーが個別にON/OFF設定できる通知の種類 |

## 4. 機能要件

### 4.1. 通知項目 (Notification Items)

ユーザーは以下の項目について、通知を受け取るかどうかを個別に設定できる。

| 項目名 | 説明 | トリガー条件 |
| :--- | :--- | :--- |
| **家族の記録** | 家族メンバーが新しい記録を追加したとき | 授乳、オムツ、睡眠、メモ、身長体重の保存時 |
| **授乳リマインダー** | 前回の授乳から一定時間経過したとき | 前回完了から3時間（設定可能にするかは検討） |
| **オムツリマインダー** | 前回のオムツ替えから一定時間経過したとき | 前回完了から3時間（設定可能にするかは検討） |
| **デイリーサマリー** | AIによる1日のまとめが生成されたとき | 毎日決まった時間、または生成完了時 |
| **重要なお知らせ** | システムのメンテナンスやアップデート情報 | 管理者による送信 |

### 4.2. 通知設定 UI (Settings UI)

* **エントリポイント**: `/settings/notifications` を新設し、設定メニューに追加。
* **プッシュ通知の許可**: ページ上部に「通知を有効にする」ボタンを配置。未許可の場合はブラウザの許可ダイアログを表示する。
* **各項目のトグル**: 4.1 の項目をトグルスイッチで設定。
* **おやすみモード (Do Not Disturb)**: 指定した時間帯（例: 22:00 - 07:00）は通知を送信しない設定。

### 4.3. 通知の動作

* **フォアグラウンド**: アプリを開いている間も通知（バナー）を表示する。
* **バックグラウンド**: アプリを閉じている、またはデバイスがスリープ状態でも通知を表示する。
* **通知のタップ**: 通知をタップすると、関連する画面（例: 家族の記録なら該当の記録詳細、リマインダーなら入力画面）へ遷移する。

## 5. データベース設計

### 5.1. `push_subscriptions` テーブル

プッシュ通知の配信先情報を保存する。1ユーザーが複数のデバイス（ブラウザ）を持つことを許容する。

```sql
CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5.2. `notification_settings` テーブル

ユーザーごとの通知設定を保存する。

```sql
CREATE TABLE notification_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    family_record_enabled BOOLEAN DEFAULT TRUE,
    feeding_reminder_enabled BOOLEAN DEFAULT FALSE,
    diaper_reminder_enabled BOOLEAN DEFAULT FALSE,
    daily_summary_enabled BOOLEAN DEFAULT TRUE,
    system_notice_enabled BOOLEAN DEFAULT TRUE,
    dnd_start_time TIME, -- おやすみモード開始
    dnd_end_time TIME,   -- おやすみモード終了
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 6. 技術設計

### 6.1. バックエンド (FastAPI)

* **ライブラリ**: `pywebpush` (Web Push送信用)
* **エンドポイント**:
    * `POST /api/notifications/subscribe`: `PushSubscription` を保存。
    * `POST /api/notifications/unsubscribe`: `PushSubscription` を削除。
    * `GET /api/notifications/settings`: 通知設定を取得。
    * `PATCH /api/notifications/settings`: 通知設定を更新。
* **環境変数**:
    * `VAPID_PUBLIC_KEY`: 公開鍵
    * `VAPID_PRIVATE_KEY`: 秘密鍵
    * `VAPID_CLAIM_EMAIL`: 送信元の連絡先メールアドレス

### 6.2. フロントエンド (Next.js)

* **Service Worker (`frontend/public/sw.js`)**:
    * `push` イベントをリッスンし、`self.registration.showNotification()` を実行。
    * `notificationclick` イベントでアプリをフォカスし、URLへ遷移。
* **通知管理ユーティリティ**:
    * `Notification.requestPermission()` による許可取得。
    * `serviceWorker.pushManager.subscribe()` による購読生成。

## 7. 実装ステップ (予定)

1. **環境構築**: VAPIDキーの生成と環境変数への設定。
2. **データベース**: マイグレーションの作成 (`push_subscriptions`, `notification_settings`)。
3. **バックエンド API**: 購読保存と設定管理のエンドポイント実装。
4. **Service Worker**: `push` イベント処理の実装。
5. **フロントエンド UI**: 通知設定画面の作成と購読処理の実装。
6. **通知送信ロジック**: 記録保存などのトリガーに合わせたプッシュ送信処理の実装。

## 8. セキュリティ・考慮事項

* **ペイロードの暗号化**: `pywebpush` により自動で行われるが、鍵の管理を厳重にする。
* **おやすみモードの考慮**: 送信直前にユーザーの設定を確認し、時間帯内であれば送信をスキップまたは遅延させる。
* **購読のクリーンアップ**: ブラウザ側で購読が解除された場合や、プッシュサーバーから `410 Gone` が返された場合はDBから削除する。
* **iOS の制限**: iOS 16.4 以降かつホーム画面に追加された PWA でのみ動作することをユーザーに明示する。
