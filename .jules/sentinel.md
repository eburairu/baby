## 2024-05-20 - Fix Authorization Bypass (IDOR) in Comments Endpoints
**脆弱性:** コメントの作成および削除エンドポイント（`app/routers/comments.py`）において、ユーザーの権限（`UserRole.ADMIN`）を確認する際、`db.query(FamilyUser).filter(FamilyUser.user_id == current_user.id).first()` のように、`user_id` のみで検索していました。
**学び:** ユーザーが複数のファミリーに所属可能なシステム設計において、コンテキスト（操作対象のレコードが属する `family_id`）を特定せずに `user_id` のみで権限レコードを引くと、偶然別のファミリーで保持している管理者権限が評価されてしまい、権限のないデータへの操作を許してしまう（認可バイパス/IDOR）という罠が存在しました。
**予防:** 権限や所属を確認するクエリを発行する際は、必ず `user_id` だけでなく、その操作が実行されるコンテキストである対象リソースのID（この場合は `baby.family_id`）もクエリフィルタに含めるようにします。また、SQLAlchemyの `.filter()` に動的な条件を渡す際、条件結果が `None` になると `ArgumentError` になるため、クエリオブジェクトに対して `if` 文を用いて条件的にフィルタを追加するパターンを使用します。
