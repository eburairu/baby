# アプリ内通知センター 仕様書

## 1. 概要

本ドキュメントは、ダッシュボードのヘッダーにアプリ内通知センターを追加する機能の仕様を定義する。
家族の記録追加やコメントなどのイベントをアプリ内で通知し、未読・既読を管理できるようにする。

### PWA プッシュ通知との統合方針

本機能は `pwa_notifications.md` に定義する PWA プッシュ通知と**共通の通知生成サービス・テーブル**を使って動作する。

| 側面 | 本仕様（通知センター） | PWA プッシュ通知 |
|------|----------------------|-----------------|
| 目的 | アプリを開いた際の通知インボックス | デバイスへのバックグラウンドプッシュ |
| 保存先 | `app_notifications` テーブル | `push_subscriptions` テーブル（配信先情報のみ） |
| 設定管理 | `notification_settings` テーブルを共通参照 | 同上 |
| 生成元 | `notification_service.py` が一元管理 | 同上 |

**統合フロー（通知生成の流れ）**:

```
トリガー（記録追加・コメント等）
    ↓
notification_service.py の notify_*() を呼び出す
    ↓
① app_notifications テーブルに通知を INSERT（常時）
    ↓
② notification_settings を参照して受信設定を確認
    ↓
③ push_subscriptions を参照してプッシュ送信（PWA 実装後）
    ↓
（フォアグラウンド時）BroadcastChannel 経由で通知センターをリアルタイム更新
```

---

## 2. 機能要件

### 2.1 ヘッダーの通知ベルアイコン

- ダッシュボードヘッダー右側に `Bell`（Lucide React）アイコンを配置する。
- 未読通知が存在する場合、アイコン右上に赤バッジで未読数を表示する（最大表示: 99、超過時は `99+`）。
- アイコンをタップするとドロップダウンを開く。

### 2.2 通知ドロップダウン

- 最新 **20 件**の通知を降順で表示する。
- 各通知行に以下を表示する：
  - 通知タイプアイコン（Lucide React）
  - タイトル
  - 本文（1行省略）
  - 経過時間（例: `3分前`、`2時間前`、`昨日`）
  - 未読インジケーター（左端の青丸）
- 通知行をタップすると、該当 URL に遷移し、その通知を**既読**にする。
- ドロップダウンの上部に「**すべて既読にする**」ボタンを配置する。
- 通知がゼロ件の場合は「通知はありません」という空状態を表示する。

### 2.3 未読・既読管理

| 操作 | 挙動 |
|------|------|
| 通知行をタップ | 対象通知を既読にし、URL へ遷移 |
| 「すべて既読にする」タップ | ログインユーザーの全通知を一括既読 |
| ドロップダウン外をタップ | ドロップダウンを閉じる（既読状態は変更しない） |

### 2.4 通知の種類

`pwa_notifications.md` の通知項目と統一した種類定義とする。

| type | トリガー | タイトル例 | アイコン |
|------|----------|-----------|---------|
| `family_record` | 家族が記録（授乳・おむつ・睡眠・成長・陣痛・メモ）を追加 | 「パパが授乳を記録しました」 | `Baby` |
| `comment` | 自分の記録に家族がコメント追加 | 「ママがコメントしました」 | `MessageCircle` |
| `daily_summary` | AI デイリーサマリーが生成完了 | 「今日の育児まとめができました」 | `Sparkles` |
| `feeding_reminder` | 前回の授乳から一定時間経過 | 「授乳の時間かもしれません」 | `Clock` |
| `diaper_reminder` | 前回のおむつ替えから一定時間経過 | 「おむつ替えの時間かもしれません」 | `Clock` |
| `system` | システムメッセージ（メンテナンス・アップデート情報等） | 「アプリが更新されました」 | `Bell` |

> **注意**: `comment` は PWA 仕様では `family_record` カテゴリに含まれているが、アプリ内通知センターでは視認性のため独立した `type` として扱う。

### 2.5 通知設定との連動

`notification_settings` テーブル（`pwa_notifications.md` で定義）の設定は、アプリ内通知センターにも適用する。
ユーザーが特定の通知種別をオフに設定した場合、`app_notifications` テーブルへの INSERT 自体をスキップする。

| `notification_settings` カラム | 対象 type |
|-------------------------------|-----------|
| `family_record_enabled` | `family_record`、`comment` |
| `feeding_reminder_enabled` | `feeding_reminder` |
| `diaper_reminder_enabled` | `diaper_reminder` |
| `daily_summary_enabled` | `daily_summary` |
| `system_notice_enabled` | `system` |

---

