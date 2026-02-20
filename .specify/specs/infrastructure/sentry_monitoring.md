# Sentry エラー監視 仕様書 (Sentry Error Monitoring Specification)

## 1. 概要

本ドキュメントは、Baby App フロントエンド（Next.js）における Sentry によるエラー監視機能の仕様を定義します。
クライアントサイドの JavaScript エラー・未処理例外・パフォーマンス情報を自動収集し、
問題の早期発見・迅速な修正を支援します。

## 2. 目的

- **エラーの早期検知**: 本番環境で発生したエラーをリアルタイムに把握する。
- **再現性の確保**: Session Replay によりエラー発生前後の操作を記録し、再現調査を支援する。
- **パフォーマンス監視**: トレースサンプリングにより、遅いページ遷移や処理を可視化する。

## 3. Sentry プロジェクト情報

| 項目 | 値 |
| :--- | :--- |
| **Organization** | `takuro-ebuchi` |
| **Project** | `baby-app-next` |
| **DSN** | `https://df57b075f6f01f47246f03f44fb7f5d6@o4510904857526272.ingest.us.sentry.io/4510904861065216` |
| **Platform** | JavaScript / Next.js |

> DSN はパブリックな識別子であり、クライアントサイドのバンドルに含まれることが想定されています。
> ソースコードへのコミットは問題ありません。

## 4. ファイル構成

```
frontend/
├── instrumentation-client.ts   # クライアント（ブラウザ）の主設定（Session Replay・PII含む）
├── sentry.client.config.ts     # クライアント補助設定（consoleLoggingIntegration）
├── instrumentation.ts          # サーバー・エッジランタイムの初期化エントリポイント
├── sentry.server.config.ts     # Node.js ランタイム（SSR）の初期化設定
├── sentry.edge.config.ts       # Edge ランタイムの初期化設定
├── next.config.ts              # withSentryConfig でラップ済み
└── app/
    └── global-error.tsx        # ルートレベルのエラーバウンダリ（Sentry.captureException）
```

> `instrumentation-client.ts` は Next.js App Router が優先的に読み込むクライアント設定エントリポイント。
> `sentry.client.config.ts` は補助的な設定を追加するために併用している。

## 5. 機能設定

### 5.1. クライアント（ブラウザ）— `instrumentation-client.ts`

| 設定項目 | 値 | 説明 |
| :--- | :--- | :--- |
| `tracesSampleRate` | `1` | トレースを 100% サンプリング（本番では下げることを推奨） |
| `replaysSessionSampleRate` | `0.1` | 全セッションの 10% を Session Replay で記録 |
| `replaysOnErrorSampleRate` | `1.0` | エラー発生時は 100% Session Replay を記録 |
| `enableLogs` | `true` | コンソールログを Sentry に送信 |
| `sendDefaultPii` | `true` | ユーザー識別情報（PII）を送信 |

`replayIntegration` のプライバシーオプションも設定済み（Section 10 参照）。

### 5.2. クライアント補助設定 — `sentry.client.config.ts`

| 設定項目 | 値 | 説明 |
| :--- | :--- | :--- |
| `consoleLoggingIntegration.levels` | `["warn", "error"]` | `console.warn` / `console.error` を Sentry Logs に送信 |
| `tracesSampleRate` | 本番 `0.2` / 開発 `1` | 環境別サンプリング |
| `enableLogs` | `true` | Sentry Logs 機能を有効化 |
| `sendDefaultPii` | `false` | PII 送信を無効化 |

### 5.3. Console Logging Integration（Sentry Logs）

`sentry.client.config.ts` の `consoleLoggingIntegration` により、`console.warn` および `console.error` の呼び出しを
Sentry の Logs タブにリアルタイム送信する。

| 設定 | 値 | 理由 |
| :--- | :--- | :--- |
| `levels` | `["warn", "error"]` | デバッグ用 `console.log` はノイズが多いため除外 |

**スモールスタートの根拠:**

- 既存コードには `console.error` が 26 ファイル以上に存在し、API 失敗・認証エラー等を記録している
- `console.log` は開発用デバッグコードが多く、本番ではノイズになる可能性が高い
- まず `warn` と `error` のみ送信し、効果を確認してから拡張する

**将来的な拡張:**

- `log` レベルの追加（ユーザーアクションのトレース用途として有用と判断された場合）

### 5.4. サーバー / エッジ — `sentry.server.config.ts` / `sentry.edge.config.ts`

| 設定項目 | 値 | 説明 |
| :--- | :--- | :--- |
| `tracesSampleRate` | 本番 `0.2` / 開発 `1` | 環境別サンプリング |
| `enableLogs` | `true` | サーバーログを Sentry に送信 |
| `sendDefaultPii` | `false` | PII 送信を無効化 |

> **注意**: このプロジェクトは `output: 'export'`（静的エクスポート）を使用しているため、
> サーバーサイドランタイム（`sentry.server.config.ts`）は実質的に稼働しません。
> クライアントサイドのエラーキャプチャが主な機能になります。

