# スプラッシュ画面コンポーネント仕様

## 概要
アプリ起動時（初回の画面描画およびリロード時）に表示され、バックグラウンドでの初期データのローディング時間を心地よく見せるスプラッシュアニメーション画面を提供する。既存の `BabyBottleLoading` のSVGアニメーションを流用する。

## 実装要件

### コンポーネント: `SplashScreen`
*   **配置**: `app/layout.tsx` のルート層に配置し、画面全体を覆う（Full-screen overlay）。
*   **スタイル**: `fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background`。
*   **アニメーション**:
    *   画面中央に大きめの `BabyBottleLoading` が表示される。
    *   表示中はバックグラウンドのデータ取得（`useUser()` の `isLoading` 状態など）を監視する。
    *   データ取得が完了（`isLoading` が `false`）した後、UIの切り替わり余韻（約600ms等）を待って `framer-motion` の `AnimatePresence` を使って画面全体をフェードアウトさせる（`opacity: 0`）。
    *   フェードアウト完了後は、コンポーネント自体をDOMからアンマウントし、背後の操作を阻害しないようにする。

### 状態管理・表示ロジック
*   **制御**: `sessionStorage` などによる特別な表示制限は行わず、毎回のリロードおよび初回到達時に画面を覆って表示する。
*   **挙動**:
    1.  コンポーネントマウント時に表示状態を設定し、`useUser()` フックを呼び出して `isLoading` フラグを得る。
    2.  `isLoading === false` になるのを待機する。
    3.  `isLoading === false` になった時点で `setTimeout` を用いてフェードアウト処理を開始する。
*   **例外**: クライアントサイドでのみ動作する（`"use client"`）ため、サーバーサイドレンダリング時はローディング状態の不整合を防ぐため、`useEffect` 内でのマウント判定（hydration完了）を待機してから表示ロジックを走らせる。

## アーキテクチャ図
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Layout
    participant SplashScreen
    participant useUser as useUser Hook/SWR

    User->>Layout: アプリへアクセス (リロード等)
    Layout->>SplashScreen: マウント
    SplashScreen->>User: アニメーション表示
    SplashScreen->>useUser: isLoading状態を監視
    useUser-->>SplashScreen: isLoading: true
    useUser-->>SplashScreen: isLoading: false (データ取得完了)
    SplashScreen->>User: 待機時間（600ms）後、フェードアウトして非表示
\`\`\`
