# Scout Journal 🏕️

## 2024-05-24 - フロントエンドのリファクタリング探索

### 学び: コードの重複と責務の混在
今回の探索では、特にフォーム周り (`FeedingForm`, `DiaperForm`) でUIコンポーネントとロジックの重複が目立ちました。
また、`DashboardLayout` が多くの責務を持ちすぎており、Fat Component化していることも確認できました。
これらを共通化・分離することで、コードの見通しが良くなり、将来的な変更に強くなるでしょう。

### アクション:
以下の3つの領域について、リファクタリングIssueを起票することを推奨します。

---

## Issue 1: `FeedingForm` と `DiaperForm` の選択UIコンポーネント化

**タイトル:** 🏕️ Scout: `FeedingForm` と `DiaperForm` の選択UIコンポーネント化

**本文:**
Scoutが見つけました。`frontend/components/feeding/feeding-form.tsx` と `frontend/components/diaper/DiaperForm.tsx` に、似たような「選択ボタンUI」のロジックが重複しています。

📂 **対象ファイル:**
- `frontend/components/feeding/feeding-form.tsx` (母乳/ミルク切り替え、授乳完了度)
- `frontend/components/diaper/DiaperForm.tsx` (おしっこ/うんち選択)

💡 **現状の課題:**
- 各ファイルで `activeTab` や `selectedType` の状態を持ち、それに伴ってボタンのスタイル（`cn(...)`）や `aria-pressed` 属性を直書きしています。
- 特にスタイル切り替えの条件分岐が JSX 内に散らばっており、変更時に両方を修正する必要があります。
- 似たようなUIなのに微妙に実装が異なっており、統一感がありません。

🎯 **解決策・方針:**
- `frontend/components/ui/segmented-control.tsx` (仮) のような共通コンポーネントを作成する。
- `options` (label, value, icon?), `value`, `onChange` を受け取り、選択状態の管理とスタイル適用を一元化する。
- アクセシビリティ属性 (`aria-pressed`, `role="group"`) もこのコンポーネント内で正しく実装する。

✅ **完了条件 (Definition of Done):**
- 新しい共通コンポーネントが作成されていること。
- `FeedingForm` と `DiaperForm` がそのコンポーネントを使用するようにリファクタリングされていること。
- 既存の挙動（選択時のスタイル変化、フォーム値の更新）が維持されていること。

---

## Issue 2: `DashboardLayout` の肥大化解消とナビゲーション設定の分離

**タイトル:** 🏕️ Scout: `DashboardLayout` の肥大化解消（ナビゲーション設定の分離とサブコンポーネント化）

**本文:**
Scoutが見つけました。`frontend/app/(dashboard)/layout.tsx` が300行を超え、複数の責務（設定、レイアウト、各デバイス向けヘッダー/ナビゲーション）を抱え込んでいます。

📂 **対象ファイル:**
- `frontend/app/(dashboard)/layout.tsx`

💡 **現状の課題:**
- ナビゲーション項目 (`ALL_NAV_ITEMS`, `BOTTOM_NAV_ITEMS`) がコンポーネントファイル内にハードコードされており、再利用性が低い。
- Desktop Header, Mobile Header, Mobile Bottom Nav, Sidebar Sheet のすべてのJSXが1つの `return` 文の中に詰め込まれており、可読性が悪い。
- `born` フラグや `isV2` フラグによる条件分岐が複雑化している。

🎯 **解決策・方針:**
1. **設定の分離:** ナビゲーション項目の定義を `frontend/config/navigation.ts` (または `constants/navigation.ts`) に移動する。
2. **コンポーネント分割:**
   - `DesktopHeader`
   - `MobileHeader`
   - `BottomNavigation`
   - `NavigationSheet` (サイドバー)
   これらを `frontend/components/dashboard/layout/` ディレクトリ配下の別ファイルに切り出す。
3. **Layoutの責務削減:** `DashboardLayout` はこれらのサブコンポーネントを配置し、認証ガードやデータフェッチの結果を渡すだけの役割にする。

✅ **完了条件 (Definition of Done):**
- `layout.tsx` が150行以下程度にスリム化されていること。
- ナビゲーション設定が別ファイルに分離されていること。
- 各サブコンポーネントが独立して定義されていること。
- レイアウト崩れやナビゲーションの挙動変化がないこと。

---

## Issue 3: フォーム送信ロジックのフック化 (`useFormSubmit`)

**タイトル:** 🏕️ Scout: フォーム送信ロジック（ローディング・エラー・トースト）のフック化 (`useFormSubmit`)

**本文:**
Scoutが見つけました。`frontend/components/feeding/feeding-form.tsx` と `frontend/components/diaper/DiaperForm.tsx` で、フォーム送信時の「送信中フラグ管理」「エラーハンドリング」「トースト通知」のボイラープレートコードが重複しています。

📂 **対象ファイル:**
- `frontend/components/feeding/feeding-form.tsx`
- `frontend/components/diaper/DiaperForm.tsx`
- その他、`frontend/components/growth/GrowthRecordForm.tsx` なども同様の可能性があります。

💡 **現状の課題:**
- 各フォームコンポーネントで `const [isSubmitting, setIsSubmitting] = useState(false)` を定義している。
- `try-catch-finally` ブロック内で `setIsSubmitting` を true/false に切り替え、`toast.success` / `toast.error` を呼ぶ処理が毎回書かれている。
- 本来のビジネスロジック（データの整形など）が、これらの制御コードに埋もれて見にくくなっている。

🎯 **解決策・方針:**
- `frontend/hooks/useFormSubmit.ts` を作成する。
- 以下のようなインターフェースを持つカスタムフックを実装する：
  ```ts
  const { submit, isSubmitting, error } = useFormSubmit({
    onSuccess: () => { ... },
    onError: (err) => { ... } // オプション
  });

  // 使用イメージ
  const handleSubmit = async (data) => {
    await submit(async () => {
      await api.post(...);
    });
  };
  ```
- 必要であれば `react-hook-form` との連携も考慮する（`form.handleSubmit` をラップするかどうか）。

✅ **完了条件 (Definition of Done):**
- `useFormSubmit` フックが実装されていること。
- 対象のフォームコンポーネントから `isSubmitting` のステート管理と `try-catch` の定型句が削除され、フックを使用する形になっていること。
- 正常系・異常系の挙動（トースト表示など）が変わっていないこと。
