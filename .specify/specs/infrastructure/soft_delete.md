# 論理削除 (Soft Delete) 仕様書

誤操作による取り返しのつかないデータ喪失を防止するため、データの物理削除の代わりに論理削除フラグ (`is_deleted`) を使用する仕組みを導入します。

## 概要

本機能では、データベースからレコードを物理的に削除するのではなく、削除済みであることを示すフラグを立て、アプリケーションからの通常のクエリでは除外されるようにします。これにより、必要に応じて運営側でのデータ復旧が可能になります。

## データベース設計

### 共通カラム

論理削除を適用するすべてのモデルに以下のカラムを追加します。

- **`is_deleted`**: `Boolean`, `default=False`, `nullable=False`, `index=True`
  - レコードが削除されているかどうかを示します。

### 対象モデル

以下の主要なモデルに `is_deleted` を導入します。

- **ユーザー・家族系モデル**:
  - `User` (ユーザー)
  - `Family` (家族)
  - `Baby` (赤ちゃん)
  - `Relative` (親戚)
- **育児記録系モデル**:
  - `Feeding` (授乳)
  - `Sleep` (睡眠)
  - `Diaper` (おむつ)
  - `Growth` (成長)
  - `Note` (メモ)
  - `Contraction` (陣痛)
  - `Schedule` (スケジュール)
  - `Milestone` (マイルストーン)
  - `Vaccination` (予防接種)
  - `Temperature` (体温)
- **関連モデル**:
  - `RecordComment` (記録へのコメント)
  - `DailySummary` (AIサマリー)
  - `AppNotification` (アプリ内通知)
  - `PushSubscription` (プッシュ通知購読)

## 実装方針

### 1. モデル定義 (Backend)

SQLAlchemy の Mixin クラスとして `SoftDeleteMixin` を作成し、対象のモデルに継承させます。

```python
class SoftDeleteMixin:
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
```

**複合インデックスの検討**:
育児記録などのデータ量が多いテーブルについては、クエリパフォーマンス向上のため `baby_id` と `is_deleted` の複合インデックスを検討します。

### 2. クエリの自動フィルタリング

SQLAlchemy の `with_loader_criteria` を活用し、デフォルトで `is_deleted == False` のレコードのみを取得するようにします。

**管理者用フィルタ無効化**:
データ復旧やデバッグの目的で削除済みレコードを含めて取得したい場合のために、コンテキストマネージャーやセッションオプションを通じて一時的にフィルタを無効化できる仕組みを提供します。

### 3. 削除処理の共通化 (Service Layer)

親レコード（`Baby`, `Family`）が論理削除された際、関連する子レコードも一貫して論理削除されるように、削除処理をサービス層 (`app/services/`) に集約します。

```python
# app/services/baby_service.py
def soft_delete_baby(db: Session, baby: Baby):
    # 関連する記録も一括で論理削除
    db.query(Feeding).filter(Feeding.baby_id == baby.id).update({"is_deleted": True})
    db.query(Sleep).filter(Sleep.baby_id == baby.id).update({"is_deleted": True})
    # ... 他の記録も同様 ...
    baby.is_deleted = True
    db.commit()
```

### 4. 削除処理の変更 (Router Layer)

各 API ルーターの `DELETE` エンドポイントにおいて、サービス層の関数を呼び出すように変更します。
単体の記録（例：特定の授乳記録）の削除についても、物理削除 (`db.delete(obj)`) を論理削除フラグの更新に置き換えます。


## 受け入れ基準 (AC)

1.  対象モデルに `is_deleted` カラムが存在すること。
2.  `DELETE` API を実行後、データベース上で `is_deleted` が `True` に更新されること（物理削除されないこと）。
3.  通常の `GET` API（一覧取得、詳細取得）で `is_deleted = True` のレコードが取得されないこと。
4.  親レコード（`Baby` 等）を削除した際、関連する子レコードも（必要に応じて）取得できなくなること。
5.  既存のテストがすべて通過し、論理削除を検証する新規テストが追加されていること。
