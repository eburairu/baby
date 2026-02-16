# 認証仕様書 (Authentication Specification)

## 概要
本ドキュメントは、Baby Appにおけるユーザー認証の仕様、特にセッション管理とセキュリティ対策について定義する。

## 1. セッション管理

### 1.1 ログイン保持期間
- **有効期限**: ログイン成功時より **7日間** とする。
- ユーザーが明示的にログアウトしない限り、有効期限内はログイン状態を維持する。
- **Cookie属性**: `Max-Age` を設定し、ブラウザを閉じてもCookieが破棄されない「永続Cookie」として発行する。

### 1.2 スライディングセッション (Sliding Session)
- 認証が必要なAPIへのアクセスがあるたびに、サーバー側のセッション（DB）とクライアント側のCookieの両方の有効期限を自動的に延長する。
- **延長期間**: 現在時刻から **7日間**。
- これにより、アクティブなユーザーはログイン状態を継続できる。

### 1.3 ログアウト
- ログアウトAPI (`/api/auth/logout`) へのリクエスト成功時に、サーバー側のセッションを無効化し、クライアントのCookieを削除する。

## 2. Cookieセキュリティ設定

セッションID（トークン）を格納するCookieには、以下のセキュリティ属性を付与し、盗難や不正利用のリスクを最小限に抑える。

| 属性 | 設定値 | 説明 |
| :--- | :--- | :--- |
| **Key** | `access_token` | トークンを格納するキー名。 |
| **HttpOnly** | `True` | JavaScript (`document.cookie`) からのアクセスを禁止し、XSS攻撃によるトークン奪取を防ぐ。 |
| **Secure** | `True` | HTTPS通信時のみCookieを送信する。開発環境では環境変数により無効化可能とするが、本番環境では必須。 |
| **SameSite** | `Lax` | CSRF対策。外部サイトからのリンク遷移時(GET)には送信されるが、POST等の攻撃リクエストでは送信されない設定。 |
| **Path** | `/` | アプリケーション全体でCookieを有効にする。 |
| **Max-Age** | `604800` | 7日間 (秒数)。永続的なセッション保持のために必須。 |

## 3. 実装詳細要件

### 3.1 サーバーサイド (Backend)
- **Token生成**: ログイン時にランダムなセッショントークンを生成し、DB `user_sessions` テーブルに保存。
- **検証と更新**: `get_current_user` 依存関係において、トークンの検証成功時に以下を行う。
    1. DBの `expires_at` を現在時刻 + 7日に更新する。
    2. `Response` ヘッダーを用いて、`access_token` Cookieを新しい有効期限（Max-Age）で再発行し、ブラウザ側の期限を延長する。
- **Cookie設定の統一**: ログイン、新規登録、セッション延長のすべての箇所で同じCookie属性（HttpOnly, Secure, SameSite, Max-Age）を使用する。

### 3.2 クライアントサイド (Frontend)
- ブラウザのCookie管理に任せるため、特別な実装は不要。
- APIリクエスト時に自動的にCookieが送信される。

## 5. UI 仕様 (多言語対応: 日本語)

ログインおよび登録画面は、日本のユーザー向けに以下のラベルとメッセージを使用して日本語化する。

### 5.1 ログイン画面 (`/login`)

| 項目 | 英語 (現状) | 日本語 (規定) |
| :--- | :--- | :--- |
| タイトル | Login to Baby App | Baby App にログイン |
| 説明 | Enter your username below to login to your account | ユーザー名を入力してログインしてください |
| ユーザー名ラベル | Username | ユーザー名 |
| パスワードラベル | Password | パスワード |
| プレースホルダー (ユーザー名) | your-username | ユーザー名を入力 |
| ログインボタン | Login | ログイン |
| フッターテキスト | Don't have an account? | アカウントをお持ちでないですか？ |
| 登録リンク | Register | 新規登録 |
| エラー (必須) | Username is required | ユーザー名を入力してください |
| エラー (必須) | Password is required | パスワードを入力してください |
| エラー (失敗) | Login failed | ログインに失敗しました |

### 5.2 登録画面 (`/register`)

#### 共通・タブ
| 項目 | 英語 (現状) | 日本語 (規定) |
| :--- | :--- | :--- |
| タブ (作成) | Create Family | 家族を新規作成 |
| タブ (参加) | Join Family | 家族に参加 |
| フッターテキスト | Already have an account? | すでにアカウントをお持ちですか？ |
| ログインリンク | Login | ログイン |

#### 家族を新規作成
| 項目 | 英語 (現状) | 日本語 (規定) |
| :--- | :--- | :--- |
| タイトル | Create a New Family | 家族の新規作成 |
| 説明 | Start managing your baby's records together. | 家族で赤ちゃんの記録を共有しましょう。 |
| 家族名ラベル | Family Name | 家族名 |
| ユーザー名ラベル | Your Name | お名前 |
| パスワードラベル | Password | パスワード |
| 作成ボタン | Create Family | 家族を作成して登録 |
| エラー (家族名必須) | Family name is required | 家族名を入力してください |
| エラー (パスワード) | Password must be at least 6 characters | パスワードは6文字以上で入力してください |

#### 家族に参加
| 項目 | 英語 (現状) | 日本語 (規定) |
| :--- | :--- | :--- |
| タイトル | Join an Existing Family | 既存の家族に参加 |
| 説明 | Enter the invitation code from your family member. | 家族から共有された招待コードを入力してください。 |
| 招待コードラベル | Invitation Code | 招待コード |
| ユーザー名ラベル | Your Name | お名前 |
| パスワードラベル | Password | パスワード |
| 参加ボタン | Join Family | 家族に参加して登録 |
| エラー (招待コード必須) | Invitation code is required | 招待コードを入力してください |

## 6. エラーハンドリング
- セッション切れ、不正なトークンの場合は `401 Unauthorized` を返す。
- フロントエンドは `401` を検知した場合、ログイン画面へリダイレクトする。
