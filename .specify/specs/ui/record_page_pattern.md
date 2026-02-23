# 記録ページの共通設計指針 (Record Page Design Pattern)

## 概要
育児記録（授乳、睡眠、おむつ、成長、日記など）の各ページにおいて、一貫したユーザー体験（UX）を提供し、開発効率と保守性を高めるための共通のレイアウト、ロジック、UIパターンを定義する。

## 1. ページ構成 (Layout Shell)

全ての記録ページは、以下の標準レイアウト（RecordPageLayout）を継承する。

### 1.1 ヘッダー (Header)
- **位置**: 画面上部 (`sticky top-0`)。
- **スタイル**: `bg-white/80 dark:bg-zinc-900/80`, `backdrop-blur-sm`, `border-b`。
- **要素**:
  - 中央揃えのページタイトル（例: 「授乳記録」）。
  - タイトル左横の機能アイコン（Lucideアイコン）。
  - アイコンは機能ごとにテーマカラーを設定する（例: 授乳は `rose`, 睡眠は `indigo`）。

### 1.2 メインコンテンツ (Main Container)
- **レイアウト**: `max-w-2xl mx-auto`, `p-4`, `space-y-6`。
- **背景色**: `bg-slate-50 dark:bg-zinc-950`。
- **下部余白**: モバイルのタブバーを考慮し、`pb-20` 以上のパディングを確保する。

### 1.3 共通の状態表示
- **初期ロード**: 赤ちゃん情報や権限の読み込み中は `RecordPageSkeleton` を表示。
- **データロード**: 機能固有のデータの読み込み中も、可能な限り `RecordPageSkeleton` の該当パーツや共通のスケルトンを使用し、UXの一貫性を保つ。
- **権限エラー**: 403 (Forbidden) エラー時は `AccessDenied` コンポーネントを表示。

### 1.4 赤ちゃん情報の表示
- **非表示**: 個別の記録ページ（授乳、睡眠、おむつ等）では、`BabyProfileCard` などの赤ちゃん情報は表示しない。
- **背景**: 画面上部のグローバルヘッダーに選択中の赤ちゃんが表示されており、ダッシュボードにプロフィール情報が集約されているため。
- **統一**: すべての記録ページで一貫して「記録項目に集中できる」UIとする。

## 2. 共通ロジック (Shared Logic)

### 2.1 赤ちゃんIDの解決 (Baby ID Resolution)
以下の優先順位で、対象となる赤ちゃんのID（`babyId`）を決定する。
1. **URLパラメータ**: `?baby_id=XXX` が指定されている場合。
2. **選択状態 (Store)**: `babyStore` で前回選択されたID。
3. **デフォルト**: ユーザーが所属する家族の、最初の赤ちゃんのID。

### 2.2 権限チェック (Permission Check)
- `usePermissions` を使用し、対象の赤ちゃんに対して `canWrite`（編集・作成権限）があるかを判定する。
- 権限がない場合、入力フォームや編集・削除ボタンを非表示、または無効化する。

### 2.3 記録フィードバック (Record Feedback)
- 記録（作成・更新）成功後、`useRecordFeedback` を介して AI 要約や通知のトリガー（`triggerFeedback`）を発火させる。

## 3. 標準的なセクション構成

ページ内は上から以下の順序で配置し、共通のスケルトン表示を適用する。

1.  **統計/サマリー (Stats/Summary)**: 当日の合計値や直近の状況を表示。データロード中は `Skeleton` でカード枠を表示する。
2.  **アドバイス (TipsCard)**: その記録項目に関する育児アドバイスを表示。
3.  **入力フォーム (Action/Form)**: `canWrite` が `true` の場合に表示。フォーム自体もローディング中は `Skeleton` に対応させる。
4.  **履歴 (History/List)**: 過去の記録一覧。編集・削除・コメント機能を内包する。
    - デザインは `Dashboard` の `RecentActivityFeed` に合わせ、統一感のあるカード（`Card`）とアイコン、ステータス表示とする。
    - データロード中は複数の `Skeleton` 行を表示する。
    - URLに `comment` パラメータがある場合、対象の記録をスクロール・ハイライトする機能を備える。

## 4. コンポーネント定義

### RecordPageLayout (Props)
| 名前 | 型 | 説明 |
| :--- | :--- | :--- |
| `title` | `string` | ヘッダーに表示するタイトル |
| `icon` | `LucideIcon` | ヘッダーに表示するアイコン |
| `iconColorClass` | `string` | アイコンの色指定（例: `text-rose-500`） |
| `isLoading` | `boolean` | 赤ちゃん情報や権限の初期ロード中か |
| `isDataLoading` | `boolean` | (New) 機能固有のデータの読み込み中か |
| `apiError` | `any` | APIエラー（403判定に使用） |
| `babyId` | `string \| null` | 選択されている赤ちゃんID（未選択時の表示に使用） |
| `children` | `ReactNode` | ページメインコンテンツ |
| `onRefresh` | `() => Promise<any>` | 下に引っ張って更新する際のコールバック |

### useRecordPage (Return)
| 名前 | 型 | 説明 |
| :--- | :--- | :--- |
| `babyId` | `string \| null` | 解決された赤ちゃんID |
| `canWrite` | `boolean` | 編集権限の有無 |
| `isLoading` | `boolean` | 初期ロード中フラグ |
| `triggerFeedback` | `Function` | 記録後のフィードバック発火関数 |
| `babies` | `Baby[]` | 所属する赤ちゃん一覧 |
