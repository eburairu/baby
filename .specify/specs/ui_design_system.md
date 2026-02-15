# UI デザインシステム仕様書

## 概要

Baby-App 全ページに適用する統一 UI/UX ガイドライン。
現状の各ページで生じているデザイン・実装の不統一を解消し、ユーザーが画面遷移しても違和感のない一貫した体験を提供する。

## 背景・現状の課題

コードベース調査（2026-02-13 時点）で確認された主な不統一点：

| 分類 | 問題 |
|------|------|
| ページヘッダー | `<header>` タグ使用ページ（Feeding, Diaper）と `<div>` 使用ページ（Sleep, Growth, Contraction）が混在 |
| タイトルフォントサイズ | `text-lg`（Feeding, Diaper）/ `text-xl`（Sleep）/ `text-2xl`（Growth, Contraction, Dashboard）の3種類が混在 |
| スティッキーヘッダー | Feeding と Diaper のみに適用。他ページには未適用 |
| 戻るボタン | Contraction ページのみに実装。他詳細ページには存在しない |
| フォームコンポーネント | DiaperForm がネイティブ HTML `<input>` + Tailwind で実装。他ページは shadcn/ui Form を使用 |
| 統計カード背景色 | FeedingStats はグラデーション / SleepStats は単色 / DiaperStats は白と、カテゴリーごとに異なる |
| ボタン角丸 | `rounded-xl` / `rounded-2xl` / shadcn デフォルトが混在 |
| CardContent パディング | `pt-6` / `p-4` / デフォルトが混在 |
| ローディング表示 | サイズ（`min-h-64` / `p-4` / `py-12`）とカラー（`text-gray-400` / `text-gray-500` / `text-muted-foreground`）が不統一 |
| エラーハンドリング | `alert()` による表示と、状態管理による DOM 表示が混在 |
| アイコン | ダッシュボードウィジェットはエモジ、詳細ページは Lucide React が混在 |

---

## 1. デザイントークン（共通変数）

### 1.1 カラーパレット

各機能カテゴリーのカラーを以下に固定する。実装時は必ずこの表に従い、表にないカラーバリアントを使用しない。

#### カテゴリーカラー

| カテゴリー | Tailwind プレフィックス | タイトル色 | ライトBG | ホバーBG | アクティブBG | アクティブ文字 |
|-----------|------------------------|-----------|---------|---------|-------------|-------------|
| 授乳 (Feeding) | `rose` | `text-rose-500` | `bg-rose-50` | `hover:bg-rose-100` | `bg-rose-500` | `text-white` |
| 睡眠 (Sleep) | `indigo` | `text-indigo-500` | `bg-indigo-50` | `hover:bg-indigo-100` | `bg-indigo-500` | `text-white` |
| おむつ (Diaper) | `amber` | `text-amber-500` | `bg-amber-50` | `hover:bg-amber-100` | `bg-amber-500` | `text-white` |
| 成長 (Growth) | `emerald` | `text-emerald-500` | `bg-emerald-50` | `hover:bg-emerald-100` | `bg-emerald-500` | `text-white` |
| 陣痛 (Contraction) | `red` | `text-red-500` | `bg-red-50` | `hover:bg-red-100` | `bg-red-500` | `text-white` |

> **注意**: FeedingForm のタイマーボタンで使用していた `pink` 系は廃止し、`rose` 系に統一する。DiaperForm の詳細ページでの `blue` / `purple` 混在も廃止し、`amber` 系に統一する。

#### ベースカラー

| 用途 | クラス |
|------|--------|
| ページ背景 | `bg-slate-50` |
| カード背景 | `bg-white` |
| 主要テキスト | `text-gray-800` |
| 補助テキスト | `text-gray-500` |
| 非活性テキスト | `text-muted-foreground` |
| エラーテキスト | `text-red-500` |

#### アクションカラー（カテゴリー非依存）

