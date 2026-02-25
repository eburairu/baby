# Proposed Issues

## Issue 1: 🏕️ Scout: FeedingFormコンポーネントの分割とUI共通化

**📂 対象ファイル:**
`frontend/components/feeding/feeding-form.tsx`

**💡 現状の課題:**
- **Fat Component:** `FeedingForm` は22KBと肥大化しており、授乳記録フォームUI、左右独立タイマーのレンダリング、`onSubmit` 内の複雑なビジネスロジック（タイプ判定、データ整形、リセット処理）が1つのファイルに混在している。
- **重複したUI:** ボトルコンテンツタイプ（母乳/粉ミルクなど）や授乳完全度の選択UIが、`DiaperForm` 内のラジオボタングループと酷似したロジックで実装されており、共通化されていない。

**🎯 解決策・方針:**
1.  **タイマーUIの分離:** `TabsContent value="BREAST"` 内のタイマー表示部分を、`FeedingTimer` という独立したコンポーネントに切り出す。
2.  **選択UIの共通化:** `SelectionGroup` や `SelectionChips` といった汎用的なコンポーネントを作成し、`FeedingForm` と `DiaperForm` の両方で使えるようにする。
3.  **ロジックの抽出:** `onSubmit` 内の処理を `useFeedingFormSubmit` フックとして切り出し、プレゼンテーションとロジックを分離する。

**✅ 完了条件 (Definition of Done):**
- `FeedingForm` の行数が削減され、JSXの見通しが良くなっていること。
- `FeedingTimer` コンポーネントが作成され、タイマー機能が正常に動作すること。
- 新しい共通選択UIコンポーネントが導入され、既存のUIと同じ挙動・見た目を保っていること。

---

## Issue 2: 🏕️ Scout: DashboardLayoutの責務分離と構造化

**📂 対象ファイル:**
`frontend/app/(dashboard)/layout.tsx`

**💡 現状の課題:**
- **責務の混在:** レイアウトファイル内に、ナビゲーション項目の定義定数（`ALL_NAV_ITEMS`）、ヘッダー/サイドバー/ボトムバーの巨大なJSX、赤ちゃん切り替え（BabySelector）のロジックが全て含まれている。
- **可読性の低下:** 条件付きレンダリング（Desktop/Mobile, 産前/産後）が複雑に絡み合っており、レイアウト構造を把握しづらい。

**🎯 解決策・方針:**
1.  **定数の分離:** ナビゲーション項目を `frontend/constants/navigation.ts` に移動する。
2.  **コンポーネント分割:**
    - `DashboardHeader` (Desktop用)
    - `MobileHeader` (Mobile用)
    - `BottomNavigation` (Mobile下部用)
    - `BabySelector` (赤ちゃん切り替えドロップダウン)
    これらを独立したファイルに分割する。
3.  **レイアウトの単純化:** `layout.tsx` はこれらのコンポーネントを配置するだけのシンプルな構造にする。

**✅ 完了条件 (Definition of Done):**
- `layout.tsx` が純粋なレイアウト定義ファイルとなり、ロジックが含まれていないこと。
- 分割された各ヘッダー/ナビゲーションコンポーネントが独立してレンダリングできること。
- アプリのナビゲーションや赤ちゃん切り替え機能が以前と変わらず動作すること。

---

## Issue 3: 🏕️ Scout: GrowthChartの描画ロジックとデータ処理の分離

**📂 対象ファイル:**
`frontend/components/growth/GrowthChart.tsx`

**💡 現状の課題:**
- **ロジックと表示の結合:** Rechartsの設定（Axis, Tooltip, Legend, Brushなど）と、表示期間の計算やWHO基準データのマージロジックが混在している。
- **拡張性の低さ:** 新しいグラフタイプを追加したり、表示設定を変更したりする際に、コンポーネント全体を修正する必要がある。

**🎯 解決策・方針:**
1.  **データ処理のフック化:** データマージや期間計算（`handleQuickRange`など）のロジックを `useGrowthChartData` フックに抽出する。
2.  **グラフ設定の分離:** グラフの共通設定（色、Tooltipフォーマッタなど）を定数または設定オブジェクトとして分離する。
3.  **サブコンポーネント化:** 実際の `ComposedChart` 描画部分を `GrowthChartGraph` として切り出し、`GrowthChart` はデータ取得とコントロール（期間選択ボタン等）に専念させる。

**✅ 完了条件 (Definition of Done):**
- `GrowthChart` コンポーネントがデータロジックから解放され、UIコントロールとグラフコンポーネントの配置のみを行っていること。
- グラフの描画設定が分離され、変更が容易になっていること。
- グラフの表示や期間変更機能が以前と変わらず動作すること。
