# TDD 開発ワークフロー仕様書

## 基本原則

Botoro プロジェクトでは **SDD + TDD の統合フロー** を必須とする。

```
仕様書（.specify/specs/） → テスト設計 → Red（失敗確認） → Green（最小実装） → Refactor
```

**実装を先に書いてからテストを追加することは禁止。**
テストが存在しない状態で `verify_all.sh` を通そうとすることも禁止。

---

## SDD との接続（受け入れ条件の抽出）

仕様書には機能ごとに受け入れ条件（Acceptance Criteria / AC）が記載されている。

### AC をテストケースに変換するパターン

| 仕様書の記述 | テストケースの変換例 |
|---|---|
| `認証済みユーザーのみアクセス可能` | `test_unauthenticated_returns_401` |
| `Adminのみ操作可能` | `test_member_cannot_delete_returns_403` |
| `存在しないリソースは404` | `test_not_found_returns_404` |
| `作成後にIDが返る` | `test_create_returns_id` |
| `一覧はページネーション対応` | `test_list_returns_paginated_result` |

---

## バックエンド TDD（pytest）

### テストファイルの場所

```
tests/
├── conftest.py          # フィクスチャ定義
├── test_auth.py
├── test_feedings.py
└── test_<feature>.py    # 新規機能はここに作成
```

### 既存フィクスチャ（conftest.py）

| フィクスチャ | 型 | 用途 |
|---|---|---|
| `db` | `Session` | インメモリ SQLite DB（テスト間独立） |
| `client` | `TestClient` | 未認証の HTTP クライアント |
| `auth_client` | `Callable` | 認証済みクライアント（家族登録+ログインを内包） |

```python
# auth_client の使い方
def test_example(auth_client):
    c = auth_client()   # 家族登録 + ログイン済みクライアントを返す
    res = c.get("/api/babies/")
    assert res.status_code == 200
```

### バックエンドテストテンプレート

```python
# tests/test_<feature>.py

import pytest


# --- 認証不要エンドポイント ---
class TestPublicEndpoint:
    def test_success(self, client):
        res = client.get("/api/...")
        assert res.status_code == 200

    def test_not_found(self, client):
        res = client.get("/api/.../99999")
        assert res.status_code == 404


# --- 認証必要エンドポイント ---
class TestProtectedEndpoint:
    def test_unauthenticated_returns_401(self, client):
        res = client.get("/api/protected/")
        assert res.status_code == 401

    def test_success(self, auth_client):
        c = auth_client()
        res = c.get("/api/protected/")
        assert res.status_code == 200

    def test_member_cannot_admin_action(self, auth_client, client):
        # Admin ユーザーで赤ちゃん作成
        admin = auth_client(username="admin", family_name="Family A")
        baby_res = admin.post("/api/babies/", json={"name": "Taro"})
        baby_id = baby_res.json()["id"]

        # Member ユーザーを招待（別途テスト対象に応じて変更）
        # member = auth_client(username="member", family_name="Family B")

        # 権限外の操作が 403 になること
        res = admin.delete(f"/api/babies/{baby_id}")
        # ...アサーション
```

### テスト実行コマンド

```bash
npm run test:backend          # 全テスト
pytest tests/test_feedings.py  # 特定ファイル
pytest -k "test_create"        # 特定テスト名でフィルタ
pytest -x                      # 最初の失敗で停止（Red確認時に有用）
```

---

## フロントエンド TDD（vitest）

### テストファイルの場所

```
frontend/__tests__/
├── utils.test.ts          # ユーティリティ関数
├── api-client.test.ts     # API クライアント
└── <feature>.test.ts      # 新規機能
```

### モック戦略

| 対象 | 方法 |
|---|---|
| `fetch` / openapi-fetch | `vi.fn()` でグローバルモック |
| 環境変数 | `vi.stubEnv("KEY", "value")` |
| モジュール | `vi.mock("@/lib/xxx")` + `vi.resetModules()` |

### `mockJsonResponse` パターン（openapi-fetch 対応）

openapi-fetch は `response.text()` を内部で呼ぶため、以下のファクトリが必要:

