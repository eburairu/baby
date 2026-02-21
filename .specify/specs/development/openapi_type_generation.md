# OpenAPI 型自動生成仕様書

## 目的

バックエンド（FastAPI/Pydantic）とフロントエンド（TypeScript）で型定義を二重管理している現状を解消する。
FastAPI が自動生成する OpenAPI スキーマを `openapi-typescript` で TypeScript 型に変換することで、型の信頼性を高め、バックエンド変更時のフロントエンド更新漏れを防止する。

### 解消する問題

- `frontend/types/` 配下の7ファイルと `frontend/lib/types.ts` は、`app/schemas/` の Pydantic スキーマを手動で写し替えたもの
- バックエンドのスキーマ変更時にフロントエンドの型を手動で追従する必要がある
- 型の乖離に気づかずバグが混入するリスクがある

---

## アーキテクチャ決定

### スキーマ取得方式: 静的ファイルコミット方式

**採用方式**: `frontend/openapi.json` としてリポジトリにコミットする

**採用理由**:

- CI/CD がシンプルになる（ビルド時にサーバー起動が不要）
- `git diff` でスキーマ変更が可視化され、バックエンド変更のレビューが容易になる
- 開発者が意図的に `openapi.json` を更新することで、型変更が明示的なコミットとして残る

**不採用方式**: ビルド時に `http://localhost:8000/openapi.json` を取得する方式

- 理由: ビルド時にサーバー起動が必要で CI/CD が複雑になる

---

## 採用パッケージ

- **パッケージ**: `openapi-typescript` v7.x
- **特徴**: ランタイムゼロ。型定義ファイル（`.d.ts`）のみを生成し、バンドルサイズに影響しない
- **公式**: <https://openapi-ts.dev/>

- **パッケージ**: `openapi-fetch`
- **特徴**: TypeScript の型定義を直接利用する超軽量フェッチクライアント
- **公式**: <https://openapi-ts.dev/openapi-fetch/>

---

## ファイル構成（移行後）

```
baby-app/
├── scripts/
│   └── export_openapi.py          # OpenAPI スキーマ出力スクリプト
├── frontend/
│   ├── openapi.json               # FastAPI OpenAPI スキーマ（自動生成・コミット対象）
│   ├── types/
│   │   ├── generated/
│   │   │   └── api.d.ts           # openapi-typescript が生成する型定義
│   │   ├── feeding.ts             # フロントエンド固有の手動型（徐々に削減）
│   │   ├── sleep.ts
│   │   └── ...
│   ├── lib/
│   │   ├── api-client.ts          # openapi-fetch インスタンス（新規追加）
│   │   ├── api.ts                 # 既存の API ユーティリティ（段階的に移行）
│   └── package.json               # types:generate スクリプトを追加
└── package.json                   # schema:generate / types:generate を追加
```

---

## 更新フロー

バックエンドのスキーマ（`app/schemas/`）を変更した際の手順：

```bash
# 1. OpenAPI スキーマを再生成（サーバー起動不要）
python scripts/export_openapi.py
# → frontend/openapi.json が更新される

# 2. TypeScript 型を再生成
cd frontend && npm run types:generate
# → frontend/types/generated/api.d.ts が更新される

# 3. 差分を確認してコミット
git diff frontend/openapi.json
git add frontend/openapi.json frontend/types/generated/api.d.ts
git commit -m "chore: update openapi schema and generated types"
```

---

## スキーマ生成方法

### `scripts/export_openapi.py`

FastAPI の `app.openapi()` を利用してスキーマを生成する。サーバー起動不要。

```python
#!/usr/bin/env python3
"""FastAPI の OpenAPI スキーマを frontend/openapi.json に出力するスクリプト。"""
import json
from pathlib import Path

# プロジェクトルートから実行することを前提とする
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

output_path = Path(__file__).parent.parent / "frontend" / "openapi.json"
schema = app.openapi()

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(schema, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"OpenAPI schema exported to {output_path}")
```

実行方法:

```bash
# プロジェクトルートで実行
python scripts/export_openapi.py
```

---

## 型定義の使用方針

### インポート形式

`frontend/types/generated/api.d.ts` から以下の形式でインポートする：

```typescript
import type { components } from "@/types/generated/api";

type BabyResponse = components["schemas"]["BabyResponse"];
type FeedingResponse = components["schemas"]["FeedingResponse"];
type SleepResponse = components["schemas"]["SleepResponse"];
```

### エイリアス定義（推奨）

各型ファイルまたは使用箇所で読みやすいエイリアスを定義する：

```typescript
import type { components } from "@/types/generated/api";

export type Baby = components["schemas"]["BabyResponse"];
export type Feeding = components["schemas"]["FeedingResponse"];
```

---

## 手動型として残留を許可するケース

