# Alembic スキーマドリフト検知機能

## 概要

Alembic のマイグレーションにおいて、複数ブランチの並行開発により `merge_heads` が多発し、実際のDBスキーマと SQLAlchemy のモデル定義との間に乖離（ドリフト）が起きるリスクがある。
これを防ぐため、ローカルおよび CI で自動的に複数 heads の検知とスキーマドリフトの検知を行うステップを追加する。

## 要件

### 1. 複数 Heads の検知
- `alembic heads` コマンドを使用し、複数の Head が存在しないか検証する。
- 複数 Head（分岐）がある場合はエラーとして処理を停止する。

### 2. スキーマドリフトの検知
- `alembic check` コマンドを使用し、DB の実スキーマと SQLAlchemy モデル間の差分を検知する。
- 差分がある（未適用のマイグレーションやモデルの変更）場合はエラーとして処理を停止する。

### 3. CI および ローカルスクリプトへの統合
- `scripts/verify_all.sh` のバックエンドテスト（あるいは事前チェック）のステップとして、上記2つのチェックを追加する。
- また、テスト群（pytest）にも `tests/test_alembic_schema.py` 等を追加し、自動テストの枠組み内でも検証可能にする。

## 受入条件 (AC)
- [ ] `tests/test_alembic_schema.py` が実装されており、`alembic check` および `alembic heads` を Python から呼び出すかサブプロセスで実行し、正常動作（ドリフトなし・シングルヘッド）を確認するテストが含まれていること。
- [ ] `scripts/verify_all.sh` 内で `alembic heads` と `alembic check` を実行するステップが存在すること。
- [ ] `verify_all.sh` がエラーなく通ること。