### 5.5. next.config.ts の統合

`withSentryConfig` で Next.js の設定をラップしています。

```ts
export default withSentryConfig(withPWA(nextConfig), {
  org: "takuro-ebuchi",
  project: "baby-app-next",
  silent: !process.env.CI,         // CI 時のみソースマップアップロードログを出力
  widenClientFileUpload: true,     // より詳細なスタックトレースのため広範なソースマップを送信
});
```

> **`tunnelRoute` は使用しない**: 静的エクスポートでは Next.js の API Route Handler が
> 使えないため、`tunnelRoute`（広告ブロッカー回避用プロキシ）は設定していません。

## 6. 環境変数

| 変数名 | 管理場所 | 説明 |
| :--- | :--- | :--- |
| `SENTRY_AUTH_TOKEN` | `frontend/.env.local`（ローカル）、Render 環境変数（本番） | ソースマップのアップロードに使用。**絶対にコミットしない** |

> `SENTRY_AUTH_TOKEN` は `.gitignore` で除外された `frontend/.env.local` に記載されています。
> Render へのデプロイ時は、Render のダッシュボードで環境変数として設定してください。

## 7. 本番デプロイ時の設定（Render）

1. Render ダッシュボード → Environment → Environment Variables
2. `SENTRY_AUTH_TOKEN` を追加（値は `frontend/.env.local` の値を参照）
3. ビルド時にソースマップが自動的に Sentry へアップロードされます

## 8. 制約・考慮事項

| 制約 | 内容 |
| :--- | :--- |
| **静的エクスポート** | `output: 'export'` のため、サーバーサイドエラー監視は機能しない。クライアントエラーのみ有効。 |
| **tunnelRoute 非対応** | 静的エクスポートでは Route Handler が使えないため、広告ブロッカーにより一部のエラーレポートがブロックされる可能性がある。 |
| **PII の送信** | `instrumentation-client.ts` で `sendDefaultPii: true` を設定しているため、ユーザー情報が Sentry に送信される。プライバシーポリシーに明記すること。 |

## 9. 将来の改善案

- `instrumentation-client.ts` の `tracesSampleRate` を本番では `0.2`（20%）程度に下げてコスト・負荷を削減する（`sentry.client.config.ts` 等では実施済み）。
- ユーザーのメールアドレスを `Sentry.setUser()` でセットし、エラー発生ユーザーを特定可能にする。
- アラートルールを設定し、エラー急増時に Slack 通知を受け取る。

## 10. Session Replay プライバシー設定

### 10.1. 設計方針

**「デフォルト全マスク・安全な要素のみ明示的にアンマスク」** を採用する。

- Sentry のデフォルト `maskAllText: true` を維持し、安全側を優先する
- `data-sentry-unmask` 属性を付与した要素のみ Session Replay に表示する
- 属性を持たないすべての要素は自動的にマスクされる

### 10.2. マスク対象 / 非マスク対象の分類

| カテゴリ | 具体例 | 方針 |
| :--- | :--- | :--- |
| ナビゲーションラベル | ホーム、授乳、おむつ、睡眠、成長、陣痛、日記、設定 | **アンマスク** |
| ボタン・アクションラベル | 保存、キャンセル、削除、編集、記録する、メモを追加する | **アンマスク** |
| 静的ページ見出し | "Baby App"、"授乳記録"、"おむつ記録"、"メモの編集" など | **アンマスク** |
| 記録タイプラベル | 授乳、睡眠、おむつ、成長、メモ | **アンマスク** |
| フォームラベル | 日時、内容、開始日時、終了日時、メモ | **アンマスク** |
| ユーザー入力フィールド | ユーザー名、パスワード、表示名、家族名 | **マスク（デフォルト）** |
| 赤ちゃんの名前 | ユーザーが登録した任意の名前 | **マスク（デフォルト）** |
| 育児記録の数値 | 授乳量（ml）、睡眠時間、体重、身長、頭囲 | **マスク（デフォルト）** |
| フリーテキストメモ | 授乳メモ、睡眠メモ、育児日誌テキスト | **マスク（デフォルト）** |
| 招待コード | 家族の招待コード | **マスク（デフォルト）** |

### 10.3. 実装方法

#### replayIntegration のオプション設定

```typescript
// frontend/instrumentation-client.ts（実装済み）
Sentry.init({
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,                              // デフォルト全マスク（安全側を維持）
      blockAllMedia: true,                            // 画像・メディアもデフォルトでブロック
      unmask: ["[data-sentry-unmask]"],               // この属性の要素のみ表示する
    }),
  ],
  // ...
});
```

#### コンポーネントでの `data-sentry-unmask` 属性の付与

静的な UI 文字列（ナビゲーション、ボタン、ページタイトルなど）には
`data-sentry-unmask` 属性を付与する。

```tsx
// ナビゲーションアイテム
<span data-sentry-unmask>ホーム</span>
<span data-sentry-unmask>授乳</span>

// ボタン
<Button data-sentry-unmask>記録する</Button>
<Button data-sentry-unmask>保存</Button>

// ページ見出し（静的テキストのみ）
<h1 data-sentry-unmask>授乳記録</h1>
```