```typescript
function mockJsonResponse(body: unknown, status = 200) {
    const json = JSON.stringify(body)
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => json,
        json: async () => body,
        clone: function () { return this },
    }
}
```

### フロントエンドテストテンプレート

#### ユーティリティ関数テンプレート

```typescript
// frontend/__tests__/<feature>.test.ts
import { describe, it, expect } from "vitest"
import { myUtilFunction } from "@/lib/my-util"

describe("myUtilFunction", () => {
    it("正常系: 期待値を返す", () => {
        expect(myUtilFunction("input")).toBe("expected")
    })

    it("異常系: 空文字のとき空文字を返す", () => {
        expect(myUtilFunction("")).toBe("")
    })

    it("境界値: null のとき undefined を返す", () => {
        expect(myUtilFunction(null)).toBeUndefined()
    })
})
```

#### API クライアントテンプレート

```typescript
// frontend/__tests__/api-<feature>.test.ts
import { describe, it, expect, vi, afterEach } from "vitest"

const fetchMock = vi.fn()
global.fetch = fetchMock

const TEST_BASE = "http://localhost"

function mockJsonResponse(body: unknown, status = 200) {
    const json = JSON.stringify(body)
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "Content-Type": "application/json" }),
        text: async () => json,
        json: async () => body,
        clone: function () { return this },
    }
}

describe("<feature> API", () => {
    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
        vi.resetModules()
        fetchMock.mockReset()
    })

    it("成功時: データを返す", async () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
        vi.resetModules()
        const { client } = await import("@/lib/api-client")

        fetchMock.mockResolvedValueOnce(mockJsonResponse([{ id: 1 }]))

        const { data } = await client.GET("/api/feedings/", {
            params: { query: { baby_id: 1 } },
        })

        expect(data).toEqual([{ id: 1 }])
    })

    it("エラー時: error を返す", async () => {
        vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", TEST_BASE)
        vi.resetModules()
        const { client } = await import("@/lib/api-client")

        fetchMock.mockResolvedValueOnce(mockJsonResponse({ detail: "Not found" }, 404))

        const { error } = await client.GET("/api/feedings/", {
            params: { query: { baby_id: 99999 } },
        })

        expect(error).toBeDefined()
    })
})
```

### テスト実行コマンド

```bash
npm run test:frontend           # 全テスト（watch モード）
cd frontend && pnpm vitest run  # 1回だけ実行（CI相当）
cd frontend && pnpm vitest run --reporter=verbose  # 詳細出力
```

---

## Red → Green → Refactor サイクル

### Red フェーズ（テストを先に書く）

1. 仕様書の AC を確認し、テストケースをリストアップ
2. テストコードを書く（実装はまだしない）
3. テストを実行して **失敗することを確認**

```bash
# バックエンド（失敗が出力されることを確認）
pytest tests/test_new_feature.py -v

# フロントエンド
cd frontend && pnpm vitest run __tests__/new-feature.test.ts
```

> **重要**: Red を確認しないままGreenに進まない。テストがすでに通っている場合、テストが間違っている可能性がある。

### Green フェーズ（最小実装）

- テストを通すための **最小限のコード** だけを書く
- 過度な抽象化・将来への備えは不要
- 全テストが Green になることを確認

```bash
pytest tests/test_new_feature.py -v   # バックエンド
cd frontend && pnpm vitest run         # フロントエンド
```

### Refactor フェーズ

- コードの重複排除・命名改善・構造整理を行う
- リファクタリング中も **テストは常に Green を維持**
- リファクタリング完了後に再度テスト実行

### 全チェック

```bash
sh scripts/verify_all.sh
```

---

## アンチパターン（禁止）

| アンチパターン | 理由 |
|---|---|
| 実装完了後にテストを追加する | TDD の根本的な違反。品質保証にならない |
| テストなしで `verify_all.sh` を通す | pytest が通っても機能保証がない |
| テストを `skip` / `xfail` にして Green にする | Red を隠蔽するだけ |
| すべての分岐に対してテストを書かない | AC の「境界値・異常系」を必ず含める |
| フロントエンドで `any` を使ってテストを誤魔化す | 型安全性が失われる |
