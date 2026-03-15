## 2025-05-15 - Path Traversal in Static File Serving
**Vulnerability:** The application was vulnerable to path traversal attacks via the `serve_frontend` endpoint. The `full_path` parameter was passed directly to `os.path.join`, allowing attackers to access files outside the intended directory using `..` sequences or absolute paths.
**Learning:** Relying on web server or framework defaults to sanitize paths can be risky. Always explicitly validate that the resolved path is within the intended base directory.
**Prevention:** Use `os.path.abspath` to resolve the target path and check if it starts with the canonical base path. Avoid trusting user-supplied path components blindly.

## 2026-02-14 - Exposed Default Credentials in Frontend Bundle
**Vulnerability:** Default test credentials (username and password) were exposed in the frontend bundle because they were assigned to `NEXT_PUBLIC_` environment variables. In Next.js, variables prefixed with `NEXT_PUBLIC_` are embedded in the client-side JavaScript during build time, making them visible to anyone inspecting the source code.
**Learning:** Never use `NEXT_PUBLIC_` for sensitive information, even for "test" or "default" credentials. Anything prefixed with `NEXT_PUBLIC_` is public by design.
**Prevention:** Use empty strings for default values in frontend forms. If default credentials are needed for automated testing, they should be handled by the testing framework (e.g., Playwright) or server-side scripts, never hardcoded or bundled into the client-side application.

## 2026-02-15 - Missing Input Validation in User Schemas
**Vulnerability:** User-related schemas (`UserCreate`, `FamilyCreate`, `LoginRequest`) lacked input validation for length and complexity. This could allow attackers to perform DoS attacks by sending massive payloads (e.g., extremely long passwords that take significant time to hash) or bypass expected security standards for passwords.
**Learning:** Pydantic models should always include reasonable `min_length`, `max_length`, and `pattern` constraints for user-supplied data to prevent resource exhaustion and ensure data integrity.
**Prevention:** Use Pydantic's `Field` with `min_length`, `max_length`, and `pattern` (regex) to enforce constraints. For login schemas, prioritize `max_length` for DoS protection while ensuring compatibility with existing users.

## 2026-02-16 - Weak and Inconsistent Invite Code Generation
**Vulnerability:** Family invite codes were generated with low/inconsistent entropy (32-bit `token_hex(4)` in `auth.py` vs ~48-bit `token_urlsafe(8)` in `family.py`) and lacked collision checks during regeneration. This increased the risk of brute-force attacks and code guessing.
**Learning:** Security-critical tokens should have consistent high entropy across the application. Relying on short tokens for user-friendly features can compromise security if not properly balanced with rate limiting or sufficient length.
**Prevention:** Standardized on 64-bit entropy (16-character uppercase hex strings) using `secrets.token_hex(8).upper()` and enforced uniqueness checks for all generation paths.

## 2025-02-23 - [Insecure File Upload & Error Leakage]
**Vulnerability:** File upload endpoint relied solely on content-type header and extension, allowing potential file masquerading. Additionally, internal server errors leaked stack trace/implementation details.
**Learning:** Checking `file.content_type` is insufficient as it is client-controlled. Always validate file content (magic bytes).
**Prevention:** Implement server-side content validation using magic bytes. Use generic error messages for 500 responses.

## 2026-03-01 - Timing Attack Vulnerability in Login Endpoint
**Vulnerability:** The login endpoint (`/api/auth/login`) was vulnerable to user enumeration via timing attacks. When a user was not found, the function returned immediately without verifying a password hash, whereas a valid user (with incorrect password) would undergo a time-consuming bcrypt verification. This difference in response time allowed attackers to determine if a username exists.
**Learning:** Security controls like password hashing can introduce side channels if not applied consistently. Always ensure that sensitive operations like authentication take a similar amount of time regardless of the outcome (success/failure).
**Prevention:** Implemented a dummy hash verification that runs when a user is not found, ensuring that `verify_password` is called in both scenarios to equalize execution time.

## 2026-03-02 - Enhancing Security Headers
**Vulnerability:** Missing `Permissions-Policy` allowed potential access to sensitive browser features. API endpoints lacked `Cache-Control: no-store`, risking sensitive data caching.
**Learning:** Defense in depth includes proactively disabling unused browser features and strictly controlling caching for authenticated APIs.
**Prevention:** Added `Permissions-Policy` to disable camera/mic/geo by default. Added `Cache-Control: no-store` middleware for `/api/` routes.

