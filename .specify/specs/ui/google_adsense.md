# Google AdSense 広告表示仕様書

## 1. 概要

ダッシュボードの「直近のタイムライン（RecentActivityFeed）」に Google AdSense のインフィード広告を挿入する。
アプリの収益化を目的とし、ユーザー体験を損なわない自然な形で広告を表示する。

---

## 2. 広告表示仕様

### 2.1 表示位置

| 場所 | 条件 | 説明 |
|------|------|------|
| `RecentActivityFeed` コンポーネント内 | 記録10件ごとに1回 | 10件目・20件目・30件目… の直後に広告を挿入 |

- **挿入ロジック**: `recent.map((record, index) => ...)` の内部で `(index + 1) % 10 === 0` の条件が `true` の時に広告ユニットを表示する。
- 無限スクロールで新たな記録が読み込まれた際も、インデックスに基づいて自動的に広告が挿入される。

### 2.2 広告ユニットの種類

- **フォーマット**: インフィード広告（`in-feed`）
- **レスポンシブ**: `data-full-width-responsive="true"` を設定し、モバイル・デスクトップ両対応とする。

### 2.3 表示条件

- **常に表示**: ログイン済みユーザー全員に表示する（Admin / Member ロール問わず）。
- **記録がない場合**: 記録が5件未満の場合は広告を表示しない。

---

## 3. コンポーネント設計

### 3.1 `AdUnit` コンポーネント（新規作成）

**ファイルパス**: `frontend/components/ads/AdUnit.tsx`

```tsx
// 概念設計（実装時の参考）
interface AdUnitProps {
  slot: string;        // AdSense 広告スロット ID
  format?: string;     // デフォルト: "fluid"
  layout?: string;     // デフォルト: "in-article"
}
```

- `useEffect` 内で `(window.adsbygoogle = window.adsbygoogle || []).push({})` を呼び出してAdSenseを初期化する。
- `ins` タグ（AdSense 標準タグ）をレンダリングする。
- **CLS 対策**: コンテナに `min-h-[100px]` を指定し、広告読み込み前後のレイアウトシフトを防ぐ。
- **ラベル表示**: 広告の上部または下部に「広告」という小さなラベルを表示し、記録との区別を明確にする（景表法・Google ポリシー準拠）。
- `'use client'` ディレクティブを先頭に付与する（クライアントサイド専用）。

### 3.2 `RecentActivityFeed` コンポーネントの変更点

**ファイルパス**: `frontend/components/dashboard/RecentActivityFeed.tsx`

変更概要:
1. `AdUnit` コンポーネントを `next/dynamic` で動的インポートする（SSR 無効）。
2. `recent.map()` の各アイテムを `React.Fragment` でラップし、10件ごとに `AdUnit` を挿入する。

```tsx
// 変更後のレンダリングイメージ（概念）
{recent.map((record: BabyRecord, index: number) => (
  <React.Fragment key={`${record.type}-${record.id}`}>
    <li ...>
      {/* 記録の内容（既存実装） */}
    </li>
    {(index + 1) % 10 === 0 && (
      <li className="list-none">
        <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID ?? ""} />
      </li>
    )}
  </React.Fragment>
))}
```

---

## 4. AdSense スクリプトの読み込み

### 4.1 グローバルスクリプトの挿入

**ファイルパス**: `frontend/app/layout.tsx`

- `<head>` 内に AdSense の自動広告スクリプト（`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" crossOrigin="anonymous">`）を `next/script` の `strategy="afterInteractive"` で挿入する。
- パブリッシャー ID（`data-ad-client`）は環境変数 `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` から読み込む。

### 4.2 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | AdSense パブリッシャー ID | `ca-pub-XXXXXXXXXXXXXXXX` |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID` | 広告ユニット（スロット）ID | `XXXXXXXXXX` |

- `.env` に追加し、本番環境（Render）の環境変数にも設定する。
- 未設定（空文字）の場合、`AdUnit` は何もレンダリングしない（開発環境・staging での非表示対応）。

---

## 5. デザイン・UX 仕様

### 5.1 広告コンテナのスタイル

```
- 背景色: bg-gray-50 (ダークモード: dark:bg-gray-800/50)
- 角丸: rounded-xl
- パディング: py-2 px-3
- 最小高さ: min-h-[100px]（CLS 防止）
- ラベル: テキストサイズ text-xs、色 text-gray-400、「広告」と表示
```

### 5.2 デザインポリシー

- 広告はタイムラインの自然な流れに溶け込むデザインとする。
- 記録アイテムとの境界を明確にするため、上下に薄い区切り線（`border-t border-gray-100`）を設ける。
- 過度に目立つデザインは避け、アプリのデザインシステム（Tailwind CSS v4）に準拠する。

---

## 6. Google AdSense ポリシー準拠

- 広告であることを「広告」ラベルで明示する（景品表示法・Google ポリシー）。
- ページ内の広告数は Google のポリシーに準拠した合理的な範囲に留める。
- AdSense の審査が通るまでは `NEXT_PUBLIC_ADSENSE_SLOT_ID` を空にしておき、広告は非表示とする。

---

## 7. 実装ファイル一覧

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `frontend/components/ads/AdUnit.tsx` | 新規作成 | AdSense 広告ユニットコンポーネント |
| `frontend/components/dashboard/RecentActivityFeed.tsx` | 修正 | 5件ごとに `AdUnit` を挿入 |
| `frontend/app/layout.tsx` | 修正 | AdSense グローバルスクリプトを追加 |
| `.env` | 修正 | `NEXT_PUBLIC_ADSENSE_*` 環境変数を追加 |

---

## 8. 動作確認項目

| 確認項目 | 期待結果 |
|----------|----------|
| 記録が10件以上ある場合 | 10件目の直後に広告エリアが表示される |
| 記録が10件未満の場合 | 広告は表示されない |
| 無限スクロールで20件目が表示された場合 | 20件目の直後にも広告が表示される |
| `NEXT_PUBLIC_ADSENSE_SLOT_ID` が未設定の場合 | 広告エリアは何も表示されない |
| モバイル端末での表示 | レスポンシブに適切なサイズで表示される |
| 「広告」ラベルの表示 | 広告コンテナの上部/下部に「広告」が表示される |
| CLS（累積レイアウトシフト） | 広告読み込み前後でレイアウトが崩れない |
