# パフォーマンス方針

## Core Web Vitals 目標値

| 指標 | 目標（Good） | 要注意（Needs Improvement） |
|------|------------|--------------------------|
| LCP  | < 2.5s     | 2.5s〜4.0s               |
| INP  | < 200ms    | 200ms〜500ms             |
| CLS  | < 0.1      | 0.1〜0.25                |

測定ツール: Chrome DevTools Lighthouse / Sentry Web Vitals

---

## アーキテクチャ制約

- **`output: 'export'`（Static Export）** — SSR/ISR 不可。データ取得はすべてクライアントサイド（SWR）で行う
- SSRを使ったプリフェッチは今回のスコープ外。LCP改善はクライアントサイドの並列化とリソース最適化で対応

---

## 実施済み改善施策（2026-02-19）

### 1. Sentry トレース設定の最適化

**問題**: 本番環境で `tracesSampleRate: 1`（100%サンプリング）が設定されており、不要なネットワーク帯域を消費していた

**対策**:
```ts
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,
sendDefaultPii: false,
```

**効果**: 本番でのSentry送信量を最大80%削減。LCPに間接的に寄与

**維持ルール**: 本番の `tracesSampleRate` は 0.1〜0.3 の範囲に保つこと。`1` に戻さない

### 2. フォント最適化

**問題**: `Geist` / `Geist_Mono` に `display` オプションが未指定（デフォルトは `swap` だが明示推奨）

**対策**: `display: 'swap'` を明示指定

**効果**: フォントロード中のFLASH（Flash of Invisible Text）を防止し、体感LCPを改善

### 3. API Waterfall 解消

**問題**:
- `useBabies()` が解決するまで `useRecords()` が null キーでスキップされ、Waterfall が発生
- `selectedBabyId` が Zustand `persist` で保存されているが、初回訪問では null のため並列化できなかった

**対策**: `useEffect` で `selectedBabyId` を auto-persist。2回目以降の訪問で `useBabies` と `useRecords` が並列フェッチ

**効果**: 再訪ユーザー（大多数）のWaterfall解消で LCP -0.3〜0.8秒の改善を見込む

---

## 今後の監視方針

1. **Sentry Web Vitals タブ** で LCP を定期確認。「Good」（2.5秒未満）を維持する
2. **Lighthouse CI** を将来的に組み込む際は、LCP 2.5s / CLS 0.1 を閾値として設定
3. バックエンドAPIのレスポンスタイムが悪化した場合、SWRの `dedupingInterval` や `revalidateOnFocus` の調整を検討
4. 新たなデータフェッチを追加する際は「Waterfallになっていないか」を必ず確認する

---

## 変更しなかったもの

| 項目 | 理由 |
|------|------|
| `output: 'export'` | 変更は大規模リファクタを要するためスコープ外 |
| `images: { unoptimized: true }` | アプリ内に画像コンテンツが少なく影響軽微 |
| `RecentActivityFeed` の `ssr: false` | Static Export ではどちらも同じ動作になるため変更不要 |
