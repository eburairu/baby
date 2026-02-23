## 概要
Pull-to-Refresh（引っ張って更新）機能を導入した後、モバイル環境や一部のブラウザでページの下方向へのスクロールができなくなる不具合を修正しました。

## 修正内容
- **framer-motion ジェスチャーの廃止**: `drag="y"` や `onPan` がネイティブのスクロールイベントをキャプチャして阻害していたため、これらを削除しました。
- **ネイティブ Touch イベントへの移行**: `onTouchStart`, `onTouchMove`, `onTouchEnd` を使用した実装に切り替えました。
- **スクロール判定の厳密化**: 
    - ページ最上部（`scrollTop <= 0`）にいる場合のみプル動作を開始（iOS Safari のバウンスエフェクトに対応）。
    - 下方向へのプル時のみイベントをインターセプトし、上方向（通常のスクロールダウン）への動きはネイティブに任せるように改善。
- **CSS 制約の解除**: ルートコンテナに設定されていた `overflow-hidden` と `overscroll-behavior-y: contain` を削除し、コンテンツが長い場合でも正常にスクロールできるようにしました。

## 検証結果
- `npm run build` が正常に完了することを確認。
- `sh scripts/verify_all.sh` による全テスト・Lint・型チェックをパス。

Co-Authored-By: Gemini <gemini@google.com>
