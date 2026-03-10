# 設定ナビゲーション仕様書 (Settings Navigation Specification)

## 概要

設定トップページ (`/settings`) のレイアウトと、各設定項目へのナビゲーション、およびログアウト機能について定義する。

## 1. 画面構成

設定画面は以下の4つのセクションで構成される。

### 1.1 システム管理セクション (Superadmin のみ)

システム全体の管理に関する設定。

- **管理者ダッシュボード**: システム全体の管理・監視 (`/admin`)。
  - アイコン: `ShieldCheck` (Indigo)
  - 表示条件: 現在のユーザーが `is_superadmin` の場合のみ表示。

### 1.2 一般セクション

アプリ全体の動作や表示に関する設定。

- **表示モード**: ダークモード/ライトモード/システム設定の切り替えトグル (`ThemeToggle`) を配置。
  - アイコン: `Moon`

### 1.3 アカウント・管理セクション

ユーザーや家族、データ管理に関する設定。

- **プロフィール設定**: 表示名の変更 (`/settings/profile`)。
  - アイコン: `User` (Blue)
- **通知設定**: プッシュ通知の構成 (`/settings/notifications`)。
  - アイコン: `Bell` (Amber)
- **家族設定**: 家族名・招待コード・メンバー管理 (`/settings/family`)。
  - アイコン: `Users` (Violet)
- **赤ちゃん管理 (Admin のみ)**: 赤ちゃんの情報の追加・編集・削除 (`/settings/babies`)。
  - アイコン: `Baby` (Pink)
  - 表示条件: ロールが `admin` または `is_superadmin` の場合。
- **権限管理 (Admin のみ)**: メンバーの閲覧アクセス設定 (`/settings/permissions`)。
  - アイコン: `ShieldCheck` (Emerald)
  - 表示条件: ロールが `admin` または `is_superadmin` の場合。
- **AI 設定 (Admin のみ)**: LLM モデルや生成パラメーターの調整 (`/settings/ai`)。
  - アイコン: `Sparkles` (Amber)
  - 表示条件: ロールが `admin` または `is_superadmin` の場合。
- **ログアウト**: セッションを終了する。
  - アイコン: `LogOut` (Red/Destructive)
  - 挙動: クリック時に `AlertDialog` を表示して確認を行う。

### 1.4 アプリ情報セクション

アプリ自体に関する情報。

- **Botoro について**: アプリの紹介ページ (`/about`)。
  - アイコン: `Heart` (Indigo)
- **バージョン情報**: アプリのバージョン番号と最新リリースノート。
  - アイコン: `Info` (Slate)
  - 説明テキスト: `v{バージョン番号}`（例: `v1.19.1`）
  - 挙動: クリックで `AppInfoDialog` を開く。詳細は `app_info.md` 参照。

## 2. デザインガイドライン

- `ui_design_system.md` に従い、各項目は `SettingItem` コンポーネントを使用して表示する。
- 各ナビゲーション項目には、内容を想起させるアイコン（Lucide React）と、背景色（淡い色）、および右側に `ChevronRight` を配置する。

## 3. ログアウトの挙動

- ログアウト実行時は `api.post("/auth/logout")` を呼び出し、成功後に `/login` ページへ遷移する。
- クライアント側の状態（SWRキャッシュ等）をクリアする。
