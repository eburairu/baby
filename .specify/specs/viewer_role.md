# VIEWERロールの追加 仕様書 (Viewer Role Specification)

## 概要
家族に新しく参加したユーザーに、デフォルトで「閲覧のみ」の権限（VIEWERロール）を付与する。
また、既存のロール（ADMIN, MEMBER）に加えて、書き込み権限を持たない VIEWER ロールを正式に導入する。

---

## 背景・目的
- 家族以外の親戚やサポーターを招待する際、誤ってデータを変更されるのを防ぐため、初期状態を閲覧のみに制限したい。
- 閲覧のみの権限を明確に定義し、セキュリティとデータ整合性を向上させる。

---

## ロール定義と権限マトリクス

| ロール | 記録の閲覧 | 記録の作成・編集・削除 | ファミリー管理 | 権限設定 (ADMIN権限) |
| :--- | :---: | :---: | :---: | :---: |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ |
| **MEMBER** | ✅ | ✅ | ❌ | ❌ |
| **VIEWER** | ✅ | ❌ | ❌ | ❌ |

※ 「記録」には授乳、睡眠、おむつ、成長、陣痛、スケジュール、AIサマリーが含まれる。
※ 閲覧可否自体は、既存の `BabyPermission` の設定に従う（VIEWERであっても、ADMINから特定の赤ちゃんの閲覧を制限される場合がある）。

---

## 変更内容

### 1. バックエンド

#### ロール定数の導入 (任意だが推奨)
ロール名を文字列で直接扱っている箇所を整理する。

#### デフォルトロールの変更
- `app/routers/auth.py` の `join_family` エンドポイントにおいて、新規ユーザーの初期ロールを `"member"` から `"viewer"` に変更する。

#### 書き込み制限の導入
- `app/dependencies.py` に、ユーザーのロールを確認し、`viewer` の場合に `403 Forbidden` を返すロジックを追加する。
- 以下のすべての「作成・更新・削除」エンドポイントにこのチェックを適用する。
    - `/api/babies/` (POST, PATCH, DELETE, POST records)
    - `/api/feedings/` (POST, DELETE)
    - `/api/sleeps/` (POST, PATCH, DELETE)
    - `/api/diapers/` (POST, PUT, DELETE)
    - `/api/growth/` (POST, PUT, DELETE)
    - `/api/contractions/` (POST, DELETE)
    - `/api/schedules/` (POST, DELETE)
    - `/api/ai_summary/` (POST, PATCH, DELETE)

#### ファミリー管理 API の更新
- `app/routers/family.py` の `update_member_role` において、`viewer` への変更を許可するようにバリデーションを修正する。

### 2. フロントエンド

#### UIでの表示制御
- ログイン中のユーザーのロールが `viewer` の場合、以下の操作を非表示または無効化する。
    - 各記録画面の「記録する」ボタン（Floating Action Button など）
    - 記録一覧の編集・削除メニュー/ボタン
    - 赤ちゃん設定の追加・編集・削除ボタン
    - ファミリー設定の名前変更・招待コード再生成・メンバー削除ボタン

#### ファミリー設定画面
- メンバー一覧で `viewer` ロールを表示し、ADMINが他のロールに変更できるようにする。

---

## 実装計画

### Phase 1: バックエンドの修正

1.  **ロールのデフォルト変更**:
    - `app/routers/auth.py` の `join_family` を修正。
2.  **バリデーションの更新**:
    - `app/routers/family.py` の `update_member_role` を修正。
3.  **権限チェックの強化**:
    - `app/dependencies.py` に `verify_write_access` (仮) を追加。
    - または `verify_baby_access` 内で書き込み権限（role != viewer）のチェックを行えるようにオプションを追加する。
4.  **各ルーターへの適用**:
    - 全記録系ルーターのミューテーション操作にチェックを追加。

### Phase 2: フロントエンドの修正

1.  **ロール情報の取得・保持**:
    - `useFamilyMembers` などの既存フックで自身のロールを判定できるようにする。
2.  **ボタン等の表示制御**:
    - `FloatingActionButton` や各種 `ActionMenu` にロールベースの表示条件を追加。
3.  **設定画面の更新**:
    - メンバーロールの選択肢に `閲覧者 (viewer)` を追加。

---

## 動作確認タスク (Verification Tasks)

### 自動テスト (Backend)
- [ ] `viewer` ロールで `join_family` されることを確認するテスト。
- [ ] `viewer` ロールが `GET` エンドポイント（閲覧）にアクセスできることを確認。
- [ ] `viewer` ロールが `POST/PATCH/PUT/DELETE` エンドポイントにアクセスした際、`403 Forbidden` が返ることを確認。
- [ ] `admin` が `viewer` を `member` に、または `member` を `viewer` に変更できることを確認。

### 手動テスト (E2E)
- [ ] 招待コードで新規登録し、初期状態で「記録」ボタンが表示されないことを確認。
- [ ] 管理者画面からロールを「メンバー」に変更後、ボタンが表示され記録できるようになることを確認。
- [ ] 再度「閲覧者」に戻し、権限が剥奪されることを確認。

---

## 影響範囲
- 既存の `"member"` ユーザーには影響しない（既存ユーザーのロールは維持される）。
- 新規参加ユーザーのみ、初期状態が制限される。