## 2026-03-03 - Case-Sensitive Username Impersonation
**Vulnerability:** Usernames were treated case-sensitively by the database (PostgreSQL), allowing attackers to register confusingly similar accounts (e.g., 'admin' vs 'Admin') and potentially impersonate users or bypass checks.
**Learning:** Default database collation often treats strings as case-sensitive. Application logic must explicitly normalize identifiers (like usernames) to prevent homograph/case-based confusion attacks.
**Prevention:** Enforce lowercase normalization on both storage and lookup for usernames. Use `func.lower(Column) == value.lower()` for case-insensitive comparisons in SQLAlchemy queries.

## 2026-03-03 - User Registration Race Condition (TOCTOU)
**Vulnerability:** A Time-of-Check to Time-of-Use (TOCTOU) race condition existed in user registration. Concurrent requests with the same username (case-insensitive) could bypass the initial existence check and trigger an unhandled `IntegrityError` during insertion, causing a 500 Internal Server Error.
**Learning:** Checking for existence before insertion is insufficient for uniqueness guarantees in concurrent environments. Database constraints are the final source of truth.
**Prevention:** Always wrap database insertion logic in `try...except IntegrityError` blocks when unique constraints are involved. Convert database errors into user-friendly HTTP 400 responses.

## 2026-03-04 - Missing Input Length Validation
**Vulnerability:** Several Pydantic schemas (`FeedingCreate`, `SleepCreate`, etc.) lacked `max_length` constraints on free-text fields like `notes`. This could allow attackers to send excessively long strings, potentially causing Denial of Service (DoS) or storage exhaustion.
**Learning:** Pydantic's default `str` type does not enforce length limits. Explicit validation is necessary for all user-supplied text to prevent abuse.
**Prevention:** Added `Field(..., max_length=2000)` to all free-text fields in schemas. Always define reasonable upper bounds for string inputs.

## 2026-03-05 - Insecure File Upload (MIME Type Spoofing)
**Vulnerability:** The file upload endpoint trusted user-provided Content-Type headers and file extensions. Attackers could upload malicious scripts (e.g., PHP, HTML) with image extensions or MIME types, leading to Stored XSS or RCE.
**Learning:** Never trust client-side input for file types. "Magic bytes" (file signatures) are the only reliable way to determine file content on the server.
**Prevention:** Implemented strict server-side validation using magic bytes to detect the true MIME type and enforce the correct file extension and Content-Type when saving to storage.

## 2026-02-23 - 自由記述フィールドにおける入力長制限の欠如
**脆弱性:** `Baby` スキーマ（名前、特徴）および `Comment` スキーマ（本文）において、Pydanticの入力長制限（`max_length`）が設定されておらず、DoS攻撃（巨大なペイロードによるメモリ/ストレージ枯渇）のリスクがあった。
**学び:** Pydanticの `str` 型はデフォルトで長さ制限を持たないため、データベースのカラム型（例: `String`）がPostgreSQLのTEXTとして扱われる場合、事実上無制限にデータを受け入れてしまう。
**予防:** 文字列フィールドには常に `pydantic.Field(..., max_length=N)` を使用して明示的な上限を設定する。また、`openapi.json` に `maxLength` が反映されることを確認し、フロントエンドとバックエンドの両方で契約を守らせる。

## 2026-02-23 - BabyUpdateにおけるNull許容とIntegrityError
**脆弱性:** `BabyUpdate` スキーマで `name` が `Optional[str]`（デフォルト `None`）となっていたため、明示的に `{"name": null}` を送信すると、DBの `NOT NULL` 制約により `IntegrityError` (500 Internal Server Error) が発生していた。
**学び:** Pydanticの `Optional` フィールドは `None` を値として受け入れる。更新用スキーマで「省略可能だがNull不可」を実現するには、型定義だけでは不十分であり、`field_validator` で明示的に `None` を拒否する必要がある。
**予防:** 更新用スキーマで非Nullカラムに対応するフィールドには、`@field_validator('field_name')` を使用して `v is None` のチェックを追加する。

