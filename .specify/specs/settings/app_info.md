# アプリ情報・バージョン表示機能 仕様書

## 概要

アプリのバージョン番号（semantic-release が `package.json` で自動管理）と最新リリースノート（GitHub Releases から取得）を、アプリ内で確認できるようにする機能。

---

## 1. バックエンド API

### 1-1. エンドポイント: `GET /api/version`

#### 概要

- **認証**: 不要（認証なしでアクセス可能）
- **用途**: アプリのバージョン情報と最新リリースノートを返す

#### ファイル構成

| ファイル | 役割 |
|---------|------|
| `app/routers/version.py` | ルーター（新規作成） |
| `app/schemas/version.py` | Pydantic スキーマ（新規作成） |

#### バージョン番号の取得

- プロジェクトルートの `frontend/package.json` の `version` フィールドを読み込む
- 起動時に一度だけ読み込み、メモリ上にキャッシュする

#### GitHub API からのリリースノート取得

- URL: `GET https://api.github.com/repos/eburairu/baby/releases/latest`
- 環境変数 `GITHUB_TOKEN` が設定されている場合は `Authorization: Bearer {token}` ヘッダーを付与
- HTTPクライアント: `httpx`（非同期）
- タイムアウト: 5 秒
- キャッシュ: インメモリ、TTL 30 分
- 失敗時の挙動: エラーを握りつぶし、`release_notes: null` でフォールバック

#### レスポンス スキーマ

```json
{
  "version": "1.19.1",
  "release_notes": "## What's Changed\n- feat: ...",
  "published_at": "2026-02-19T12:00:00Z",
  "html_url": "https://github.com/eburairu/baby/releases/tag/v1.19.1"
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `version` | `string` | `package.json` から取得したバージョン番号 |
| `release_notes` | `string \| null` | GitHub Release の `body`（Markdown形式）。取得失敗時は `null` |
| `published_at` | `string \| null` | GitHub Release の公開日時（ISO 8601）。取得失敗時は `null` |
| `html_url` | `string \| null` | GitHub Release のURL。取得失敗時は `null` |

---

## 2. フロントエンド

### 2-1. SWR フック

**ファイル**: `frontend/hooks/useAppVersion.ts`

- `GET /api/version` を `useSWR` で取得
- `revalidateOnFocus: false`（フォーカスのたびにGitHub APIを叩かない）

### 2-2. ヘッダーバージョンバッジ

**ファイル**: `frontend/app/(dashboard)/layout.tsx`

- アプリ名 "Baby App" の右隣にバッジを表示
- バッジ内容: `v{version}` 形式（例: `v1.19.1`）
- shadcn/ui `Badge variant="outline"` を使用
- レスポンシブ: `hidden sm:inline-flex`（モバイルでは非表示）
- クリック動作なし（装飾のみ）

### 2-3. 設定ページ「アプリ情報」セクション

**ファイル**: `frontend/app/(dashboard)/settings/page.tsx`

- 既存セクション（一般・アカウント・管理・ログアウト）の末尾に第3セクション「アプリ情報」を追加
- **バージョン情報カード**:
  - アイコン: `Info`（Lucide React）
  - タイトル: 「バージョン情報」
  - 説明テキスト: `v{バージョン番号}`（例: `v1.19.1`）
  - クリックで `AppInfoDialog` を開く
  - 右側に `ChevronRight` アイコン

### 2-4. AppInfoDialog コンポーネント

**ファイル**: `frontend/components/settings/AppInfoDialog.tsx`

- shadcn/ui `Dialog` を使用
- **表示内容**:
  - バージョン番号（例: `v1.19.1`）
  - リリース日（`date-fns/ja` でフォーマット: 例「2026年2月19日」）
  - リリースノート（Markdown形式を `react-markdown` でレンダリング）
    - スタイル: `prose prose-sm dark:prose-invert`（`@tailwindcss/typography` 適用）
  - 「GitHubで詳細を確認」外部リンクボタン（`html_url` へのリンク）
- **ローディング状態**: スケルトンまたはスピナーを表示
- **エラー・フォールバック**: `release_notes` が `null` の場合はリリースノートセクションを非表示

---

## 3. 依存パッケージ

### バックエンド

| パッケージ | 用途 | 追加先 |
|-----------|------|-------|
| `httpx` | GitHub API への非同期 HTTP リクエスト | `requirements.txt` |

### フロントエンド

| パッケージ | 用途 | コマンド |
|-----------|------|---------|
| `react-markdown` | Markdown テキストのレンダリング | `pnpm add react-markdown` |
| `@tailwindcss/typography` | Markdown の prose スタイル | `pnpm add -D @tailwindcss/typography` |

---

## 4. 実装時の注意事項

1. **openapi.json の更新**: バックエンドに新規ルーターを追加したら必ず実行してコミット:
   ```bash
   python scripts/export_openapi.py
   git add frontend/openapi.json
   ```
2. **プライベートリポジトリ対応**: `GITHUB_TOKEN` なしでも動作すること（`release_notes: null` フォールバック）
3. **ビルド確認**: 実装後は `cd frontend && pnpm build` でビルドエラーがないか確認

---

## 5. 検証方法

1. `curl http://localhost:8000/api/version` でレスポンスを確認
2. ダッシュボードヘッダーにバージョンバッジ（`vX.X.X`）が表示されることを確認
3. 設定ページ → 「アプリ情報」セクション → バージョン情報カードをクリック → ダイアログが開くことを確認
4. ダイアログ内にリリースノートが Markdown レンダリングされることを確認
5. 「GitHubで詳細を確認」ボタンが正しい URL を開くことを確認