## 3. データベース設計

### `app_notifications` テーブル

```sql
CREATE TABLE app_notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    -- 'family_record' | 'comment' | 'daily_summary'
    -- | 'feeding_reminder' | 'diaper_reminder' | 'system'
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    url         VARCHAR(512),            -- タップ時の遷移先（null の場合は遷移なし）
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_notifications_user_unread
    ON app_notifications (user_id, is_read, created_at DESC);
```

> **注意**: 大量の通知蓄積を防ぐため、`created_at` が 90 日以上経過した通知をバッチ削除する運用を推奨する（将来タスク）。

---

## 4. API 設計

### 通知センター（アプリ内通知）のエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/notifications` | 通知一覧取得（最新 20 件） |
| `GET` | `/api/notifications/unread-count` | 未読数取得 |
| `PATCH` | `/api/notifications/{id}/read` | 個別通知を既読にする |
| `PATCH` | `/api/notifications/read-all` | 全通知を一括既読にする |

> **PWA 関連エンドポイント**（`/api/notifications/subscribe` 等）は `pwa_notifications.md` に定義する。
> 同一ルーターファイル（`app/routers/notifications.py`）にまとめて実装する。

### レスポンス型

```typescript
// GET /api/notifications
type AppNotification = {
  id: number;
  type:
    | 'family_record'
    | 'comment'
    | 'daily_summary'
    | 'feeding_reminder'
    | 'diaper_reminder'
    | 'system';
  title: string;
  body: string | null;
  url: string | null;
  is_read: boolean;
  created_at: string; // ISO 8601
};

// GET /api/notifications/unread-count
type UnreadCountResponse = {
  count: number;
};
```

---

## 5. フロントエンド実装

### 5.1 コンポーネント構成

| ファイルパス | 役割 |
|-------------|------|
| `frontend/components/notifications/NotificationBell.tsx` | ヘッダー内のベルアイコン + 未読バッジ。ドロップダウンを制御する |
| `frontend/components/notifications/NotificationDropdown.tsx` | 通知リストのドロップダウン UI |
| `frontend/components/notifications/NotificationItem.tsx` | 個別通知行コンポーネント |

### 5.2 データフェッチ戦略

- **未読数**: `SWR` で `/api/notifications/unread-count` を **30 秒間隔**でポーリング。ヘッダーバッジに反映する。
- **通知リスト**: ドロップダウンが開いたタイミングで `/api/notifications` をフェッチ（`revalidateOnFocus: true`）。

### 5.3 PWA プッシュ通知受信時のリアルタイム更新

Service Worker がプッシュ通知を受信した際、フォアグラウンドで開いているアプリの通知センターもリアルタイムに更新する。

**仕組み（BroadcastChannel API）**:

```
Service Worker (sw.js)
  push イベント受信
    → self.registration.showNotification() でデバイス通知を表示
    → BroadcastChannel('notifications') に { type: 'PUSH_RECEIVED' } を送信

フロントエンド (NotificationBell.tsx)
  BroadcastChannel('notifications') をリッスン
    → { type: 'PUSH_RECEIVED' } 受信時に SWR の unread-count と notification list を revalidate
```

```typescript
// NotificationBell.tsx での受信例
useEffect(() => {
  const channel = new BroadcastChannel('notifications');
  channel.onmessage = (event) => {
    if (event.data?.type === 'PUSH_RECEIVED') {
      mutateUnreadCount();
    }
  };
  return () => channel.close();
}, [mutateUnreadCount]);
```

```javascript
// sw.js での送信例
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url },
    })
  );
  // フォアグラウンドの通知センターを更新
  const channel = new BroadcastChannel('notifications');
  channel.postMessage({ type: 'PUSH_RECEIVED' });
});
```

### 5.4 ヘッダーへの組み込み

`app/(dashboard)/layout.tsx`（または `DashboardLayout`）の右側要素に `NotificationBell` を追加する。

**配置順（右側要素）**:

1. `NotificationBell`（通知）← **新規追加**
2. `ThemeToggle`（ダークモード切り替え）
3. 設定ページへのリンク（ギアアイコン）

---

## 6. 通知生成ロジック

### 6.1 通知生成サービス

`app/services/notification_service.py` に通知生成ユーティリティを集約する。
アプリ内通知（`app_notifications`）の INSERT と PWA プッシュ送信（`pywebpush`）の両方をこのサービスから行う。