## 2024-05-24 - Rate Limiter DoS Fix
**脆弱性:** RateLimiter の `check` メソッドで `max_size` を超えた際に全履歴を `clear()` してしまう実装があり、攻撃者が意図的にリミッターをリセットさせることで DoS 攻撃やブルートフォース攻撃を容易にする可能性があった。
**学び:** インメモリキャッシュやリミッターを実装する際、容量制限（`max_size`）に達したときの挙動（Eviction Policy）は慎重に設計する必要がある。全削除は攻撃ベクトルになり得る。
**予防:** `requests.clear()` の代わりに、FIFO や LRU などの適切な追い出し戦略を採用する。Python 3.7+ の辞書は挿入順を保持するため、`next(iter(dict))` で最古の要素を O(1) で取得・削除できる。

## 2026-05-15 - コメント投稿におけるレート制限の欠如
**脆弱性:** コメント作成エンドポイント (`POST /api/records/.../comments`) にレート制限がなく、認証済みユーザーによるコメントスパム（DoS攻撃や通知スパム）が可能だった。
**学び:** 認証済みエンドポイントであっても悪用のリスクはある。通知やデータベース書き込みを伴う機能には、IPアドレスだけでなくユーザーIDをキーとしたレート制限が必須である。
**予防:** コメント作成エンドポイントにユーザーID (`user_{id}`) をキーとする `RateLimiter` を導入した。ユーザー生成コンテンツのエンドポイントすべてに適切なレート制限を設けること。

## 2026-05-20 - Admin Search Wildcard Injection & DoS Protection
**脆弱性:** 管理画面のユーザー検索機能 (`search` パラメータ) において、SQLワイルドカード文字 (`%`, `_`) がエスケープされておらず、意図しない全件検索やReDoSのような高負荷なクエリ実行が可能だった。また、検索文字列の長さに制限がなく、DoSのリスクがあった。
**学び:** ORMの `ilike` や `like` メソッドは、入力文字列をそのままパターンとして扱うため、ユーザー入力を直接渡すと意図しないマッチングが発生する。特に検索機能では、ユーザーは「部分一致」を期待しており「ワイルドカード指定」を期待していないことが多い。
**予防:** ユーザー入力を用いて `like` 検索を行う場合は、必ずワイルドカード文字をエスケープする。また、FastAPIの `Query(..., max_length=N)` を使用して、入力長を厳密に制限する。SQLAlchemyの `ilike` では `escape` 引数を明示的に指定する。

## 2026-05-21 - マイルストーン・予防接種スキーマにおける入力長制限の欠如 (DoSリスク)
**脆弱性:** `Milestone` および `Vaccination` 記録作成/更新のスキーマ（`MilestoneBase`, `VaccinationBase` など）において、Pydanticの入力長制限（`max_length`）がテキストフィールド（`notes`, `title`, `vaccine_name`, `lot_number`, `hospital_name`など）に設定されていなかった。これにより、巨大な文字列データを送信することでメモリ枯渇やデータベースストレージ圧迫を引き起こすDoS攻撃が可能だった。
**学び:** `Baby` や `Comment` などの他のスキーマでの過去の修正と同様に、Pydanticのデフォルトの `str` は上限を持たないため、新しいモデルやスキーマを追加する際に入力長制限が忘れられがちである。
**予防:** 文字列入力を受け付けるPydanticのスキーマフィールドには例外なく `Field(..., max_length=N)` を設定する。特に自由記述フィールド (`notes`等) には全機能共通の上限（例: `NOTE_MAX_LENGTH`）をインポートして適用する。

## 2026-05-22 - Admin Endpoint Pagination Missing Limits (DoS Risk)
**脆弱性:** 管理画面向けのエンドポイント (`get_admin_families`, `get_admin_users`, `get_audit_logs`) において、ページネーションパラメータ (`skip`, `limit`) にPydanticの入力値検証 (`Query` による `ge`, `le` 制限) が設定されておらず、単なるデフォルト値の設定に留まっていた。これにより、攻撃者が非現実的に巨大な `limit` (例: 10000000) や負の値を指定することで、データベースに多大な負荷をかけたり意図しない動作を引き起こすDoSのリスクがあった。
**学び:** パラメータの型ヒント (`int = MAX_PAGINATION_LIMIT`) はデフォルト値を提供するだけで、受け入れる最大値や最小値の制限（バリデーション）は行わない。FastAPIでは明示的に `Query(..., ge=1, le=100)` などの指定を行わない限り、クライアントは任意の数値を送信できてしまう。
**予防:** リストや一覧を返すAPIエンドポイントで `skip` や `limit` を実装する際は、常に `skip: int = Query(0, ge=0)` や `limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT)` を用いて、許容範囲の制限を明示的に強制する。

