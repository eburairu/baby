## 2025-04-15 - [CRITICAL] Fix authorization bypass in comments routing
**脆弱性:** `FamilyUser.role` を確認する際に `user_id` だけでフィルタリングしていたため、複数家族に所属するユーザーが別の家族の権限を流用できる状態になっていた。
**学び:** 権限チェックは常に `user_id` と `family_id` の両方のコンテキストを組み合わせて検証する必要がある。また、SQLAlchemy の `filter` 内での条件式 `A == B if C else None` は演算子優先順位のバグ（`(A == B) if C else None`）を引き起こすため危険。
**予防:** `family_id` に基づく認可を徹底する。また、SQLAlchemy に渡す変数はクエリ前に事前計算して格納するか、括弧で明示的に優先順位をつける。
