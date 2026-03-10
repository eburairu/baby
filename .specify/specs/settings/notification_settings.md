# 通知設定仕様書 (Notification Settings Specification)

## 概要

プッシュ通知の許可状態の管理、通知を受け取る項目の選択、および「おやすみモード」の設定を行う画面。
ブラウザの Push API および PWA の通知機能を活用する。

## 1. 画面構成

`/settings/notifications` ページは以下の3つのカードで構成される。

### 1.1 通知のステータス

現在のブラウザ/デバイスの通知許可状態を表示・管理する。

- **ブラウザの通知許可**: 現在の `Notification.permission` の状態を表示。
  - `granted`: 「許可されています」
  - `denied`: 「ブロックされています」
  - `default`: 「未設定（クリックで許可を求める）」
- **有効にするボタン**: `default` 状態の場合に表示。クリックで `requestPermission()` を実行し、VAPID 鍵を使用して購読（Subscribe）処理を行う。
- **テスト通知を送信**: `granted` 状態の場合に表示。`POST /api/notifications/test` を呼び出し、実際に通知が届くか検証する。

### 1.2 通知項目

サーバー側で管理される通知の ON/OFF 設定。

- **家族の記録**: 家族が新しい記録を追加した際の通知。
- **授乳リマインダー**: 前回の授乳から一定時間経過した際のリマインダー。
- **オムツリマインダー**: 前回のオムツ替えから一定時間経過した際のリマインダー。
- **デイリーサマリー**: AI による1日のまとめが生成された際の通知。
- **システム通知**: 重要なお知らせやアップデート情報の通知。

### 1.3 おやすみモード

特定の時間帯に通知を抑制する設定。

- **有効化スイッチ**: おやすみモードの ON/OFF。
- **開始時間 / 終了時間**: スイッチが ON の場合に表示。通知を送信しない時間帯を `HH:mm` 形式で指定する。

## 2. データ構造 (Backend API)

### 2.1 エンドポイント

- `GET /api/notifications/settings`: 現在の設定を取得。
- `PATCH /api/notifications/settings`: 設定の一部または全部を更新。

### 2.2 設定スキーマ (`NotificationSettings`)

| フィールド | 型 | 説明 |
|-----------|---|------|
| `family_record_enabled` | `boolean` | 家族の記録通知 |
| `feeding_reminder_enabled` | `boolean` | 授乳リマインダー |
| `diaper_reminder_enabled` | `boolean` | オムツリマインダー |
| `daily_summary_enabled` | `boolean` | デイリーサマリー通知 |
| `system_notice_enabled` | `boolean` | システム通知 |
| `dnd_start_time` | `string \| null` | おやすみモード開始時間 (HH:mm) |
| `dnd_end_time` | `string \| null` | おやすみモード終了時間 (HH:mm) |

## 3. 実装の注意事項

- **PWA 対応**: iOS 等の一部のデバイスでは、ホーム画面に追加（PWA化）されていないと通知が有効にならない。非対応デバイス/ブラウザの場合はその旨を説明するメッセージを表示する。
- **VAPID 鍵**: 通知の購読には環境変数 `NEXT_PUBLIC_VAPID_PUBLIC_KEY` が必要。
- **トースト通知**: 設定変更の成功/失敗をトースト (`sonner`) でユーザーに通知する。