ユーザー入力・動的データには属性を付与しない（マスクのまま）。

```tsx
// マスクされる（属性なし）
<Input value={username} />             // ユーザー名入力
<span>{baby.name}</span>               // 赤ちゃんの名前（動的データ）
<span>{feeding.amount_ml} ml</span>    // 授乳量
<Textarea value={notes} />             // メモ
```

### 10.4. 対象コンポーネント一覧

`data-sentry-unmask` を追加する主なファイルと対象要素。

| ファイル | 対象要素 |
| :--- | :--- |
| `frontend/app/(dashboard)/layout.tsx` | ナビゲーションラベル（ホーム、授乳、おむつ…） |
| `frontend/components/dashboard/*Widget.tsx` | ウィジェットのタイトル（🍼 授乳、💤 睡眠…） |
| `frontend/components/*/RecordForm.tsx` | ボタン（保存、キャンセル、記録する） |
| `frontend/app/(auth)/login/page.tsx` | ページ見出し（"Baby App にログイン"） |
| `frontend/app/(auth)/register/page.tsx` | ページ見出し（"家族を新規作成"、"家族に参加"） |
| `frontend/components/note/NoteForm.tsx` | ボタン（追加、キャンセル、保存）、ラベル（日時、内容） |
| `frontend/components/settings/SettingsHeader.tsx` | ページタイトル |
| `frontend/components/diary/DiaryEditDialog.tsx` | ダイアログタイトル、補助テキスト、ボタン |
| `frontend/components/ContractionTimer.tsx` | ステータス表示、操作ボタン |
| `frontend/components/*/*History*.tsx` | 削除確認ダイアログ（タイトル、説明、ボタン） |
| `frontend/components/sleep/sleep-history.tsx` | 編集ダイアログ（タイトル、ラベル、保存ボタン） |
| `frontend/components/diaper/DiaperEditDialog.tsx` | 編集ダイアログ（タイトル、ボタン） |
| `frontend/components/note/NoteHistory.tsx` | 編集ダイアログ（タイトル、ラベル、ボタン） |

### 10.5. 実装チェックリスト

- [x] `frontend/instrumentation-client.ts`: `replayIntegration` にオプション追加（実装済み）
- [ ] `frontend/app/(dashboard)/layout.tsx`: ナビゲーションに `data-sentry-unmask` 追加
- [ ] `frontend/components/dashboard/FeedingWidget.tsx`: タイトルに追加
- [ ] `frontend/components/dashboard/SleepWidget.tsx`: タイトルに追加
- [ ] `frontend/components/dashboard/DiaperWidget.tsx`: タイトルに追加
- [ ] `frontend/components/dashboard/GrowthWidget.tsx`: タイトルに追加
- [ ] `frontend/components/feeding/feeding-form.tsx`: ボタンに追加
- [ ] `frontend/components/sleep/sleep-form.tsx`: ボタンに追加
- [ ] `frontend/components/diaper/DiaperForm.tsx`: ボタンに追加
- [ ] `frontend/components/growth/GrowthRecordForm.tsx`: ボタンに追加
- [ ] `frontend/app/(auth)/login/page.tsx`: ページ見出しに追加
- [ ] `frontend/app/(auth)/register/page.tsx`: ページ見出しに追加

## 11. 将来の実装候補（優先度順）

### 優先度: High

- **明示的な `Sentry.captureException()` の導入**
  現在 try/catch で `console.error` のみ呼び出している箇所（26 ファイル以上）に
  `Sentry.captureException(err, { tags: { ... } })` を追加する。
  主な対象: `frontend/lib/api.ts` の fetcher 関数、各フォーム送信ハンドラ

- **エラーレベルの統一分類**
    - HTTP 5xx → `level: 'error'`（サーバー側の問題）
    - HTTP 4xx → `level: 'warning'`（ユーザー起因）
    - Service Worker エラー → `level: 'warning'`

### 優先度: Medium

- **`Sentry.setUser()` によるユーザー情報の設定**
  ログイン成功後に `Sentry.setUser({ id: user.id })` を呼び出し、
  エラー発生ユーザーを特定可能にする（PII 管理のため username / email は送信しない）

- **Session Replay プライバシー設定の実装**
  Section 10 の仕様に基づき `replayIntegration` のオプションを設定する（未実装）

- **`data-sentry-unmask` 属性の適用**
  Section 10.4 のリストに基づきナビゲーション・ボタン等の静的テキストに属性付与（未実装）

### 優先度: Low

- **`console.log` レベルの追加**
  ユーザーアクションのトレース用途として有用と判断された場合に
  `consoleLoggingIntegration` の `levels` に追加する

- **バックエンド（FastAPI）の Sentry 統合**
  現状はフロントエンドのみ。`sentry-sdk[fastapi]` を追加して Python 例外を監視する

- **Sentry アラートルールの設定**
  エラー急増時の Slack / Email 通知（Sentry ダッシュボードで設定）