## 2026-06-01 - パスワードリセットエンドポイントにおけるレート制限の欠如
**脆弱性:** `/api/family/members/{user_id}/reset-password` エンドポイントにおいて、パスワードリセット要求に対するレート制限（Rate Limiting）が設定されていなかった。これにより、悪意のあるユーザーがスクリプトを用いて短時間で大量のリセット要求を送信し、ターゲットユーザーのパスワードを連続で書き換えてログイン不能にする嫌がらせ（アカウントロックアウトの誘発）や、システムリソースを枯渇させるDoS攻撃が可能であった。
**学び:** 認証不要なエンドポイント（ログインや登録）だけでなく、認証済みであっても「状態を破壊的に変更する」または「リソースを大量に消費する」操作（例：他メンバーのパスワードリセットなど）には、悪用を防ぐための厳密なレート制限が不可欠である。特に、他者のアカウントに影響を与える機能は、攻撃の標的になりやすい。
**予防:** パスワードリセット、メール送信、SMS認証などの機密性の高いアクションを実行するエンドポイントには、常にIPアドレスやユーザーIDベースのレートリミッター（`RateLimiter`）を適用し、短時間での連続実行をブロックする。

## 2026-06-02 - AIエンドポイントにおけるレート制限の欠如
**脆弱性:** `/api/babies/{baby_id}/daily-summary` および `/api/babies/{baby_id}/record-feedback` エンドポイントにおいて、レート制限（Rate Limiting）が設定されていなかった。これにより、認証済みユーザーがAI生成リクエストを大量に送信し、高額なOpenAI APIの課金コストを発生させたり、システムリソースを枯渇させる（DoS攻撃）リスクが存在した。
**学び:** 外部有料API（OpenAIなど）を呼び出したり、システムリソースを大量に消費したりするエンドポイントには、認証済みであっても厳密なレート制限が必須である。特にAI関連の機能は実行コストと待機時間が大きいため、攻撃者の標的になりやすい。
**予防:** OpenAIなどの外部AIサービスを呼び出すすべての生成エンドポイントに対して、ユーザーIDベースのレート制限（`RateLimiter`）を適用し、短期間の連続リクエストをブロックする。

## 2026-06-03 - テスト通知エンドポイントにおけるレート制限の欠如 (DoSリスクおよび外部API悪用)
**脆弱性:** `/api/notifications/test` エンドポイントにおいて、レート制限（Rate Limiting）が設定されていなかった。これにより、認証済みユーザーがテスト通知リクエストを大量に送信し、対象ユーザーの端末に大量のプッシュ通知を送信する嫌がらせ（通知スパム/DoS）や、外部のWeb Push APIサービスに対して短期間に大量のリクエストを発生させ、アプリケーションのPush認証情報がブロックされたりレート制限を受けたりするリスクが存在した。
**学び:** 外部API（Push通知サービス、メール送信サービスなど）を呼び出したり、ユーザーのデバイスに直接影響を与えたりする機能には、たとえ「テスト」目的のエンドポイントであっても、悪用を防ぐための厳密なレート制限が必須である。
**予防:** テスト通知エンドポイントに対して、専用のレートリミッター（`test_notification_limiter`）を適用し、短期間の連続実行をブロックする。

## 2026-06-04 - パスワード変更およびページネーションエンドポイントにおけるDoS/ブルートフォース保護の強化
**脆弱性:**
1. `app/routers/auth.py` のパスワード変更エンドポイント（`/change-password`）にレート制限がなく、認証済みユーザーによるパスワード変更リクエストの連続送信によるブルートフォースやシステムリソース枯渇のリスクがありました。
2. `app/routers/diaper.py` の `get_diapers` エンドポイントにおいて、ページネーションパラメータ (`skip`, `limit`) に Pydantic による上限・下限の検証（`Query(..., ge=..., le=...)`）が設定されておらず、非現実的な巨大な値を指定してデータベースに多大な負荷をかける DoS のリスクがありました（以前修正された Admin Endpoint と同様の課題です）。
**学び:** 既存のエンドポイントに新しいパラメータを追加する際や、認証済みエンドポイントであっても、状態を変更する・負荷がかかる処理には、必ず厳格なバリデーションとレート制限を設計段階で組み込む必要があります。特に `limit` のようなパラメータは、フレームワークの型ヒントだけでは実質的な上限の保護になりません。
**予防:**
1. `/change-password` にはユーザーのアクションに対して適用される `change_password_limiter` を導入しました。パスワード関連のアクション（リセット等）には必ず RateLimiter を適用します。
2. リストを返すAPIエンドポイントで `skip` や `limit` を引数に取る際は、常に `skip: int = Query(0, ge=0)` や `limit: int = Query(MAX_PAGINATION_LIMIT, ge=1, le=MAX_PAGINATION_LIMIT)` のように FastAPI の `Query` を使用し、許容範囲の制限を明示的に強制します。