| 用途 | クラス |
|------|--------|
| フォーム送信ボタン（プライマリ） | `bg-indigo-600 hover:bg-indigo-700 text-white` |
| 危険操作ボタン（削除等） | `bg-red-500 hover:bg-red-600 text-white` |
| キャンセルボタン | shadcn `variant="outline"` デフォルト |

### 1.2 スペーシング

| 用途 | 値 |
|------|-----|
| ページ全体のパディング | `px-4` |
| セクション間マージン | `mb-6` |
| カード内パディング | `p-4`（CardContent は `pt-4`） |
| ヘッダー高さ | `h-14`（`py-3 px-4`） |
| フォーム要素間 | `space-y-4` |

### 1.3 シェイプ

| 用途 | 値 |
|------|-----|
| カード | `rounded-2xl shadow-sm border-0` |
| 統計ミニカード | `rounded-xl shadow-sm border-0` |
| ボタン（大） | `rounded-xl`（`h-12` 以上） |
| ボタン（小・インライン） | shadcn デフォルト（`rounded-md`） |
| ウィジェット内クイックボタン | `rounded-lg h-8` |
| アイコンラッパー | `rounded-full` |

---

## 2. ページ構造

### 2.1 詳細ページ（サブページ）の統一レイアウト

ダッシュボードから遷移する各詳細ページ（Feeding, Sleep, Diaper, Growth, Contraction）は以下の構造に統一する。

```
<div className="min-h-screen bg-slate-50">
  {/* 共通ページヘッダー */}
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
    <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
      <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
        {/* カテゴリーアイコン（Lucide React） + タイトル */}
      </h1>
    </div>
  </header>

  {/* ページコンテンツ */}
  <main className="px-4 py-6 max-w-2xl mx-auto space-y-6">
    {/* 統計カード */}
    {/* フォーム / アクションカード */}
    {/* 履歴リスト */}
  </main>
</div>
```

#### ヘッダーの設計意図

- **`sticky top-0 z-10`**: スクロール時にヘッダーが追従し、常にページタイトルが見える
- **`bg-white/80 backdrop-blur-sm`**: Glassmorphism 効果で上品な透過表示
- **`border-b border-gray-100 shadow-sm`**: コンテンツとの境界を明確化
- **`h-14`**: 全ページで統一した高さ（タップ可能な十分なサイズ）
- **戻るボタン（廃止）**: グローバルヘッダーのハンバーガーメニューやロゴタイトルで代替可能なため、サブページ側からは削除。
- **ページタイトル**: 中央に `text-base font-semibold text-gray-800` を配置し、視認性を高める。

#### 各詳細ページのタイトル・アイコン定義

| ページ | タイトル | Lucide アイコン | カテゴリーカラー |
|--------|---------|----------------|----------------|
| Feeding | 授乳記録 | `Baby` または `Droplets` | `rose` |
| Sleep | 睡眠記録 | `Moon` | `indigo` |
| Diaper | おむつ記録 | `Smile` | `amber` |
| Growth | 成長記録 | `TrendingUp` | `emerald` |
| Contraction | 陣痛タイマー | `Timer` | `red` |

> **注**: アイコンはページタイトルと同色（カテゴリーカラーの `text-{color}-500`）で表示する。

### 2.2 ダッシュボードのレイアウト

ダッシュボードはサブページと異なり、ヘッダーは `BabyProfileCard` が担う。現状のレイアウトは概ね適切なため変更しない。

---

## 3. コンポーネント設計

### 3.1 統計カード（Stats Card）

詳細ページの上部に表示するサマリーカード。現状の不統一（グラデーション / 単色 / 白）を以下に統一する。

#### 統一デザイン