以下はバックエンドAPIレスポンスに存在しないフロントエンド固有の計算型であるため、手動で定義し続ける：

| 型名 | ファイル | 理由 |
|---|---|---|
| `FeedingSummary` | `types/feeding.ts` | フロントエンドで集計・計算した結果の型 |
| `TimerStatus` | `types/feeding.ts` | タイマー状態管理（UI 状態） |
| `ContractionStatsData` | `types/contraction.ts` | フロントエンドで集計した統計情報 |
| `DailySummary` | `types/dailySummary.ts` | ダッシュボード表示用の集計型 |

---

## 段階的移行フェーズ

### Phase 1: ツール導入

1. `scripts/export_openapi.py` 作成
2. `frontend/package.json` に `openapi-typescript` と `openapi-fetch` を追加
   ```bash
   cd frontend
   pnpm add openapi-fetch
   pnpm add -D openapi-typescript
   ```
3. `frontend/package.json` に `types:generate` スクリプト追加
4. ルート `package.json` に以下のスクリプト追加
   - `schema:generate`: `export_openapi.py` を実行
   - `types:generate`: schema:generate → frontend の types:generate を順次実行
5. `frontend/openapi.json` と `frontend/types/generated/api.d.ts` を初回生成してコミット

### Phase 2: 型の段階的置き換え（優先順）

影響範囲が小さいものから移行する：

1. **`frontend/types/sleep.ts`, `baby.ts`** → 丸ごと生成型へ移行（手動型なし）
2. **`frontend/types/feeding.ts`, `diaper.ts`, `growth.ts`** → API 型のみ生成型へ、計算型は残留
3. **`frontend/types/contraction.ts`, `dailySummary.ts`** → 同様に移行
4. **`frontend/lib/types.ts` の `User`** → `components["schemas"]["UserResponse"]` に移行

### Phase 4: 型安全な API クライアントの導入

`openapi-fetch` を導入し、パス文字列のハードコードを排除する。

#### ⚠️ URL 構築の注意点

`openapi-fetch` は URL を **`${baseUrl}${pathname}` で単純文字列結合** する。
FastAPI のルーターは `/api` プレフィックス付き（例: `prefix="/api/feedings"`）のため、
OpenAPI スキーマのパスは `/api/feedings/` のように `/api/` で始まる。

したがって **`baseUrl` に `/api` を含めてはいけない**。含めると二重パス（`/api/api/feedings/`）になってリクエストが失敗する。

| 設定 | baseUrl | pathname | 結果 |
|---|---|---|---|
| 誤り | `"/api"` | `"/api/feedings/"` | `"/api/api/feedings/"` ❌ |
| 正しい | `""` | `"/api/feedings/"` | `"/api/feedings/"` ✅ |
| 本番（正しい） | `"https://example.com"` | `"/api/feedings/"` | `"https://example.com/api/feedings/"` ✅ |

1. **`frontend/lib/api-client.ts` の作成**:
   ```typescript
   import createClient from "openapi-fetch";
   import type { paths } from "@/types/generated/api";

   // ⚠️ "/api" を付加しない。OpenAPI スキーマのパスが既に /api/ で始まるため。
   const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

   export const client = createClient<paths>({
     baseUrl: API_BASE,
     credentials: "include", // 認証クッキーを送信
   });

   /**
    * SWR 等で使用するための、エラー時に throw する標準 fetcher
    */
   export async function throwOnError<T>(promise: Promise<{ data?: T; error?: unknown }>) {
     const { data, error } = await promise;
     if (error) {
       throw error;
     }
     return data as T;
   }
   ```

2. **`useSWR` との統合例**:
   ```typescript
   import { client, throwOnError } from "@/lib/api-client";
   import useSWR from "swr";

   export function useFeeding(babyId: number | null) {
     const { data, error, mutate } = useSWR(
       babyId ? ["/api/feedings/", babyId] : null,
       ([_, id]) => throwOnError(client.GET("/api/feedings/", {
         params: { query: { baby_id: id } },
       }))
     );
     // ...
   }
   ```

   > パス文字列は OpenAPI スキーマのパスをそのまま使う（`/api/feedings/`）。
   > 型チェックにより、スキーマに存在しないパスはコンパイルエラーになる。

3. **段階的移行**:
   既存の `frontend/lib/api.ts` を使用している箇所を、順次 `openapi-fetch` に置き換えていく。

---

## 関連ファイル

- `app/schemas/` — Pydantic スキーマ（型生成の元となるソース）
- `frontend/types/generated/api.d.ts` — 生成された TypeScript 型定義（編集不可）
- `frontend/openapi.json` — FastAPI が出力した OpenAPI スキーマ（編集不可）
- `scripts/export_openapi.py` — スキーマ出力スクリプト
