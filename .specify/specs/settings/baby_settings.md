# 赤ちゃん管理画面 仕様書 (Baby Settings Specification)

## 概要

Botoro の赤ちゃん設定画面（`/settings/babies`）の仕様。
家族に登録されている赤ちゃんの一覧表示、情報編集、削除、および新規追加を行う管理画面。
エントリポイントはダッシュボードヘッダーの Settings アイコン。（現在は `/settings` への暫定リンク）

## デザインコンセプト

`ui_design_system.md` の統一レイアウトに準拠する。

- **ページ背景**: `bg-slate-50`
- **カード**: `rounded-2xl shadow-sm border-0 bg-white`
- **ヘッダー**: sticky、`h-14 py-3 px-4`、戻るボタン付き
- **アクションカラー**:
    - プライマリボタン（追加・保存）: `bg-indigo-600 hover:bg-indigo-700 text-white`
    - 危険操作（削除）: `bg-red-500 hover:bg-red-600 text-white`
    - **キャンセル**: shadcn `variant="outline"`
    - **ダイアログの挙動**: 
        - 入力項目（特に特徴・傾向の多行テキストや閾値設定）が多いため、画面外への突き抜けを防止するために `max-h-[90vh]` および `overflow-y-auto` によるスクロール制御を行う。
    - **赤ちゃんカテゴリーカラー**: `pink` 系
    - タイトル色: `text-pink-500`
    - ライトBG: `bg-pink-50`

## ユーザーストーリー

- 赤ちゃんの名前をタイプミスしたので正しい名前に修正したい。
- 出産後に予定日から実際の誕生日に更新したい。
- 第二子が生まれたので新しい赤ちゃんを追加したい。
- 以前に登録していた赤ちゃんの情報をすべての記録ごと削除したい。
- 家族に登録されているすべての赤ちゃんをまとめて確認したい。

## 機能要件

## 機能要件

### BF1: 赤ちゃん一覧の表示

- 家族に登録されているすべての赤ちゃんをカード形式で一覧表示する。
- 各カードに表示する情報:
    - 赤ちゃんの名前
    - 月齢（`birthday` から算出: 例 "生後 3ヶ月 12日"）
    - 生年月日（`birthday`、`YYYY/MM/DD` 形式）
    - 予定日（`due_date`、設定がある場合のみ）
    - 特徴・傾向（`characteristics`、概要または全文）
- 管理者（admin）のみが閲覧・アクセスできる。

### BF2: 赤ちゃん情報の編集

- admin ユーザーのみ各カードに「編集」ボタンを表示する。
- タップするとダイアログが開く（ページ遷移なし）。
- 編集可能なフィールド:
    - 名前（必須、空文字不可）
    - 性別（「男の子」、「女の子」、「わからない」から選択。妊娠中も利用するため「わからない」を選択可能とする。）
    - 生年月日（`birthday`、任意）
    - 出産予定日（`due_date`、任意）
    - 特徴・傾向（`characteristics`、任意、多行テキスト）
        - AIが日誌生成時に自動更新するフィールドだが、親が手動で修正・追記できるようにする。
- `react-hook-form` + `zod` によるバリデーションを使用する。
- 追加・編集画面は共通のフォームコンポーネントを利用する。
- 保存後は一覧を即時更新し、成功トーストを表示する。

### BF3: 赤ちゃんの削除

- admin ユーザーのみ各カードに「削除」ボタンを表示する。
- タップするとセーフガード付き確認ダイアログを表示する。
    - ダイアログ内に「すべての記録（授乳・睡眠・おむつ・成長など）も削除されます」と明示する。
    - 削除を実行するには赤ちゃんの名前を入力して確認する（誤操作防止）。
- 削除後は一覧から即時除去する。

### BF4: 新規赤ちゃんの追加