```tsx
// 統計カードの外枠
<Card className="bg-white rounded-2xl shadow-sm border-0">
  <CardContent className="pt-6">
    <div className="grid grid-cols-2 gap-4">
      {/* 個々の統計ミニカード */}
      <div className="bg-{category}-50 rounded-xl p-4 flex items-center gap-3">
        <div className="bg-white rounded-full p-2 shadow-sm">
          <Icon className="h-4 w-4 text-{category}-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500">ラベル</p>
          <p className="text-lg font-bold text-gray-800">値</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**廃止するパターン**:

- `bg-gradient-to-br from-pink-50 to-orange-50`（FeedingStats の現状）→ `bg-rose-50` に変更
- `bg-indigo-50` を直接カードに適用するパターン（SleepStats の現状）→ 外枠は `bg-white`、ミニカードに適用
- `bg-white` 単色で個々の統計を区別しないパターン（DiaperStats の現状）→ `bg-amber-50` のミニカードに変更

### 3.2 フォームカード

記録入力フォームのカード。全フォームで shadcn/ui Form コンポーネントを使用する。

```tsx
<Card className="bg-white rounded-2xl shadow-sm border-0">
  <CardContent className="pt-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                ラベル
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
          disabled={isSubmitting}
        >
          {isSubmitting ? "保存中..." : "保存"}
        </Button>
      </form>
    </Form>
  </CardContent>
</Card>
```

**廃止するパターン**:

- DiaperForm で使用しているネイティブ `<input className="text-sm p-2 border border-gray-200 rounded-lg w-full" />`
  → shadcn/ui `<Input>` に置き換え
- ネイティブ `<label>` タグ → shadcn/ui `<FormLabel>` に置き換え

### 3.3 アクション選択ボタン（大型）

DiaperForm の「おしっこ / うんち / 両方」ボタンのような、複数択からひとつを選ぶ大型ボタン。

```tsx
// 選択状態に応じてスタイルが変化するパターン
<button
  type="button"
  onClick={() => setValue("type", "wet")}
  className={cn(
    "h-20 w-full flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-colors",
    selected === "wet"
      ? "border-amber-400 bg-amber-50 text-amber-700"
      : "border-gray-200 bg-white text-gray-500 hover:bg-amber-50 hover:border-amber-200"
  )}
>
  <span className="text-2xl">💧</span>
  <span className="text-xs font-medium">おしっこ</span>
</button>
```

**廃止するパターン**:

- DiaperForm での `bg-blue-50 text-blue-600`（おしっこ）/ `bg-purple-50 text-purple-600`（両方）
  → Diaper カテゴリーカラー `amber` に統一

### 3.4 ウィジェット内クイックボタン（ダッシュボード）

```tsx
// 現状の実装（すでに統一されているため基本的に変更なし）
<Button
  variant="outline"
  size="sm"
  className="flex-1 bg-{category}-50 text-{category}-600 hover:bg-{category}-100 border-0 text-xs h-8 rounded-lg"
>
  ボタンラベル
</Button>
```

### 3.5 タイマー・トグルボタン（大型フルWidth）

```tsx
// ContractionTimer・SleepTimer等で使用
<Button
  type="button"
  onClick={handleToggle}
  className={cn(
    "h-16 w-full text-base font-bold rounded-xl transition-all duration-200",
    isActive
      ? "bg-gray-700 hover:bg-gray-800 text-white"
      : "bg-{category}-500 hover:bg-{category}-600 text-white shadow-md shadow-{category}-200"
  )}
>
  {isActive ? "停止" : "開始"}
