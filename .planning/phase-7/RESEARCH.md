# リサーチ: フェーズ 7 - 閾値設定UI

## 現状の構造

### フロントエンド
- **BabySettingsPage (`frontend/app/(dashboard)/settings/babies/page.tsx`)**: 赤ちゃん設定のメインページ。
- **BabyEditDialog (`frontend/components/settings/BabyEditDialog.tsx`)**: 赤ちゃん情報を編集するダイアログ。
- **BabyForm (`frontend/components/settings/BabyForm.tsx`)**: 赤ちゃん情報の入力フォーム（React Hook Form + Zod）。
- **AddBabyDialog (`frontend/components/settings/AddBabyDialog.tsx`)**: 新しい赤ちゃんを追加するダイアログ。

### 依存関係
- **フェーズ 5**: バックエンドAPI（`PATCH /babies/{id}`）が `feeding_threshold_minutes` と `diaper_threshold_minutes` を受け取れるようになっている必要がある。
- **フェーズ 6**: フロントエンドのインジケーター（授乳・おむつウィジェット）が `Baby` オブジェクトからこれらの値を取得し、表示に反映するようになっている必要がある。

## 変更が必要な箇所

### 1. `frontend/types/baby.ts` (または `api.d.ts`)
`Baby` 型定義に `feeding_threshold_minutes` と `diaper_threshold_minutes` (両方 `number | null`) を追加。

### 2. `frontend/components/settings/BabyForm.tsx`
- `babySchema` に `feeding_threshold_minutes` と `diaper_threshold_minutes` を追加 (z.coerce.number().min(0).optional().nullable())。
- `BabyFormData` 型を更新。
- フォーム内に2つの入力フィールド（数値入力）を追加。
  - 「授乳閾値（分）」
  - 「おむつ閾値（分）」
- 入力欄の付近に「空にすると月齢に合わせた推奨値になります」というヘルプテキストを追加。

### 3. `frontend/components/settings/BabyEditDialog.tsx`
- APIリクエスト（`api.patch`）に `feeding_threshold_minutes` と `diaper_threshold_minutes` を追加。

### 4. `frontend/components/settings/AddBabyDialog.tsx`
- 新規作成時も設定できるようにする場合は追加（通常はデフォルト値で作成し、必要に応じて編集する運用で良い）。

## 成功基準の検証方法
1. 赤ちゃん設定画面で、特定の赤ちゃんの「編集」をクリック。
2. 授乳閾値（例: 180分）を入力して保存。
3. 再度編集を開き、値が保存されていることを確認。
4. ダッシュボードに移動し、授乳ウィジェットのインジケーターが180分を100%として動作していることを目視確認（フェーズ6の実装が完了している場合）。
5. 同様に空欄にして保存し、デフォルトに戻ることを確認。
