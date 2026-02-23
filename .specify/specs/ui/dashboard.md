# ダッシュボード機能 仕様書 (Dashboard Specification)

## 概要

Baby App のメイン画面（ホーム）となるダッシュボードの仕様。
「一目で赤ちゃんの現在の状態がわかる」「次のアクション（記録）へ最短でアクセスできる」ことを目的とし、
使っていて心地よい、プレミアムでモダンな UI/UX を提供する。

## デザインコンセプト

- **Premium & Modern**:
    - 柔らかいシャドウ、角丸 (Rounded-xl ~ 2xl)、余白を活かしたカードデザイン。
    - 落ち着いたパステルカラーを基調としつつ、重要な情報は視認性を高く。
    - 可能な場合、Glassmorphism（すりガラス効果）をヘッダーやモーダルに採用。
- **Dynamic & Alive**:
    - 「現在睡眠中」などのステータスを動的に表示（パルスアニメーション等）。
    - ウィジェットカードへのホバー時に上方向へ浮き上がるアニメーション（`hover:-translate-y-1 hover:shadow-md`）。
    - インタラクティブなホバーエフェクト。
- **Mobile First**:
    - 片手で操作しやすいボタン配置。
    - 重要な情報はファーストビューに収める。

## ユーザーストーリー

- アプリを開いた瞬間に、最後にいつ授乳したか、今寝ているかなどの「直近の状況」を把握したい。
- 泣いている赤ちゃんを抱っこしながらでも、ワンタップで「授乳開始」や「睡眠開始」を記録したい。
- 複数の赤ちゃんがいる場合、簡単に切り替えてそれぞれの記録を見たい。
- 今日の排泄回数や睡眠時間の合計など、その日のサマリーをさっと確認したい。
- 成長の記録（身長・体重）も定期的にチェックしたい。

## 機能要件

### F1: 赤ちゃん切替・管理

- 赤ちゃんの名前、月齢（例: "生後 2ヶ月15日"）をダッシュボード内で表示。
- 未登録時のオンボーディング（「赤ちゃんを登録してください」）。
- **ヘッダーバッジからの切り替え**:
    - グローバルヘッダーの赤ちゃんバッジをクリックすると `DropdownMenu` が開き、登録済みの赤ちゃんを選択して即時切り替えできる。
    - 現在選択中の赤ちゃんにはチェックマーク（`✓`）を表示。
    - 赤ちゃんが1人だけの場合はクリック不可（chevron 非表示、従来の `Badge` のみ表示）。
    - 選択は `localStorage` に永続化され、ページリロード後も維持される。

### F2: ステータス・サマリーウィジェット (Cards)

各トラッカーの現況をカード形式で表示。`grid-cols-2` (モバイル) / `grid-cols-3` (デスクトップ) のグリッド内に統一されたデザインで配置する。

1. **授乳 (Feeding)**
    - 最終授乳からの経過時間、今日の回数。
    - アクション: 詳細ページ遷移。
2. **睡眠 (Sleep)**
    - 現在の状態（睡眠中/起きています）、経過時間。
    - アクション: 詳細ページ遷移、クイックタイマー。
3. **排泄 (Diaper)**
    - 今日の交換回数 (おしっこ / うんち)。
    - アクション: 詳細ページ遷移。
4. **育児日誌 (Diary)**
    - 今日の日誌（AIまとめ）の有無、内容の要約。
    - アクション: 日誌一覧ページ (`/diary`) 遷移、詳細表示。
5. **メモ (Note)**
    - 最新のメモ内容。
    - アクション: メモ一覧ページ (`/note`) 遷移。
6. **成長 (Growth)**
    - 最新の身長・体重。
    - アクション: 成長曲線ページへ遷移。

### F3: クイックアクション (`QuickActionBar`)

画面下部に固定表示されるクイックアクションバー（`fixed bottom-6 left-1/2 -translate-x-1/2`）。

- **表示条件**: 出生後かつ `canWrite` 権限がある場合のみ表示。
- **デザイン**: Glassmorphism（`bg-white/80 backdrop-blur-md rounded-2xl`）で浮いているように見せる。
- **ボタン構成** (左→右):

    | ボタン | アクション | カラー |
    | ------ | --------- | ------ |
    | 🍼 ミルク | `POST /feedings/` (BOTTLE) を即時記録 | Rose |
    | 🌙 睡眠 | `/sleep?baby_id=...` へ遷移（状態判定含む） | Indigo |
    | 💧 おしっこ | `POST /diapers/` (WET) を即時記録 | Amber |
    | 💩 うんち | `POST /diapers/` (DIRTY) を即時記録 | Amber |
    | 📝 メモ | メモ追加ダイアログを表示（即時投稿） | Amber |