</Button>
```

---

## 4. 共通コンポーネント（新規作成）

現在各ページに重複実装されているローディング・エラー表示を共通コンポーネントに切り出す。

### 4.1 `PageLoading`

ページ全体のローディング状態を表示する共通コンポーネント。

**ファイルパス**: `frontend/components/ui/page-loading.tsx`

```tsx
// 仕様
export function PageLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
```

**廃止するパターン**:

- `<div className="p-4 text-center text-gray-500">読み込み中...</div>`（Feeding）
- `<div className="flex items-center justify-center min-h-64 text-gray-400">読み込み中...</div>`（Dashboard）
- `<div className="flex justify-center py-12 text-muted-foreground">読み込み中...</div>`（Contraction）

### 4.2 `ErrorMessage`

エラーを表示する共通コンポーネント。`alert()` によるエラー表示を廃止する。

**ファイルパス**: `frontend/components/ui/error-message.tsx`

```tsx
// 仕様
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
```

**廃止するパターン**:

- `alert("エラーが発生しました")`（DiaperForm）
- `{error && <div className="text-red-500 text-sm">{error}</div>}`
  → `{error && <ErrorMessage message={error} />}` に統一

---

## 5. アイコン使用ルール

### 5.1 エモジとLucide Reactの使い分け

| 場面 | 使用ルール | 理由 |
|------|-----------|------|
| ダッシュボードウィジェットのタイトル | エモジ（現状維持） | 視覚的なアクセントとして適切。変更のコストに対して効果が低い |
| 詳細ページのヘッダータイトル | Lucide React | 統一感を優先。エモジはOSによってレンダリングが異なる |
| 詳細ページの統計カード | Lucide React | データ表示として正確な表示が必要 |
| アクション選択ボタン（DiaperFormの種別等） | エモジ（現状維持） | 直感的なUIとして適切 |
| フォームラベル | なし | シンプルさを優先 |

### 5.2 アイコンサイズ

| 使用箇所 | サイズ |
|---------|--------|
| ヘッダータイトルの隣 | `h-4 w-4` |
| 統計カードのアイコン | `h-4 w-4` |
| 戻るボタンの矢印 | `h-4 w-4` |
| ウィジェットの矢印リンク | `h-6 w-6` |
| ローディングスピナー | `h-8 w-8` |
| エラーアイコン | `h-4 w-4` |

---

## 6. フォーム統一ルール

### 6.1 フォームライブラリ

全フォームで `react-hook-form` + `zod` + `shadcn/ui Form` コンポーネントを使用する。ネイティブHTMLフォーム要素は使用しない。

### 6.2 日時入力

```tsx
// 統一パターン
<FormField
  control={form.control}
  name="recordedAt"
  render={({ field }) => (
    <FormItem>
      <FormLabel>記録日時</FormLabel>
      <FormControl>
        <Input type="datetime-local" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 6.3 送信ボタン

```tsx
// 全フォーム共通
<Button
  type="submit"
  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
  disabled={isSubmitting}
>
  {isSubmitting ? "保存中..." : "保存する"}
</Button>
```

> **注**: 送信ボタンは `indigo` で統一する（カテゴリーカラーに依存しない）。これは「保存」という普遍的なアクションのため、カテゴリーカラーに染めず中立的に扱う。

---

## 7. ナビゲーション

### 7.1 詳細ページの戻るボタン（廃止）

各詳細ページに個別に実装されていた「ダッシュボードへ戻る」ボタンは廃止された。

**廃止の理由**:
1. **グローバルヘッダーの存在**: 全ページ共通の `DashboardLayout` にハンバーガーメニューと「Baby App」タイトル（ルートへのリンク）が既に存在するため。
2. **UI の整理**: 二重ヘッダーによる視覚的な複雑さを軽減し、モバイルでの表示領域を確保するため。

今後、詳細ページからダッシュボードに戻る際は、画面最上部のグローバルヘッダー内のタイトルをクリックするか、ハンバーガーメニューを利用する。

### 7.2 ウィジェットの詳細ページリンク

各ウィジェット右上に Arrow ボタンで詳細ページへ遷移。現状の実装は統一されているため変更なし。

---

## 8. ページ別の実装差分

本仕様書に従い変更が必要なページ・コンポーネントの一覧。

### 高優先度（UX直結）

| ファイル | 変更内容 |
|---------|---------|
| `app/(dashboard)/**/page.tsx` | サブヘッダーの「ダッシュボードへ戻る」ボタンを削除。タイトルを中央寄せに調整 |
| `app/(dashboard)/settings/profile/page.tsx` | 冗長な戻るボタンを削除。タイトルを中央寄せに調整 |
| `components/diaper/DiaperForm.tsx` | ネイティブ `<input>` を shadcn/ui `<Input>` に置き換え。react-hook-form 導入。ボタン色を amber 統一 |

### 中優先度（統一感）

| ファイル | 変更内容 |
|---------|---------|
| `components/feeding/feeding-stats.tsx` | グラデーション背景（`from-pink-50 to-orange-50`）を廃止し、`bg-white` 外枠 + `bg-rose-50` ミニカードに変更 |
| `components/sleep/sleep-stats.tsx` | `bg-indigo-50` のカード直接適用を廃止し、外枠 `bg-white` + `bg-indigo-50` ミニカードに変更 |
| `components/diaper/DiaperStats.tsx` | ミニカードを `bg-amber-50` ベースに変更（現状 `bg-white`） |
| `components/feeding/feeding-form.tsx` | タイマーボタンの `pink` 系を `rose` 系に変更 |

### 低優先度（共通コンポーネント整備）

| ファイル | 変更内容 |
|---------|---------|
| `components/ui/page-loading.tsx` | 新規作成（PageLoading コンポーネント） |
| `components/ui/error-message.tsx` | 新規作成（ErrorMessage コンポーネント） |
| 全詳細ページ・フォーム | PageLoading / ErrorMessage を使用するよう変更。`alert()` 廃止 |

---

## 9. Before / After サンプル

### Before: Sleep ページのヘッダー（現状）

```tsx
// app/(dashboard)/sleep/page.tsx
<div className="flex items-center gap-2 mb-4">
  <Moon className="h-6 w-6 text-indigo-500" />
  <h1 className="text-xl font-bold text-gray-800">睡眠記録</h1>
</div>
```

### After: Sleep ページのヘッダー（統一後）

```tsx
// app/(dashboard)/sleep/page.tsx
<header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
  <div className="flex items-center justify-center h-14 px-4 max-w-2xl mx-auto">
    <h1 className="text-base font-semibold text-gray-800 flex items-center gap-1.5">
      <Moon className="h-4 w-4 text-indigo-500" />
      睡眠記録
    </h1>
  </div>
</header>
```

---

## 10. 実装チェックリスト

仕様書に基づく実装完了の確認項目。

### ページヘッダー

- [x] 全詳細ページで `sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 shadow-sm` を適用
- [x] 全詳細ページで `h-14` のヘッダー高さを統一
- [x] 全詳細ページのタイトルを `text-base font-semibold text-gray-800` に統一
- [x] 全詳細ページから冗長な戻るボタンを削除し、タイトルを中央寄せ（または適切に配置）

### カラー

- [x] Feeding 関連の `pink` 系を `rose` 系に統一
- [x] Diaper の詳細ページのボタン色を `blue` / `purple` から `amber` に変更
- [x] 全カテゴリーで所定の Tailwind カラープレフィックスのみ使用

### フォーム

- [x] DiaperForm のネイティブ `<input>` を shadcn/ui `<Input>` に置き換え
- [x] DiaperForm に `react-hook-form` + `zod` を導入
- [x] 全フォームの送信ボタンを `bg-indigo-600 rounded-xl h-11` で統一

### 統計カード

- [x] 全詳細ページの統計カードを「外枠 `bg-white` + ミニカード `bg-{category}-50`」構造に統一
- [x] FeedingStats のグラデーション背景を廃止

### 共通コンポーネント

- [x] `PageLoading` コンポーネント新規作成・全ページで適用
- [x] `ErrorMessage` コンポーネント新規作成・全ページで適用
- [x] `alert()` によるエラー表示をすべて廃止

### ナビゲーション

- [x] サブページ内の「ダッシュボードへ戻る」ボタンを廃止し、グローバルヘッダーに集約
- [x] Contraction の旧スタイル（`<a href="/">← ダッシュボード</a>`）を廃止