```python
async def notify_family_record(
    db: AsyncSession,
    actor_user_id: int,  # 記録を追加したユーザー
    baby_id: int,
    record_type: str,    # 'feeding' | 'diaper' | 'sleep' | 'growth' ...
    record_url: str,     # 遷移先 URL
) -> None:
    """
    1. 同ファミリーの記録者以外のメンバーを取得
    2. 各メンバーの notification_settings を確認
    3. family_record_enabled = True のメンバーのみ app_notifications に INSERT
    4. （PWA 実装後）push_subscriptions を参照してプッシュ通知を送信
    """
    ...

async def notify_comment(
    db: AsyncSession,
    record_owner_id: int,
    commenter_user_id: int,
    record_url: str,
) -> None:
    """
    記録オーナーに comment 通知を送信。
    オーナー == コメント投稿者の場合はスキップ。
    """
    ...

async def notify_reminder(
    db: AsyncSession,
    user_id: int,
    reminder_type: str,  # 'feeding_reminder' | 'diaper_reminder'
) -> None:
    """
    リマインダー通知を生成。
    notification_settings の feeding_reminder_enabled / diaper_reminder_enabled を確認。
    """
    ...
```

### 6.2 通知が生成されるトリガー

| トリガー | 通知 type | 通知受信者 | 除外条件 |
|---------|----------|----------|---------|
| 記録追加（授乳・おむつ・睡眠・成長・陣痛・メモ） | `family_record` | 同ファミリーの**記録者以外**の全メンバー | 記録者自身は除外 |
| コメント追加 | `comment` | **記録オーナー** | コメント投稿者と記録オーナーが同一の場合は除外 |
| デイリーサマリー生成 | `daily_summary` | 同ファミリーの**全メンバー** | なし |
| 授乳リマインダー（バッチ処理） | `feeding_reminder` | 対象ユーザー | `feeding_reminder_enabled = False` の場合はスキップ |
| オムツリマインダー（バッチ処理） | `diaper_reminder` | 対象ユーザー | `diaper_reminder_enabled = False` の場合はスキップ |
| システムメッセージ | `system` | 指定ユーザー or 全ユーザー | なし |

### 6.3 各ルーターからの呼び出し

記録保存の各エンドポイント（`app/routers/feeding.py` 等）において、DB へのコミット後に `notify_family_record()` を非同期で呼び出す。

---

## 7. 実装ステップ

### フェーズ 1: アプリ内通知センター（本仕様）

1. **DB マイグレーション**: `app_notifications` テーブルを作成する Alembic マイグレーションを生成する。
2. **バックエンドモデル・スキーマ**: `app/models/app_notification.py`、`app/schemas/notification.py` を作成する。
3. **通知サービス**: `app/services/notification_service.py` を作成する。
4. **API エンドポイント**: `app/routers/notifications.py` を作成し、`app/main.py` に登録する。
5. **OpenAPI 型生成**: `python scripts/export_openapi.py` を実行し、フロントエンドの型を更新する。
6. **フロントエンドコンポーネント**: `NotificationBell` / `NotificationDropdown` / `NotificationItem` を実装する。
7. **ヘッダーへの組み込み**: `DashboardLayout` に `NotificationBell` を追加する。
8. **通知トリガーの組み込み**: 記録追加・コメント追加の各ルーターに通知生成処理を追加する。

### フェーズ 2: PWA プッシュ通知との統合（`pwa_notifications.md` 実装時）

9. **DB マイグレーション**: `push_subscriptions`、`notification_settings` テーブルを追加する。
10. **プッシュ送信処理**: `notification_service.py` の `notify_*()` にプッシュ送信ロジックを追加する。
11. **Service Worker 更新**: `sw.js` に BroadcastChannel 送信処理を追加して通知センターのリアルタイム更新を実現する。
12. **通知設定 UI**: `/settings/notifications` ページを作成し、`notification_settings` の編集機能を実装する。

---

## 8. 考慮事項

- **自分自身への通知は生成しない**: 記録者・コメント投稿者は受信者から除外する。
- **通知設定の初期値**: `notification_settings` レコードが存在しないユーザーはすべての通知を受信する（デフォルト有効）。
- **通知数の上限**: 1 ユーザーあたりの通知件数が際限なく増えないよう、古い通知の定期削除を将来タスクとして検討する（90 日経過分を削除）。
- **BroadcastChannel の対応ブラウザ**: 主要ブラウザ（Chrome, Safari 15.4+, Firefox）で対応済み。未対応の場合は SWR のポーリングにフォールバックするため機能上の問題はない。
- **おやすみモード**: `notification_settings.dnd_start_time` / `dnd_end_time` の範囲内はプッシュ送信のみスキップする。アプリ内通知センターへの INSERT は時間帯に関係なく行う。