- **区切り線**: 睡眠とおしっこの間にセパレーターを設置。
- **ローディング**: 記録中は全ボタンを `disabled` に。

### F6: モバイル・ボトムナビゲーション

モバイル（画面幅 768px 未満）の画面下部に固定表示されるナビゲーション。

- **項目構成**:
    1. 🏠 ホーム (`/dashboard`)
    2. 🍼 授乳 (`/feeding`)
    3. 💤 睡眠 (`/sleep`)
    4. 👶 おむつ (`/diaper`)
    5. 📔 日誌 (`/diary`)  <-- 「設定」から「日誌」へ変更

- **デザイン**: `h-16 flex items-center justify-between pb-safe`。
- **目的**: 育児中に片手で主要な「記録・確認」アクションを完結させる。
- **設定へのアクセス**: グローバルヘッダーのユーザー名クリック、またはサイドメニュー（Sheet）からアクセス可能。

> ~~**Future Work**: 睡眠ボタンを直接 Start/Stop に対応させる~~ → 実装済み（v1.2）

### F4: 直近のタイムライン (Recent Activity)

- すべての記録種別を統合したタイムライン。
- 初期表示は最新 10 件。
- ページ最下部までスクロールすると自動的に次の 10 件を追加読み込みする（無限スクロール）。
- 全件表示済みになると「すべての記録を表示しています」と表示する。
- アイコン付きで視認性を高く。
- 各行をタップすると詳細ダイアログを表示し、編集・削除・コメント操作が可能。
- 赤ちゃんを切り替えた際は表示件数をリセットする。

#### API仕様

統合タイムラインを取得するために以下のエンドポイントを使用する。

- **GET /api/babies/{baby_id}/records**
    - **Query Params**:
        - `limit`: 取得件数 (default: 50, min: 1, max: 1000)
    - **Response**: `List[UnifiedRecord]`

**レスポンススキーマ (`UnifiedRecord`)**

```typescript
interface UnifiedRecord {
  id: number;
  type: "feeding" | "sleep" | "diaper" | "growth" | "note" | "contraction";
  timestamp: string; // ISO 8601 (JST)
  comment_count: number;
  recorded_by_display_name: string | null;
  details: RecordDetails; // 各タイプに応じた詳細情報
}

// details の構造は type により異なる
type RecordDetails =
  | { feeding_type: string; amount_ml: number | null; duration_minutes: number | null; notes: string | null } // feeding
  | { end_time: string | null; notes: string | null } // sleep
  | { diaper_type: string; notes: string | null } // diaper
  | { weight_kg: number | null; height_cm: number | null; head_circumference_cm: number | null; notes: string | null } // growth
  | { notes: string } // note (content is mapped to notes)
  | { end_time: string | null; duration_seconds: number | null; notes: string | null } // contraction
```

### F5: 出生前/出生後 表示切り替え

`birthday` の有無で赤ちゃんの出生状態を判定し、ダッシュボード表示を切り替える。

| 項目 | 出生前 | 出生後 |
|------|--------|--------|
| 🍼 授乳 | ❌ | ✅ |
| 💤 睡眠 | ❌ | ✅ |
| 💩 おむつ | ❌ | ✅ |
| 📏 成長 | ❌ | ✅ |
| 📝 メモ | ✅ | ✅ |
| 🤰 陣痛タイマー | ✅ | ❌ |
| 📔 育児日誌 | ✅ | ✅ |
| 🎉 「生まれた！」ボタン | ✅ | ❌ |

- **「生まれた！」ボタン**: 出生前のダッシュボードに表示される目立つボタン。
    - タップするとダイアログが開き、誕生日を入力して `PATCH /api/babies/{id}` で保存。
    - デフォルトは当日日付。
    - 保存成功後、ダッシュボードは自動的に出生後モードに切り替わる。
- **ナビゲーションメニュー**: 出生状態に応じてメニュー項目もフィルタリング。
- **BabyProfileCard**: 出生前は月齢の代わりに予定日情報を表示。また、赤ちゃんの特徴（characteristics）が登録されている場合は、プロフィール内に引用スタイルで表示する。その際、テキスト内の改行は正しく反映される（`whitespace-pre-wrap` 等）ように制御する。

### Future Work: 出生前ダッシュボード拡張

出生前ダッシュボードの将来的な拡張として以下を検討：

- 📋 **出産準備チェックリスト**: 購入が必要なアイテムの管理
- 📄 **役所手続きリスト**: 出生届・健康保険・児童手当等の申請書類管理
- 🏥 **検診スケジュール**: 妊婦健診の予定・記録

