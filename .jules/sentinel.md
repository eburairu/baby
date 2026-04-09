## 2025-03-31 - Enforce SuperAdmin access via Dependency Injection in ai_settings
**脆弱性:** `ai_settings`ルーターのエンドポイントで、認証は `Depends(get_current_user)` で行いつつ、実際の認可（SuperAdmin判定）を各関数の内部で `verify_admin_access()` を手動で呼び出して行っていました。
**学び:** 開発者が新しいエンドポイントを追加する際に、手動での `verify_admin_access()` 呼び出しを忘れると、一般ユーザーでも管理機能にアクセスできてしまう認可バイパスの脆弱性が容易に発生し得る構造になっていました。
**予防:** 認可チェックは必ずFastAPIの依存関係インジェクション（`Depends(get_current_superadmin)`）を利用してルート定義レベルで行うことで、フェイルセキュアな設計（明示的に許可されない限り拒否される）を徹底します。