## 2026-06-05 - 予防接種一括生成エンドポイントにおけるレート制限の欠如
**脆弱性:** `/api/vaccinations/generate` エンドポイントにおいて、レート制限（Rate Limiting）が設定されていなかった。これにより、認証済みユーザーが予防接種スケジュールの一括生成リクエストを短期間に大量に送信し、データベースに多数のレコード書き込みを発生させることで、システムリソースを枯渇させる（DoS攻撃）リスクが存在した。
**学び:** 複数のレコードを一度に作成・更新するような「一括処理（Bulk Operation）」や「生成処理」を伴うエンドポイントは、1回のリクエストでバックエンドに与える負荷が大きいため、認証済みであっても厳密なレート制限が必須である。
**予防:** 予防接種のスケジュール生成などの負荷の高いエンドポイントに対して、ユーザーIDベースのレート制限（`RateLimiter`）を適用し、短期間の連続リクエストをブロックする。

## 2026-06-06 - Incorrect Rate Limiter Reuse on Invite Regeneration (DoS/Abuse Risk)
**脆弱性:** 家族招待コードの再生成エンドポイント (`/invite_code/regenerate`) において、意図せずパスワードリセット用のレートリミッター (`reset_password_limiter`) が再利用されていた。これにより、招待コードの再生成を連続で行うと、パスワードリセットのレート制限枠を消費してしまい、必要なパスワードリセットができなくなる、またはその逆の妨害（サービス拒否）が発生する可能性があった。
**学び:** 異なる目的のエンドポイントで同じレートリミッターインスタンスを共有すると、一方の機能へのアクセスが他方の機能の制限枠を消費する「共有状態の競合（Shared State Contention）」を引き起こし、意図しないサービス拒否（DoS）状態を生む。
**予防:** 各エンドポイントの機能（パスワードリセット、招待コード生成など）ごとに独立した定数と `RateLimiter` インスタンスを定義し、適切に分離する。

## 2024-05-24 - ワクチン登録APIにおけるDoS脆弱性の修正
**脆弱性:** /api/vaccinations/ へのPOSTリクエストにレート制限が設定されておらず、単一のユーザーが短時間に大量のワクチン記録を作成し、データベースやサーバーリソースを枯渇させる (DoS) リスクがありました。generateには設定されていましたが、個別のcreateには漏れていました。
**学び:** 機能ごとに似たようなエンドポイント（generateとcreateなど）がある場合、片方だけレート制限をかけて安心してしまうケースがあります（セキュリティ対策の漏れ）。
**予防:** 新しいエンドポイント、特にデータベースへの書き込みやリソースを消費する操作 (POST/PUT/PATCH/DELETE) を追加する際は、必ず対応するRateLimiterの要否を検討し、セットで実装するようにします。
## 2024-03-15 - [CRITICAL] パストラバーサルの脆弱性修正
**脆弱性:** フロントエンドの静的ファイル配信 (`app/main.py`) において、`requested_path.startswith(base_path)` でパス検証を行っていたため、`/app/frontend/out` に対して `/app/frontend/out_secret` のような部分一致するディレクトリへのアクセスが可能だった。
**学び:** `startswith()` は文字列のプレフィックス一致をチェックするだけであり、ディレクトリスラッシュ (`/`) を考慮しない。そのため、ベースパスと同じプレフィックスを持つ別のディレクトリへパストラバーサルが可能になる。
**予防:** パスの包含関係を検証する場合は、常に `os.path.commonpath([base_path, target_path]) == base_path` を使用するか、末尾に必ずスラッシュを付与してから比較する。