## 画面構成案

```
[Header: ロゴ | 赤ちゃん切替 | 設定]

[Hero Section: 赤ちゃん情報]
  👶 レンくん (生後 3ヶ月)
  "順調に育っています✨" (一言コメント等)

[Status Widgets (Grid / Masonry)]

  ┌───────────────────────┐  ┌───────────────────────┐
  │ 🍼 Feeding            │  │ 💤 Sleep              │
  │  Last: 2h 15m ago     │  │  🟢 Awake             │
  │  Today: 6 times       │  │  Last sleep: 45m ago  │
  │  [ + Record ]         │  │  [ 🌙 Start Sleep ]   │
  └───────────────────────┘  └───────────────────────┘

  ┌───────────────────────┐  ┌───────────────────────┐
  │ 💩 Diaper             │  │ 📏 Growth (Mini)      │
  │  Today: 💧5  💩1      │  │  64.5cm / 6200g       │
  │  Last: 30m ago        │  │  (1 week ago)         │
  └───────────────────────┘  └───────────────────────┘

[Quick Actions (Floating or Sticky Bottom)]
  ( 🍼 )  ( 💤 )  ( 💩 )  ( ＋ )

[Recent Timeline]
  14:30  💩 Diaper (WET)
  13:00  🍼 Feeding (Left 10m)
  11:00  💤 Woke up (1h 30m sleep)
```

## 技術設計

### コンポーネント構成

`app/(dashboard)/page.tsx` を中心に構成。

- `DashboardHeader`: 赤ちゃん切替、設定リンク
- `BabyProfileCard`: 名前、月齢表示
- `DashboardGrid`: ウィジェットのグリッドレイアウト
    - `FeedingWidget`: データ取得・表示ロジック内包
    - `SleepWidget`: 現在の睡眠状態判定ロジック内包
    - `DiaperWidget`
    - `GrowthWidget`
- `QuickActionBar`: クイックアクションバー（画面下部固定FAB）
- `RecentActivityFeed`: 統合タイムライン

### データ取得戦略 (Performance)

- ダッシュボードは「現在の状態」が最も重要。
- `swr` を活用し、各ウィジェットが必要なデータを並列で取得（`useFeedingSummary`, `useSleepStatus` 等の専用フックを用意）。
- 全データを一度に取得する重い API コールは避け、各機能ごとに最適化されたエンドポイント（またはクエリ）を使用する。
    - 例: `GET /api/feedings/summary?baby_id=...` (未実装なら `GET /api/feedings?limit=1` 等で代用しクライアント計算)
    - **現状のAPI資産で対応**:
        - 各一覧APIの `limit` パラメータや、全件取得後のクライアントサイド計算で対応（データ量が少ないうちは問題ない）。
        - 将来的に Backend に Summary API を実装することを推奨。

### UI ライブラリ

- **Shadcn UI (Cards, Buttons, Badge, Avatar)**
- **Lucide React (Icons)**: 統一感のあるアイコンを使用。
- **Tailwind CSS**:
    - `bg-gradient-to-r` 等でリッチな表現。
    - `backdrop-blur` でモダンな質感を演出。

## カラーパレット (Theme)

- Primary: 優しいブルーまたはセージグリーン (Tailwind colors)
- Background: 非常に薄いグレーまたはオフホワイト (`bg-slate-50`)
- Cards: White (`bg-white`) + Soft Shadow (`shadow-sm` or `shadow-md`)
- Accents:
    - Feeding: Rose / Pink
    - Sleep: Indigo / Violet
    - Diaper: Amber / Orange
    - Growth: Emerald / Teal

## 改訂履歴

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 1.0 | 初版 | 基本機能仕様 |
| 1.1 | 2026-02-18 | F5「出生前/出生後表示切り替え」追加。「生まれた！」ボタン仕様追加。Future Work セクション追加。 |
| 1.2 | 2026-02-20 | F3「クイックアクション」を `QuickActionBar` として具体化。ウィジェットのホバーアニメーション仕様を追加。コンポーネント名を `QuickActionFab` → `QuickActionBar` に更新。睡眠ボタンを直接 Start/Stop に対応（records から状態判定）。 |
| 1.3 | 2026-02-20 | ダッシュボード画面右上の赤ちゃん選択機能（タブ/ボタン形式）を削除。赤ちゃん切り替え機能をグローバルヘッダーのドロップダウンに集約。 |
| 1.4 | 2026-02-23 | F4「直近のタイムライン」に実装済みの統合API（`GET /api/babies/{id}/records`）およびレスポンススキーマ仕様を追記。 |