- admin ユーザーのみページ上部（またはフローティングボタン）に「＋ 赤ちゃんを追加」ボタンを表示する。
- タップするとダイアログが開く。
- 入力フィールドは BF2 の編集フォームと同一（特徴含む）。
- 既存のダッシュボードの赤ちゃん追加ロジックを本コンポーネントに移植・リファクタリングする（ダッシュボードからも同一コンポーネントを利用可能にする）。
- 追加後は一覧に即時反映し、成功トーストを表示する。

## 画面構成案

```
┌─────────────────────────────────────┐
│ ← 戻る    赤ちゃん管理             │  ← sticky header h-14
│                     [＋ 赤ちゃんを追加]  ← admin のみ表示
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  👶 レンくん                         │
│  生後 3ヶ月 12日                     │
│  誕生日: 2025/10/31                  │
│  予定日: 2025/11/05                  │
│  ---------------------------------  │
│  [特徴・傾向]                        │
│  ・最近よく寝返りをするようになった。      │
│  ・夜泣きが少し減ってきた。             │
│                                     │
│                      [編集] [削除]  │  ← admin のみボタン表示
└─────────────────────────────────────┘

...

--- BabyEditDialog ---
┌─────────────────────────────────────┐
│  赤ちゃんの情報を編集                │
│  ─────────────────────────────────  │
│  名前 *                             │
│  ┌───────────────────────────────┐  │
│  │ レンくん                      │  │
│  └───────────────────────────────┘  │
│  性別                               │
│  ( ) 男の子  ( ) 女の子  ( ) わからない │
│  生年月日                           │
│  ┌───────────────────────────────┐  │
│  │ 2025/10/31                    │  │
│  └───────────────────────────────┘  │
│  出産予定日                          │
│  ┌───────────────────────────────┐  │
│  │ 2025/11/05                    │  │
│  └───────────────────────────────┘  │
│  特徴・傾向                          │
│  ┌───────────────────────────────┐  │
│  │ 最近よく寝返りをするようになった  │  │
│  │ 夜泣きが少し減ってきた           │  │
│  └───────────────────────────────┘  │
│              [キャンセル] [保存]     │
└─────────────────────────────────────┘
```

## 技術設計

### コンポーネント構成

```
frontend/app/(dashboard)/settings/babies/page.tsx
frontend/components/settings/
  BabyCard.tsx          ← 赤ちゃん情報カード（編集・削除ボタン付き、特徴表示追加）
  BabyForm.tsx          ← 赤ちゃん情報入力フォーム（追加・編集で共通利用）
  BabyEditDialog.tsx    ← 赤ちゃん情報編集ダイアログ（BabyForm を利用）
  AddBabyDialog.tsx     ← 新規追加ダイアログ（BabyForm を利用）
  BabyDeleteDialog.tsx  ← 削除確認ダイアログ
```

#### データ取得フック

```typescript
// 既存の useBabies フックを再利用（または新規作成）
useBabies()     // GET /api/babies/ → 赤ちゃん一覧
```

#### 状態管理

- ダイアログの開閉と選択中の赤ちゃんは `useState` でローカル管理。
- 赤ちゃん一覧は SWR でキャッシュ管理し、追加・編集・削除後に `mutate` で再取得。

#### フォームバリデーション（zod スキーマ）

```typescript
const babySchema = z.object({
  name: z.string().min(1, "名前を入力してください"),
  gender: z.enum(["boy", "girl", "unknown"]).optional(),
  birthday: z.string().optional(),   // "YYYY-MM-DD" or ""
  due_date: z.string().optional(),   // "YYYY-MM-DD" or ""
  characteristics: z.string().optional(), // 多行テキスト
});
```

### API エンドポイント

| メソッド | エンドポイント | 実装状況 | 用途 |
|---------|--------------|---------|------|
| GET | `/api/babies/` | ✅ 実装済み | 赤ちゃん一覧取得 |
| POST | `/api/babies/` | ✅ 実装済み（admin のみ） | 赤ちゃん新規追加 |
| PATCH | `/api/babies/{baby_id}` | ✅ 実装済み | 赤ちゃん情報更新 |
| DELETE | `/api/babies/{baby_id}` | ✅ 実装済み | 赤ちゃん削除（関連記録含む） |

