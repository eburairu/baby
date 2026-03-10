# Botoro Frontend

Next.js 16 (App Router, Static Export) によるフロントエンド。

## 開発サーバーの起動

```bash
pnpm dev
```

`http://localhost:3000` でアクセス可能。

## ビルド

```bash
pnpm build   # 型チェック + 静的ファイル生成 (frontend/out/)
pnpm lint    # ESLint
pnpm test    # Vitest
```

## パッケージ管理

このプロジェクトは **pnpm** を使用しています。

```bash
pnpm install             # 依存インストール（初回・package.json変更時）
pnpm add <package>       # 本番依存の追加
pnpm add -D <package>    # 開発依存の追加
```
