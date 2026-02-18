# PWA (Progressive Web App) 対応仕様書

本ドキュメントは、Baby App を Progressive Web App (PWA) に対応させるための仕様と実装詳細を定義します。

## 1. 目的

- **ホーム画面への追加**: ユーザーがアプリのようにホーム画面に追加し、簡単にアクセスできるようにする（「アプリとしてインストール」UXの提供）。
- **オフライン/ネットワーク不安定時の動作**: キャッシュを活用し、通信環境が悪い場所でも基本的なUIを表示可能にする。
- **パフォーマンス向上**: 静的アセットのキャッシュにより、再訪時のロード時間を短縮する。

## 2. 技術選定

- **ライブラリ**: [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa)
    - Next.js 16 (App Router) に対応しており、設定がシンプル。
    - Static Export (`output: 'export'`) 環境下でもService Workerの生成が可能。
- **アイコン管理**: 管理の容易さとスケーラビリティのため、SVG形式を採用する。
    - `icon-192x192.svg`, `icon-512x512.svg`, `maskable-icon.svg` を用意。

## 3. マニフェスト設定 (manifest.json)

`frontend/public/manifest.json` を配置する。

| 項目 | 設定値 | 備考 |
| :--- | :--- | :--- |
| `name` | Baby App | アプリの完全名称 |
| `short_name` | BabyApp | ホーム画面などに表示される短縮名 |
| `description` | 家族で共有する育児記録アプリ | |
| `start_url` | `/` | アプリ起動時のURL |
| `display` | `standalone` | ブラウザUIを非表示にし、ネイティブアプリのように表示 |
| `background_color` | `#ffffff` | 起動時の背景色 |
| `theme_color` | `#4F46E5` | テーマカラー（Indigo系） |
| `icons` | (下記参照) | PWA用アイコン |

### アイコン構成

`frontend/public/icons/` 配下に以下のアイコンを配置。

- `icon-192x192.svg`: 192px (標準)
- `icon-512x512.svg`: 512px (高解像度)
- `maskable-icon.svg`: 512px (Android用、セーフエリアを考慮。背景付き)

## 4. Service Worker 戦略

- **キャッシュ対象**:
    - 静的アセット (JS, CSS, Images, Fonts)
    - Next.js のビルド成果物 (`_next/static/**/*`)
- **戦略**:
    - `Stale-While-Revalidate`: コンテンツを即座に表示しつつ、バックグラウンドで更新を確認する。
    - APIレスポンス (`/api/*`) はキャッシュ**しない**（常に最新データを取得するため `NetworkOnly` またはデフォルト除外）。
- **オフラインフォールバック**: オフライン時に「ネットワークに接続してください」という表示を出す、またはキャッシュ済みのダッシュボードを表示する。

## 5. 実装詳細

### 5.1. パッケージインストール

```bash
cd frontend
pnpm add @ducanh2912/next-pwa
```

### 5.2. next.config.ts の設定

`frontend/next.config.ts` に設定を追加。

```typescript
// frontend/next.config.ts
import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  output: 'export',
  // images: { unoptimized: true }, // 静的エクスポート時
};

export default withPWA(nextConfig);
```

### 5.3. メタデータ設定 (Layout)

`frontend/app/layout.tsx` にメタデータを追加。iOS対応用の `apple-touch-icon` も設定する。

```typescript
// frontend/app/layout.tsx
export const metadata: Metadata = {
  title: "Baby App",
  description: "家族で共有する育児記録アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Baby App",
  },
  icons: {
    icon: "/favicon.ico", // または SVG
    apple: "/icons/icon-192x192.svg", // iOS用
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
```

### 5.4. gitignore の更新

```gitignore
# PWA generated files
public/sw.js
public/sw.js.map
public/workbox-*.js
public/workbox-*.js.map
```

## 6. アセット要件

1. `frontend/public/icons/icon-192x192.svg`
2. `frontend/public/icons/icon-512x512.svg`
3. `frontend/public/icons/maskable-icon.svg`
4. `frontend/public/favicon.ico`

## 7. 動作確認

1. **ビルド確認**: `cd frontend && pnpm build` で `out/sw.js` が生成されること。
2. **Lighthouse**: Chrome DevTools の Lighthouse パネルで PWA の項目がすべて合格すること。
3. **インストール**: 実機（iOS/Android）の「ホーム画面に追加」から正常に起動し、スプラッシュ画面が表示されること。
4. **オフライン**: 機内モード時に、キャッシュされたページが表示されること。

## 8. トラブルシューティング

- **Service Worker が更新されない**: ブラウザのキャッシュをクリアするか、Service Worker を強制的に解除 (Unregister) して再読み込みする。
- **iOS でアイコンが表示されない**: `apple-touch-icon` のリンクが正しいか、画像サイズが適切かを確認する。
- **静的エクスポート時のパス**: `assetPrefix` を設定している場合、`manifest.json` や `sw.js` のパスに注意する。

## 9. 今後の拡張

- **プッシュ通知**: `Web Push API` を使用した記録リマインダーの実装。
- **バッジ表示**: アプリ未確認通知数などをアイコン上にバッジ表示。
- **オフラインデータ同期**: オフライン時に行った記録を IndexedDB に保存し、オンライン復帰時に同期する。