#### スキーマ定義

`app/schemas/baby.py`

```python
class BabyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    birthday: Optional[date] = None
    due_date: Optional[date] = None
    gender: Optional[Literal["boy", "girl", "unknown"]] = None
    characteristics: Optional[str] = Field(None, max_length=1000)

    @field_validator('name')
    @classmethod
    def name_must_not_be_none(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            raise ValueError('Name cannot be null')
        return v
```

#### 削除時のカスケード仕様

`DELETE /api/babies/{baby_id}` は以下のデータをすべて削除する:

- `babies` レコード
- `baby_permissions` レコード（`ondelete="CASCADE"` により自動削除）
- `feedings`, `sleeps`, `diapers`, `growth_records`, `contractions`, `schedules` の関連レコード

各子テーブルに `ForeignKey("babies.id", ondelete="CASCADE")` が設定されている場合は DB レベルで自動削除。
設定されていない場合はアプリケーション層で明示的に削除する。

#### エラーハンドリング

- 名前が空文字: フロントエンドバリデーションで弾く（zod）。
- 他ユーザーが参照中の赤ちゃんを削除: バックエンドで 204 を返し削除を完了する（アクセス中のユーザーは次のリクエストで 404 を受け取る）。
- 削除確認の名前不一致: フロントエンドで削除ボタンを disabled 制御。

## 権限制御

| 操作 | admin | member |
|------|-------|--------|
| 赤ちゃん一覧の閲覧（設定ページ） | ✅ | ❌ |
| 赤ちゃん情報の編集 | ✅ | ❌ |
| 赤ちゃんの削除 | ✅ | ❌ |
| 赤ちゃんの新規追加 | ✅ | ❌ |

権限チェックはフロントエンドの UI 制御（ページレベルのリダイレクト）とバックエンドの両方で実施する。
バックエンドは `get_current_user()` および `FamilyUser.role` を参照して検証する。
`verify_baby_access()` は閲覧権限の確認に引き続き使用する。

## 参照先ドキュメント

- `.specify/specs/ui/ui_design_system.md` — カラーパレット・ページレイアウト・コンポーネントデザイン
- `.specify/specs/infrastructure/system_design.md` — 権限モデル（Family → User → Baby）
- `app/models/baby.py` — DBスキーマ（Baby, BabyPermission）
- `app/schemas/baby.py` — Pydanticスキーマ（BabyBase, BabyCreate, BabyResponse）
- `app/routers/babies.py` — 既存の API エンドポイント実装

## 実装チェックリスト

### バックエンド

- [x] `PATCH /api/babies/{baby_id}` エンドポイント実装（admin のみ）
- [x] `DELETE /api/babies/{baby_id}` エンドポイント実装（admin のみ、関連記録カスケード削除）
- [x] 各子テーブルの `ondelete="CASCADE"` 設定確認・必要に応じてマイグレーション追加
- [x] `BabyUpdate` スキーマ修正（`characteristics` 対応）（`app/schemas/baby.py`）
- [x] `Baby` モデル修正（重複定義削除）（`app/models/baby.py`）

### フロントエンド

- [x] `frontend/app/(dashboard)/settings/babies/page.tsx` 作成
- [x] `BabyCard.tsx` 改修（特徴表示）
- [x] `BabyEditDialog.tsx` 改修（特徴フィールド追加）
- [x] `AddBabyDialog.tsx` 改修（特徴フィールド追加、ダッシュボードの追加ロジックを移植・共通化）
- [ ] ダッシュボードから `AddBabyDialog` を共通コンポーネントとして利用するようリファクタリング
- [ ] `cd frontend && pnpm build` でビルド確認

### ナビゲーション

- [x] `/settings/babies` ページヘッダーに「← ダッシュボードへ」戻るボタンを実装
- [ ] ダッシュボードと Settings 画面間のシームレスな遷移を確認
