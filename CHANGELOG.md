# [1.23.0](https://github.com/eburairu/baby/compare/v1.22.3...v1.23.0) (2026-02-18)


### Features

* add baby switcher dropdown to global header ([aec056a](https://github.com/eburairu/baby/commit/aec056ae0e6c321e6e18d2035488069d07adccab))
* add infinite scroll to RecentActivityFeed on dashboard ([36ccf4a](https://github.com/eburairu/baby/commit/36ccf4ae9835dc6759c124fc5fa8fae7bd49e311))
* integrate Sentry error monitoring for Next.js frontend ([be2f43a](https://github.com/eburairu/baby/commit/be2f43acecafb6f5233d505338e8454c07747dc0))

## [1.22.3](https://github.com/eburairu/baby/compare/v1.22.2...v1.22.3) (2026-02-18)


### Bug Fixes

* auto-create notification settings for users without settings ([a66aae1](https://github.com/eburairu/baby/commit/a66aae1c99c030a0065aba6a5882719a0c2b580c))

## [1.22.2](https://github.com/eburairu/baby/compare/v1.22.1...v1.22.2) (2026-02-18)


### Bug Fixes

* improve push notification reliability with better error logging and auto-cleanup ([934754e](https://github.com/eburairu/baby/commit/934754ebe82968150e048646a96e44eb97c0c20b))
* remove duplicate HEAD route to fix non-deterministic openapi.json ([8014fd7](https://github.com/eburairu/baby/commit/8014fd75e751bfddf69aa1c23b7456d6ed442b00))
* revert uv on Render, use pip directly for reliable script PATH ([0f0c910](https://github.com/eburairu/baby/commit/0f0c910813ebb6faab2e4834b91b854ea031f67b))
* sort openapi.json keys for deterministic output across Python versions ([7b696a4](https://github.com/eburairu/baby/commit/7b696a4f4fbc9d06a256cfaf04b9083ce527d73a))

## [1.22.1](https://github.com/eburairu/baby/compare/v1.22.0...v1.22.1) (2026-02-18)


### Bug Fixes

* remove --system flag from uv pip install to fix alembic not found on Render ([9317833](https://github.com/eburairu/baby/commit/931783397f98aff4ccb28752dafb64517804bb33))

# [1.22.0](https://github.com/eburairu/baby/compare/v1.21.0...v1.22.0) (2026-02-18)


### Bug Fixes

* **notifications:** add timeout and pushManager check to subscribeUser ([36ec901](https://github.com/eburairu/baby/commit/36ec901cd2d1193e264841540ac7f9127786af75))
* **notifications:** prevent double mailto: prefix in VAPID claims ([85f3864](https://github.com/eburairu/baby/commit/85f38645885a4bef984470138f5c2988e5ba6919))
* **notifications:** surface detailed error message on subscribe failure ([4d4b212](https://github.com/eburairu/baby/commit/4d4b212d14ed177c3a2eb10c7dcb18674fb77094))
* remove hardcoded VAPID public key from debug script ([96ad537](https://github.com/eburairu/baby/commit/96ad53798bafc28333d3d5dc7a410f3956bb33a0))
* resolve ImportError by importing get_db from app.dependencies in notifications router ([2936050](https://github.com/eburairu/baby/commit/2936050e9675b7905cb863ceb653a41608f0f6ab))
* resolve PWA loading hang by adding hydration check, timeout safeguard, and optimizing PWA config ([306f8a9](https://github.com/eburairu/baby/commit/306f8a9de7def060c7f6385738c786a666db933b))
* resolve PWA loading hang by adding hydration check, timeout safeguard, and optimizing PWA config ([cfe8554](https://github.com/eburairu/baby/commit/cfe8554b2763083a62830faba510f6399beb1c9f))


### Features

* improve notification permission handling with detailed error messages and iOS PWA support ([a48e52d](https://github.com/eburairu/baby/commit/a48e52df4b995318ecc29560042a79bfae9c0a27))
* **types:** introduce openapi-typescript for automatic type generation ([6de642a](https://github.com/eburairu/baby/commit/6de642aa4b5e53c04ffa630b727c04b22cb50b99))

# 1.0.0 (2026-02-17)


### Bug Fixes

* /auth/meのrevalidateOnFocusを無効化 ([50f054a](https://github.com/eburairu/baby/commit/50f054a18e6957d6d9df0a566553a44214a57bb9))
* /registerの404とファミリー登録の500エラーを修正 ([e18a8e0](https://github.com/eburairu/baby/commit/e18a8e0df24d85ffd606fd5515c027aa657412df))
* 🔒 Enforce role validation in MemberRoleUpdate schema ([591b475](https://github.com/eburairu/baby/commit/591b4754fb2c597c7b45a81db4acc9820dec726c))
* 🔒 remove hardcoded database credentials from app/database.py ([5327559](https://github.com/eburairu/baby/commit/5327559bddaadb049aaf7568a21430578e94df52))
* add alembic migration for growth record fields and convert weight data ([1d8f8e8](https://github.com/eburairu/baby/commit/1d8f8e85c8c4ce7171b13a87ba39da2c554820ad))
* add detailed R2 error logging for upload failures ([c9a2652](https://github.com/eburairu/baby/commit/c9a2652f74ce3765306ea3127d94be601c8df49e))
* add fallback for comment count fetching to prevent API failure ([eb4a5d4](https://github.com/eburairu/baby/commit/eb4a5d48f72c7a80065037aad10b5301f9727fab))
* add missing fetcher to comments hook and improve UI states ([d62849b](https://github.com/eburairu/baby/commit/d62849b6be25fa9d15e5fdb9b434dcd048782f11))
* add output export to next.config.ts for static build ([d3486d1](https://github.com/eburairu/baby/commit/d3486d13a388fbae43c0d496afe5edca8f24e403))
* AI日誌の生成文字数を100〜200字に変更 ([b6581fb](https://github.com/eburairu/baby/commit/b6581fb46153538d109ad474d507b281727874d7))
* AI日誌生成のエラーメッセージを改善 ([6771f8f](https://github.com/eburairu/baby/commit/6771f8f2c64015e21adbee58c2939d4b844aa9d4))
* **alembic:** マイグレーションの複数headをマージ ([169abe1](https://github.com/eburairu/baby/commit/169abe1bda3b85a3fd0aaae11df2a86be4049228))
* **alembic:** 重複マージマイグレーションを解消してheadを統一 ([2fdcb0e](https://github.com/eburairu/baby/commit/2fdcb0e44c98c31b208a8edd66bdc64e988d2b23))
* align frontend BabyRecord type with backend UnifiedRecord and fix notes access ([178b637](https://github.com/eburairu/baby/commit/178b637a787bf23623ea2d6f962efb973fd87df1))
* allow editing timestamp in record detail dialog and backend ([7e8169a](https://github.com/eburairu/baby/commit/7e8169a2c7dac2edaa2863ceba7d06799875ac33))
* API_BASEのURLを環境変数から取得するように修正 ([4ebd50c](https://github.com/eburairu/baby/commit/4ebd50c6ab0b29109dde693476f5f1310111207f))
* **auth:** improve tab visibility in dark mode by removing hardcoded light background ([3144854](https://github.com/eburairu/baby/commit/31448547c2f743e8184fc028bbdbe0175e6ed224))
* **auth:** improve tab visibility in dark mode by removing hardcoded light background ([2085dce](https://github.com/eburairu/baby/commit/2085dcec1649a493de3ad2990b54c99209bcef2e))
* baby gender update not working and improve schema validation ([39ed4e5](https://github.com/eburairu/baby/commit/39ed4e5f07366b8d312b40aefcb83cf1319794ad))
* **backend:** replace unsupported look-ahead regex with Pydantic field_validator ([4e9cc9c](https://github.com/eburairu/baby/commit/4e9cc9ce5c06fb13632d9d8d157751b0d0ed93dc))
* **backend:** replace unsupported look-ahead regex with Pydantic field_validator ([1ce2f54](https://github.com/eburairu/baby/commit/1ce2f54188f8655200802876113c5ab8a121d9b7))
* bcrypt 4.x非互換とHEADリクエスト405を修正 ([4b30707](https://github.com/eburairu/baby/commit/4b3070772f77d59349c4780943e474523bc41f03))
* change COOKIE_SECURE default to True for security ([c5089cb](https://github.com/eburairu/baby/commit/c5089cb2ac97d2a9f37abf08f4246cc6470fcd6b))
* cleanup migration file to only include record_comments ([2c20111](https://github.com/eburairu/baby/commit/2c201117427cc858d4e6cb4d8efa52ea840817ac))
* **db:** enable pool_pre_ping and set pool_recycle to stabilize connections ([ec39802](https://github.com/eburairu/baby/commit/ec39802d13456831530ba5c6dca85bb5c9350d44))
* ensure all records are saved in JST and enable growth date editing ([f3b7619](https://github.com/eburairu/baby/commit/f3b7619c14b959dc2e0824343176695dd58d98e4))
* ensure timestamps in unified records are in JST ([94246d9](https://github.com/eburairu/baby/commit/94246d97c5e9ea4b62dc804acbd517bbd4cb9ecc))
* family_users.joined_at と schedules.created_at のDEFAULT不足を修正 ([80b840c](https://github.com/eburairu/baby/commit/80b840c06ce1c92f7c1c8313aeea3ef1a141e1e3))
* **frontend:** implement dark mode support for login, settings, and tracker screens ([fbbf391](https://github.com/eburairu/baby/commit/fbbf391eb369488416766efd68cedf16253a3713))
* **frontend:** refine dark mode styles for diaper history, baby selector and dashboard widgets ([9a37a08](https://github.com/eburairu/baby/commit/9a37a089d7e16d37590cda6278fd824e21acbda1))
* **frontend:** refine dark mode styles for diaper history, baby selector and dashboard widgets ([5078f16](https://github.com/eburairu/baby/commit/5078f167fec10eec703f92a6fded47c4513b4526))
* **frontend:** remove duplicate Growth type import in GrowthHistoryList ([b2dfaae](https://github.com/eburairu/baby/commit/b2dfaaeda0b53aa1d0af8fe05f21786033b38682))
* handle offset-aware datetimes in note router ([82a8d58](https://github.com/eburairu/baby/commit/82a8d58cd30fb6a9cb478c1d762d39d5d6da3c31))
* import missing func in baby router ([6575613](https://github.com/eburairu/baby/commit/6575613c9a682f06da1c95e7052c08aeb76bc89a))
* improve note submission reliability and error handling ([ebd4806](https://github.com/eburairu/baby/commit/ebd48060cb457b553704e15933c66d91d77016f0))
* initialize note timestamp with local time ([5500bad](https://github.com/eburairu/baby/commit/5500bad3a387b7e3ad30b9527e3d1fd39ce28f67))
* only trigger Render deploy when new release is published ([4628b89](https://github.com/eburairu/baby/commit/4628b8952129fed503c53b5dd650b67cad4f785d))
* prevent path traversal in static file serving ([fd476e6](https://github.com/eburairu/baby/commit/fd476e67d09fb5403e2115e173a5d419532d9672))
* prevent VIEWER role from editing records via RecentActivityFeed and Note API ([f770202](https://github.com/eburairu/baby/commit/f7702025285e728dbc05c035468f163220b9064d))
* remove ContentType from presigned URL signature to fix R2 upload ([6a4cc10](https://github.com/eburairu/baby/commit/6a4cc10f455263c6123dca1ffa281e95f6f9ec10))
* remove redundant table creations from notes migration ([3e7b937](https://github.com/eburairu/baby/commit/3e7b93708d7fe8f813d6ebf364640f2a28a82b4a))
* replace datetime-local inputs with read-only text in edit dialogs to prevent unwanted calendar popup ([4a78a5d](https://github.com/eburairu/baby/commit/4a78a5d364f837b8f6a3b8460ff470d7c7a07332))
* replace native confirm with AlertDialog to prevent dialog from closing on re-render ([b45b997](https://github.com/eburairu/baby/commit/b45b99730953bdc7a2bbbf22421d059b3a11e6db))
* resolve backend datetime comparison TypeError, update tests for validation rules, and fix various frontend lint/build errors ([cf08997](https://github.com/eburairu/baby/commit/cf08997d02d984c2562581d2b4231ce21e3568f9))
* resolve ImportError by importing get_db from app.dependencies in notifications router ([37bd681](https://github.com/eburairu/baby/commit/37bd68127d4465ab950a8ad94d5cf835a3b55d6c))
* resolve infinite loading in permissions dialog and add tests ([3ac7469](https://github.com/eburairu/baby/commit/3ac74696b14f243951e97fe723077dbfd813d976))
* resolve PWA loading hang by adding hydration check, timeout safeguard, and optimizing PWA config ([306f8a9](https://github.com/eburairu/baby/commit/306f8a9de7def060c7f6385738c786a666db933b))
* resolve typescript error in comments hook by casting api response ([3ac57df](https://github.com/eburairu/baby/commit/3ac57df79b083ae9d24df4fcd79d8c11bdde1426))
* resolve typescript error in deleteNote return type ([ebd360e](https://github.com/eburairu/baby/commit/ebd360eb38295c895b25004fe137675ed5af4ff8))
* show detailed error message for presigned URL failure ([50810b5](https://github.com/eburairu/baby/commit/50810b5c1fb3c1f6bc5221c73c320a990cca3f83))
* switch to backend-proxied upload to avoid CORS issues with R2 ([8af8ccd](https://github.com/eburairu/baby/commit/8af8ccd15efbb0e294ed88a458f8f97b8aa979f3))
* useAuth.tsのUser型の二重定義によるビルドエラーを解消 ([7d3b79a](https://github.com/eburairu/baby/commit/7d3b79af7a2f06ade5bfc9de36bc835c856344e2))
* フロントエンドの登録フォームをバックエンドスキーマに合わせて修正 ([b00ec05](https://github.com/eburairu/baby/commit/b00ec05b05eba05a461234f8d97d1155bb45e7bd))
* フロントエンドの登録フォームをバックエンドスキーマに合わせて修正 ([6986f47](https://github.com/eburairu/baby/commit/6986f47cce2121a0d09578f7fc030fc14a6bf9a9))
* 育児日誌の生成文字数を300〜400字から100〜200字に変更 ([5500ceb](https://github.com/eburairu/baby/commit/5500cebb3a1a02d856d1f7a2ec4c352f5cd5fb13))
* 育児日誌編集ダイアログにAI生成文を初期表示する ([36fd94c](https://github.com/eburairu/baby/commit/36fd94c67c7a1e55d417dc77b7f7d3b50d600905))


### Features

* 🎨 Enhance button accessibility and feedback ([9c6b421](https://github.com/eburairu/baby/commit/9c6b42100b74e68adee3f42ddb71434a41f66ba1))
* 🎨 Palette: Add sidebar navigation and improve back button logic ([ee85407](https://github.com/eburairu/baby/commit/ee85407808eadf1bd3de74e3c2ed018322ae469f))
* add 'unknown' gender option for babies and unify add/edit forms ([dda6913](https://github.com/eburairu/baby/commit/dda6913f53f916f3c50654d2b4df6a4fa6d085f1))
* add baby bottle favicon and update PWA icons ([ffb6f60](https://github.com/eburairu/baby/commit/ffb6f6012581ce6f3c0bad8b5487e0d0551f434e))
* add baby gender, WHO growth standards support, and PWA enhancements ([b1f8793](https://github.com/eburairu/baby/commit/b1f8793f07e2386d74d24c284c03b9eec4fb6adc))
* add back to dashboard button to common layout ([30f8214](https://github.com/eburairu/baby/commit/30f8214205e7e214e749e830fe73dd80448d2ad8))
* add image upload to diary using Cloudflare R2 ([75b0b06](https://github.com/eburairu/baby/commit/75b0b066f0fb36b6919dcd751eee640a164933d0))
* add note history page and update note widget ([ca26371](https://github.com/eburairu/baby/commit/ca2637133fb319f645d6ddf8d6f86837b87cfff4))
* add record comments and support viewer messages ([7346501](https://github.com/eburairu/baby/commit/7346501bc7ba615119c3475db5bdbb35a09cd8c0))
* add record detail dialog and update feeding patch endpoint ([9bfa9ec](https://github.com/eburairu/baby/commit/9bfa9ec2ff2847b546b4ff5eb4c0cb10d3a8625f))
* add viewer role and implement read-only restrictions ([f34ea33](https://github.com/eburairu/baby/commit/f34ea3307424ad1b6a53ee71fb4334684da34565))
* **ai-summary:** implement long-term characteristics for daily summary ([f9658d3](https://github.com/eburairu/baby/commit/f9658d3b891227e2a2d1488b8cf5075bc62af403))
* AI育児日誌生成機能を実装 ([4035bcd](https://github.com/eburairu/baby/commit/4035bcd823c0184db3f40b62d6e0248ac49571e5))
* **auth:** translate login and register screens to Japanese and align with UI design system ([e8c9ba8](https://github.com/eburairu/baby/commit/e8c9ba89a8ae6ab571415e9ef54cb765c68812b6))
* **auth:** ユーザー認証とセッション管理の仕様を追加 ([d03e0ad](https://github.com/eburairu/baby/commit/d03e0ad04f04662c46f8dab22d236c045a2b499c))
* **baby:** 赤ちゃんの特徴・傾向フィールドを追加 ([a25e501](https://github.com/eburairu/baby/commit/a25e501a69093b5b1d426cb20d26aee76318cc9d))
* configure login auto-fill and add verification script ([24df76b](https://github.com/eburairu/baby/commit/24df76bb8cb85143d76b58ef53db21e1f725f15e))
* **contraction:** add 1-min offset start button and edit functionality ([144ef41](https://github.com/eburairu/baby/commit/144ef4124b58f82a1b78518a240406b8e15e28d1))
* **contraction:** implement waveform UI and real-time visualization for contraction timer ([1c7ef62](https://github.com/eburairu/baby/commit/1c7ef628a98e1caaebcb20e864374f34f9435674))
* **contraction:** implement waveform UI and real-time visualization for contraction timer ([601352d](https://github.com/eburairu/baby/commit/601352d6664c95dcac2d4f4c82295e5abac51a1f))
* **contraction:** upgrade waveform UI to rich Recharts version with interactive tooltips ([0dc8054](https://github.com/eburairu/baby/commit/0dc8054c67ed909faba105e02127bef47e3a13e0))
* **contraction:** upgrade waveform UI to rich Recharts version with interactive tooltips ([2b45439](https://github.com/eburairu/baby/commit/2b45439db6ee9a6ec59914419e0a9f574ac76ff8))
* **contraction:** 陣痛の間隔を計算する機能を追加 ([069a229](https://github.com/eburairu/baby/commit/069a229ca17b2eea4c4be9b15a5f259b52190bb4))
* **diaper:** おむつの更新機能を追加 ([1356993](https://github.com/eburairu/baby/commit/1356993aa09ec9e8e488961e13be5ce12851a6e6))
* **diaper:** おむつ記録機能を追加 ([73283df](https://github.com/eburairu/baby/commit/73283df655ad33450a908c3e3f2f1cd15ef96ba1))
* **docker:** Dockerfileと.dockerignoreを追加しビルド最適化を実施 ([09faab1](https://github.com/eburairu/baby/commit/09faab13d782c9c0380d30fea67d4bfe955ba369))
* eliminate async waterfalls in dashboard and diary following Vercel best practices ([e2bb482](https://github.com/eburairu/baby/commit/e2bb4820aa368f99f888965591af2bf5ab736fa9))
* eliminate async waterfalls in dashboard and diary following Vercel best practices ([41e0321](https://github.com/eburairu/baby/commit/41e0321dc50cdfd88d726ba3b00548045548597e))
* **feeding:** 授乳記録機能を追加 ([ea1379b](https://github.com/eburairu/baby/commit/ea1379b8e1c8e2cafbe0e6376d3e7e356525244e))
* **frontend:** implement PWA support based on specification ([ef5cc28](https://github.com/eburairu/baby/commit/ef5cc28a431bfdf908b95587a720846f09a5f753))
* **frontend:** remove redundant back buttons from sub-page headers ([99258a9](https://github.com/eburairu/baby/commit/99258a96845fb7eed7321903bc06f462d5470f29))
* implement baby access permission settings ([6c948a8](https://github.com/eburairu/baby/commit/6c948a8dca03a34cbc104d3bf33a464542cec33b))
* Implement contraction timer feature including a dedicated page, Zustand store, components for timer, history, and statistics. ([06d3f92](https://github.com/eburairu/baby/commit/06d3f9264502db4e9d7ebb059b008ae4e9a55e87))
* implement dark mode support across all pages and components ([dab25d1](https://github.com/eburairu/baby/commit/dab25d196875e8c83c3ab077ce0530881349f417))
* implement general memo feature and integrate with AI summary ([bbc9593](https://github.com/eburairu/baby/commit/bbc95930c51145752a96d08190562071dfffe032))
* implement growth tracker with charts and history ([5c69031](https://github.com/eburairu/baby/commit/5c690319e71e97c333987eebb9ae4514ede62e6c))
* implement PWA push notifications with VAPID authentication ([f17eca4](https://github.com/eburairu/baby/commit/f17eca4ee86c4d1f9cb15afb713d1c8c0fab84ef))
* implement sliding session and persistent cookies ([cd6e7a2](https://github.com/eburairu/baby/commit/cd6e7a2d490ef1138cf25880a68181f9a40d995f))
* improve notification permission handling with detailed error messages and iOS PWA support ([324df31](https://github.com/eburairu/baby/commit/324df317961fd38897658287a4367ad3646fa7fb))
* **profile:** プロフィール編集機能を追加 ([0e7fa2a](https://github.com/eburairu/baby/commit/0e7fa2a74ac6640bad89e5d20a2231de7fdb6805))
* remove redundant local back buttons from subpages ([e454422](https://github.com/eburairu/baby/commit/e454422c33a26dc247f2f41764d1c0d61cc8bf1d))
* setup semantic-release ([6652824](https://github.com/eburairu/baby/commit/66528242d7bc07297b675163e94792dad94d5b69))
* **sleep:** 睡眠記録機能を追加 ([8dc5403](https://github.com/eburairu/baby/commit/8dc5403dcfa0f1888679780146b5485caa155a03))
* Standardize Button Loading State ([e51440a](https://github.com/eburairu/baby/commit/e51440a34e9922d106f82a79e5b29480e901bf89))
* unify app name to 'Baby App' and update PWA settings project-wide ([8e53fba](https://github.com/eburairu/baby/commit/8e53fba63ad063101dcd195c5de01e9b910f4bbe))
* unify dashboard widget navigation with SleepWidget style ([66a177f](https://github.com/eburairu/baby/commit/66a177fcb9b41ed3173682bfb7ea1d23b52e5f2a))
* unify UI/UX design across all detail pages according to specs ([8805b81](https://github.com/eburairu/baby/commit/8805b817cc954332d0b8e17bbbabe9e3d18deede))
* おむつ交換記録機能の仕様書を追加 ([018c45c](https://github.com/eburairu/baby/commit/018c45c2112fa300137a2093ca7ba864e9ec22a9))
* ダッシュボード機能の仕様書を追加 ([24f2840](https://github.com/eburairu/baby/commit/24f2840f8d50fc73d1c403d284248021cd8e8d69))
* ベビーアプリの機能を強化し、ユーザー認証とデータ管理を改善 ([a1063d2](https://github.com/eburairu/baby/commit/a1063d22914f44159cc597df1f8de6bdb7319b95))
* ベビー追跡アプリケーションの初期実装を追加 ([13c6657](https://github.com/eburairu/baby/commit/13c6657d59d3f5923d9350c9780a6b915a09264e))
* 成長記録機能の仕様書を追加 ([aa777ae](https://github.com/eburairu/baby/commit/aa777aed1a63248a529cea3da426ea23dc821d6a))
* 授乳記録機能の仕様書を追加 ([a9be2e9](https://github.com/eburairu/baby/commit/a9be2e9ad7230624abb96b2c27a845d3ba78784d))
* 環境設定ファイルとドキュメントを更新 ([85639a3](https://github.com/eburairu/baby/commit/85639a372a2ce81b3ded519c2aa4d9bef7f405b8))
* 睡眠記録機能の仕様書を追加 ([98ecd3d](https://github.com/eburairu/baby/commit/98ecd3d71531a89812de0f773db4c1ce617ddf0d))
* 睡眠記録機能の更新と新しいウィジェットを追加 ([58fee51](https://github.com/eburairu/baby/commit/58fee51cf3a4f6ebd82ca562e6875cc55e5d4ba0))
* 統計計算機能を追加し、コンポーネントで使用するように変更 ([51d6b07](https://github.com/eburairu/baby/commit/51d6b0795b13231443cd710634c4028011f917f4))
* 赤ちゃんと家族の設定機能を追加 ([8e68caa](https://github.com/eburairu/baby/commit/8e68caa2330e51d3021a862f1d0aec6f63dda159))
* 赤ちゃん情報更新と削除機能の実装を完了 ([6517e48](https://github.com/eburairu/baby/commit/6517e48372bd2497c4b8d4879a0149bc3ed11e5f))
* 赤ちゃん選択の状態管理をストアに移行 ([2309dcd](https://github.com/eburairu/baby/commit/2309dcdb57d88b45f91524cce33f7917a0ff8c15))
* 陣痛タイマー機能の改善と新規グラフコンポーネントの追加 ([3351fc8](https://github.com/eburairu/baby/commit/3351fc840f171822496e330f9817e1664158b676))


### Performance Improvements

* add index to contraction baby_id for better query performance ([36976ce](https://github.com/eburairu/baby/commit/36976ce70132ca39698bc6d2957781e9c63f4602))
* add pagination to diaper records endpoint ([92cfc8e](https://github.com/eburairu/baby/commit/92cfc8e0b43ae9af0308cfef1805a3715975279a))
* change async dependency with blocking DB I/O to sync ([1343685](https://github.com/eburairu/baby/commit/13436853929216176f3731f2946f6b8eb3d48e0a))
* **frontend:** memoize sleep history sort to prevent re-renders ([683587d](https://github.com/eburairu/baby/commit/683587d653a55493367194fa406105ae59f8640a))
* optimize barrel file imports in next.config.ts ([a565b15](https://github.com/eburairu/baby/commit/a565b156200925693ad55944263b9155654e1596))
* optimize barrel file imports in next.config.ts ([c4f22d1](https://github.com/eburairu/baby/commit/c4f22d1b887c3b9149d23c112ca55203a143d3e7))
* optimize dashboard performance following Vercel best practices ([abfc1d2](https://github.com/eburairu/baby/commit/abfc1d2b4c9af362e1a46e0fd2b617fb512c5402))
* optimize N+1 query in get_baby_permissions ([34833dd](https://github.com/eburairu/baby/commit/34833dd8ec023f8f8ff5a93c2d331cf22bf5e69d))

# [1.21.0](https://github.com/eburairu/baby/compare/v1.20.1...v1.21.0) (2026-02-17)


### Features

* improve notification permission handling with detailed error messages and iOS PWA support ([17c65f6](https://github.com/eburairu/baby/commit/17c65f64a451007ff14d7ba19bcc4750b9f2b40b))

## [1.20.1](https://github.com/eburairu/baby/compare/v1.20.0...v1.20.1) (2026-02-17)


### Bug Fixes

* resolve ImportError by importing get_db from app.dependencies in notifications router ([0f9f5cd](https://github.com/eburairu/baby/commit/0f9f5cd316468c316ff0f6d47b25984401f8f474))

# [1.20.0](https://github.com/eburairu/baby/compare/v1.19.1...v1.20.0) (2026-02-17)


### Features

* implement PWA push notifications with VAPID authentication ([99acc64](https://github.com/eburairu/baby/commit/99acc64b3285b61a33984e4d870a3f97aab8d9eb))

## [1.19.1](https://github.com/eburairu/baby/compare/v1.19.0...v1.19.1) (2026-02-16)


### Bug Fixes

* only trigger Render deploy when new release is published ([7198a60](https://github.com/eburairu/baby/commit/7198a60eb8e4167ceef12735e8a10c5fc3161148))

# [1.19.0](https://github.com/eburairu/baby/compare/v1.18.0...v1.19.0) (2026-02-16)


### Bug Fixes

* 🔒 Enforce role validation in MemberRoleUpdate schema ([c8e9471](https://github.com/eburairu/baby/commit/c8e94714f9c7712c04b79570d2bf072288e07f06))


### Features

* eliminate async waterfalls in dashboard and diary following Vercel best practices ([aff0994](https://github.com/eburairu/baby/commit/aff0994d1d277b98d4869d4650d7b0ce081e08dd))


### Performance Improvements

* optimize barrel file imports in next.config.ts ([ea28883](https://github.com/eburairu/baby/commit/ea28883f3272ff1bb8e3d9673cbf795b7ff64595))
* optimize dashboard performance following Vercel best practices ([785c5fb](https://github.com/eburairu/baby/commit/785c5fb1199418d43fef62ad3148bbbe16e2812a))

# [1.18.0](https://github.com/eburairu/baby/compare/v1.17.0...v1.18.0) (2026-02-16)


### Features

* eliminate async waterfalls in dashboard and diary following Vercel best practices ([46a238a](https://github.com/eburairu/baby/commit/46a238a3e0558275c8a32abd55a0a2c3b568eab2))


### Performance Improvements

* optimize barrel file imports in next.config.ts ([03a87ce](https://github.com/eburairu/baby/commit/03a87ce3f40906e10d64a2c40c5759ef28d00e1c))

# [1.17.0](https://github.com/eburairu/baby/compare/v1.16.5...v1.17.0) (2026-02-16)


### Features

* implement sliding session and persistent cookies ([2448258](https://github.com/eburairu/baby/commit/2448258a1a6724ffb75284553584aec10094337e))

## [1.16.5](https://github.com/eburairu/baby/compare/v1.16.4...v1.16.5) (2026-02-16)


### Bug Fixes

* resolve typescript error in comments hook by casting api response ([110d9ee](https://github.com/eburairu/baby/commit/110d9ee82ee08b937dd5a2b2467bfbad3dbed319))

## [1.16.4](https://github.com/eburairu/baby/compare/v1.16.3...v1.16.4) (2026-02-16)


### Bug Fixes

* add missing fetcher to comments hook and improve UI states ([feaea6f](https://github.com/eburairu/baby/commit/feaea6ff739908317362dfb442d482f3c731667c))

## [1.16.3](https://github.com/eburairu/baby/compare/v1.16.2...v1.16.3) (2026-02-16)


### Bug Fixes

* import missing func in baby router ([c7154a8](https://github.com/eburairu/baby/commit/c7154a8d093cff3beba8df7392764812e096bcf3))

## [1.16.2](https://github.com/eburairu/baby/compare/v1.16.1...v1.16.2) (2026-02-16)


### Bug Fixes

* add fallback for comment count fetching to prevent API failure ([a50676b](https://github.com/eburairu/baby/commit/a50676b224b6fd5c1312006f765dca7cdeaad3d1))

## [1.16.1](https://github.com/eburairu/baby/compare/v1.16.0...v1.16.1) (2026-02-16)


### Bug Fixes

* cleanup migration file to only include record_comments ([f6c2bd3](https://github.com/eburairu/baby/commit/f6c2bd350ee12e26215e1536fa0527e5950a4443))

# [1.16.0](https://github.com/eburairu/baby/compare/v1.15.4...v1.16.0) (2026-02-16)


### Features

* add record comments and support viewer messages ([13aed82](https://github.com/eburairu/baby/commit/13aed8229372519c9016f9e9be320c462d8f1b58))

## [1.15.4](https://github.com/eburairu/baby/compare/v1.15.3...v1.15.4) (2026-02-16)


### Bug Fixes

* replace datetime-local inputs with read-only text in edit dialogs to prevent unwanted calendar popup ([ebdbdf9](https://github.com/eburairu/baby/commit/ebdbdf9346fe315b2b7f2637a7c3ff3eaec4eebe))

## [1.15.3](https://github.com/eburairu/baby/compare/v1.15.2...v1.15.3) (2026-02-16)


### Bug Fixes

* prevent VIEWER role from editing records via RecentActivityFeed and Note API ([99ad464](https://github.com/eburairu/baby/commit/99ad4643262c33350c75e4a8b101b096135e491a))

## [1.15.2](https://github.com/eburairu/baby/compare/v1.15.1...v1.15.2) (2026-02-16)


### Bug Fixes

* ensure all records are saved in JST and enable growth date editing ([9308eb3](https://github.com/eburairu/baby/commit/9308eb3cbd15155d8edfda22a01cb21adac41e19))

## [1.15.1](https://github.com/eburairu/baby/compare/v1.15.0...v1.15.1) (2026-02-16)


### Bug Fixes

* allow editing timestamp in record detail dialog and backend ([1f39a00](https://github.com/eburairu/baby/commit/1f39a0023e6b11fe8cebcb191c8fd09d6f2d6691))

# [1.15.0](https://github.com/eburairu/baby/compare/v1.14.1...v1.15.0) (2026-02-16)


### Features

* add note history page and update note widget ([3cf008c](https://github.com/eburairu/baby/commit/3cf008c59a2c41217a5bc9972ed35b987e100ca9))

## [1.14.1](https://github.com/eburairu/baby/compare/v1.14.0...v1.14.1) (2026-02-16)


### Bug Fixes

* ensure timestamps in unified records are in JST ([e65681f](https://github.com/eburairu/baby/commit/e65681f264182316abb6f14216137e68d97f10ea))

# [1.14.0](https://github.com/eburairu/baby/compare/v1.13.8...v1.14.0) (2026-02-16)


### Features

* add record detail dialog and update feeding patch endpoint ([3a2065a](https://github.com/eburairu/baby/commit/3a2065a47cd9e8c326e54a0114b3e7ce43de5d2a))

## [1.13.8](https://github.com/eburairu/baby/compare/v1.13.7...v1.13.8) (2026-02-16)


### Bug Fixes

* resolve backend datetime comparison TypeError, update tests for validation rules, and fix various frontend lint/build errors ([6eb6d77](https://github.com/eburairu/baby/commit/6eb6d77a421b3e9c3544114f1bdd6d4a0e491616))

## [1.13.7](https://github.com/eburairu/baby/compare/v1.13.6...v1.13.7) (2026-02-16)


### Bug Fixes

* **db:** enable pool_pre_ping and set pool_recycle to stabilize connections ([4a2133e](https://github.com/eburairu/baby/commit/4a2133e88e2818435acff82bb89ae28f3fe177e3))

## [1.13.6](https://github.com/eburairu/baby/compare/v1.13.5...v1.13.6) (2026-02-16)


### Bug Fixes

* resolve typescript error in deleteNote return type ([9279671](https://github.com/eburairu/baby/commit/92796716098c00897a35c6c3b4816b9db6eb5b90))

## [1.13.5](https://github.com/eburairu/baby/compare/v1.13.4...v1.13.5) (2026-02-16)


### Bug Fixes

* handle offset-aware datetimes in note router ([7f08453](https://github.com/eburairu/baby/commit/7f0845355da1a6a5e7dcb6aa32e4534b75b544f9))

## [1.13.4](https://github.com/eburairu/baby/compare/v1.13.3...v1.13.4) (2026-02-16)


### Bug Fixes

* improve note submission reliability and error handling ([e93fe2e](https://github.com/eburairu/baby/commit/e93fe2ecc703208b9441419a84aac0d737ca9002))

## [1.13.3](https://github.com/eburairu/baby/compare/v1.13.2...v1.13.3) (2026-02-15)


### Bug Fixes

* initialize note timestamp with local time ([4e17697](https://github.com/eburairu/baby/commit/4e17697e55e4f9b10dfee2d3e665b822e2e9eb40))

## [1.13.2](https://github.com/eburairu/baby/compare/v1.13.1...v1.13.2) (2026-02-15)


### Bug Fixes

* align frontend BabyRecord type with backend UnifiedRecord and fix notes access ([0421da3](https://github.com/eburairu/baby/commit/0421da33ecc3b2909e85ea6bdf124790343d2580))

## [1.13.1](https://github.com/eburairu/baby/compare/v1.13.0...v1.13.1) (2026-02-15)


### Bug Fixes

* remove redundant table creations from notes migration ([72c8db4](https://github.com/eburairu/baby/commit/72c8db48b1ccd68a2cb359a2999740276f79e51c))

# [1.13.0](https://github.com/eburairu/baby/compare/v1.12.1...v1.13.0) (2026-02-15)


### Bug Fixes

* **auth:** improve tab visibility in dark mode by removing hardcoded light background ([f7317aa](https://github.com/eburairu/baby/commit/f7317aabda651e932cd84ad169f5400b9e84edc3))


### Features

* implement general memo feature and integrate with AI summary ([67b5daa](https://github.com/eburairu/baby/commit/67b5daae92aedd28f7ccb42067f320379b6c0b53))

## [1.12.1](https://github.com/eburairu/baby/compare/v1.12.0...v1.12.1) (2026-02-15)


### Bug Fixes

* **auth:** improve tab visibility in dark mode by removing hardcoded light background ([daabff1](https://github.com/eburairu/baby/commit/daabff1cea13c6444cdb39f1a61e97d29ec8bc2f))

# [1.12.0](https://github.com/eburairu/baby/compare/v1.11.0...v1.12.0) (2026-02-15)


### Features

* **auth:** translate login and register screens to Japanese and align with UI design system ([a1608ab](https://github.com/eburairu/baby/commit/a1608ab24e604a3c537eb43f2d7a62dedb05beda))

# [1.11.0](https://github.com/eburairu/baby/compare/v1.10.1...v1.11.0) (2026-02-15)


### Bug Fixes

* **backend:** replace unsupported look-ahead regex with Pydantic field_validator ([57a3e29](https://github.com/eburairu/baby/commit/57a3e29a81cd1c7a891ea14872d08eeb130357d2))


### Features

* **contraction:** add 1-min offset start button and edit functionality ([98dadcc](https://github.com/eburairu/baby/commit/98dadccbd95f693c2c238e5f79dd14d02ddd94b1))
* **contraction:** upgrade waveform UI to rich Recharts version with interactive tooltips ([d130cad](https://github.com/eburairu/baby/commit/d130cad37fe257a7cf0dbc30521e9be0e3d28cf7))

## [1.10.1](https://github.com/eburairu/baby/compare/v1.10.0...v1.10.1) (2026-02-15)


### Bug Fixes

* **backend:** replace unsupported look-ahead regex with Pydantic field_validator ([a7ffe2f](https://github.com/eburairu/baby/commit/a7ffe2f4d1474fcc73678b34aeaacd8e63fab99f))

# [1.10.0](https://github.com/eburairu/baby/compare/v1.9.0...v1.10.0) (2026-02-15)


### Features

* **contraction:** upgrade waveform UI to rich Recharts version with interactive tooltips ([13df0fc](https://github.com/eburairu/baby/commit/13df0fcf5119a33fffd5ab11a2fb4929fb1e960a))

# [1.9.0](https://github.com/eburairu/baby/compare/v1.8.0...v1.9.0) (2026-02-15)


### Bug Fixes

* **frontend:** refine dark mode styles for diaper history, baby selector and dashboard widgets ([f8d9c0f](https://github.com/eburairu/baby/commit/f8d9c0fb61248f92361791ded1885b8ea9167986))


### Features

* **contraction:** implement waveform UI and real-time visualization for contraction timer ([e1dc522](https://github.com/eburairu/baby/commit/e1dc52224f41398c96499462c09d3a139f9d9c04))


### Performance Improvements

* add pagination to diaper records endpoint ([e0bda10](https://github.com/eburairu/baby/commit/e0bda10145b24783d522ea161e6c27c36ee3aaf4))

# [1.8.0](https://github.com/eburairu/baby/compare/v1.7.2...v1.8.0) (2026-02-15)


### Features

* **contraction:** implement waveform UI and real-time visualization for contraction timer ([a69a7fa](https://github.com/eburairu/baby/commit/a69a7fa85d54f935e4dad311f8eb576e0ac3bf6b))

## [1.7.2](https://github.com/eburairu/baby/compare/v1.7.1...v1.7.2) (2026-02-15)


### Bug Fixes

* **frontend:** refine dark mode styles for diaper history, baby selector and dashboard widgets ([f424d60](https://github.com/eburairu/baby/commit/f424d60435a54b1f7dff75d75a6a194482528dc6))

## [1.7.1](https://github.com/eburairu/baby/compare/v1.7.0...v1.7.1) (2026-02-15)


### Bug Fixes

* **frontend:** implement dark mode support for login, settings, and tracker screens ([de2100b](https://github.com/eburairu/baby/commit/de2100b5e5fddf64cae5061f25f48ab9b1222091))

# [1.7.0](https://github.com/eburairu/baby/compare/v1.6.4...v1.7.0) (2026-02-15)


### Features

* implement dark mode support across all pages and components ([eb91fbd](https://github.com/eburairu/baby/commit/eb91fbde9c7bf6b5447032554edbf8b2df541271))

## [1.6.4](https://github.com/eburairu/baby/compare/v1.6.3...v1.6.4) (2026-02-15)


### Bug Fixes

* add detailed R2 error logging for upload failures ([14e984d](https://github.com/eburairu/baby/commit/14e984df74e18b26b3c2028f750bf8a06f6010eb))

## [1.6.3](https://github.com/eburairu/baby/compare/v1.6.2...v1.6.3) (2026-02-15)


### Bug Fixes

* switch to backend-proxied upload to avoid CORS issues with R2 ([1c16ea8](https://github.com/eburairu/baby/commit/1c16ea87aec2a1c952e3f8ba770842a757585edd))

## [1.6.2](https://github.com/eburairu/baby/compare/v1.6.1...v1.6.2) (2026-02-15)


### Bug Fixes

* remove ContentType from presigned URL signature to fix R2 upload ([fc7e02f](https://github.com/eburairu/baby/commit/fc7e02f151b2703276420a3789080da5bd419095))

## [1.6.1](https://github.com/eburairu/baby/compare/v1.6.0...v1.6.1) (2026-02-15)


### Bug Fixes

* show detailed error message for presigned URL failure ([ba5bbbb](https://github.com/eburairu/baby/commit/ba5bbbb757f3ab71d498fb13d0fc9214d3b371c4))

# [1.6.0](https://github.com/eburairu/baby/compare/v1.5.0...v1.6.0) (2026-02-15)


### Features

* add image upload to diary using Cloudflare R2 ([a430102](https://github.com/eburairu/baby/commit/a43010221c61e8731c4f663124d3e0a008ac3c2c))

# [1.5.0](https://github.com/eburairu/baby/compare/v1.4.0...v1.5.0) (2026-02-15)


### Features

* add baby bottle favicon and update PWA icons ([4044e08](https://github.com/eburairu/baby/commit/4044e0895f538e8d5b03b4d58b3fe56253011615))

# [1.4.0](https://github.com/eburairu/baby/compare/v1.3.1...v1.4.0) (2026-02-15)


### Features

* unify app name to 'Baby App' and update PWA settings project-wide ([0b61afa](https://github.com/eburairu/baby/commit/0b61afade5662b5fb45af4ed37fab475bc14eac8))

## [1.3.1](https://github.com/eburairu/baby/compare/v1.3.0...v1.3.1) (2026-02-15)


### Bug Fixes

* baby gender update not working and improve schema validation ([5d154d4](https://github.com/eburairu/baby/commit/5d154d4c5fc39e2c910510702e457b307b1cdaa8))

# [1.3.0](https://github.com/eburairu/baby/compare/v1.2.0...v1.3.0) (2026-02-15)


### Features

* add viewer role and implement read-only restrictions ([4d1cb9e](https://github.com/eburairu/baby/commit/4d1cb9e504a37de234f58cd23005bcc69695b783))

# [1.2.0](https://github.com/eburairu/baby/compare/v1.1.1...v1.2.0) (2026-02-15)


### Features

* add 'unknown' gender option for babies and unify add/edit forms ([665fa8d](https://github.com/eburairu/baby/commit/665fa8d755aa9665fae8e35a983940e1b7ded628))

## [1.1.1](https://github.com/eburairu/baby/compare/v1.1.0...v1.1.1) (2026-02-15)


### Bug Fixes

* **frontend:** remove duplicate Growth type import in GrowthHistoryList ([2a547f2](https://github.com/eburairu/baby/commit/2a547f27805f89eeba35ed2acde70feb71418865))

# [1.1.0](https://github.com/eburairu/baby/compare/v1.0.0...v1.1.0) (2026-02-15)


### Features

* **frontend:** remove redundant back buttons from sub-page headers ([c680029](https://github.com/eburairu/baby/commit/c6800299021350502b67910de1667a3eb5684b26))

# 1.0.0 (2026-02-15)


### Bug Fixes

* /auth/meのrevalidateOnFocusを無効化 ([c1bffd7](https://github.com/eburairu/baby/commit/c1bffd77198d4df432ea202506ce51238fa1dd76))
* /registerの404とファミリー登録の500エラーを修正 ([70a57ef](https://github.com/eburairu/baby/commit/70a57efb9cdd7d88f98280c7f39afe3162765964))
* 🔒 remove hardcoded database credentials from app/database.py ([b87ea37](https://github.com/eburairu/baby/commit/b87ea370ac2299dc3889c8975ebba6345c497b54))
* add alembic migration for growth record fields and convert weight data ([de39aa7](https://github.com/eburairu/baby/commit/de39aa7d47f7755881a297bc5706403459897e47))
* add output export to next.config.ts for static build ([d3486d1](https://github.com/eburairu/baby/commit/d3486d13a388fbae43c0d496afe5edca8f24e403))
* AI日誌の生成文字数を100〜200字に変更 ([4a6f0c4](https://github.com/eburairu/baby/commit/4a6f0c4857383657baa6d957067d114e668b5b2d))
* AI日誌生成のエラーメッセージを改善 ([c98e297](https://github.com/eburairu/baby/commit/c98e29704e3718e8b6e1831a224a20746b2675bd))
* **alembic:** マイグレーションの複数headをマージ ([571e130](https://github.com/eburairu/baby/commit/571e130c9d43472119c47a46456c275e78db514c))
* **alembic:** 重複マージマイグレーションを解消してheadを統一 ([15818cd](https://github.com/eburairu/baby/commit/15818cd35203f3f78c82a77a92378353123b63c1))
* API_BASEのURLを環境変数から取得するように修正 ([5214efa](https://github.com/eburairu/baby/commit/5214efac0a558972f5ce76507cb693e4efe6269f))
* bcrypt 4.x非互換とHEADリクエスト405を修正 ([454a30c](https://github.com/eburairu/baby/commit/454a30c8e2fde9796e28e55f41e03f2e0cfb50fd))
* change COOKIE_SECURE default to True for security ([5570082](https://github.com/eburairu/baby/commit/557008298d419b89c1728ce7816be1c621705efb))
* family_users.joined_at と schedules.created_at のDEFAULT不足を修正 ([1de5a51](https://github.com/eburairu/baby/commit/1de5a51dc16854daa1cc59e17466e710326a1c92))
* prevent path traversal in static file serving ([bd62e1d](https://github.com/eburairu/baby/commit/bd62e1dd1fa3ddfd3a151d788f392742963d1b53))
* replace native confirm with AlertDialog to prevent dialog from closing on re-render ([34f0a73](https://github.com/eburairu/baby/commit/34f0a738520a82ae4be16e0effad826804098188))
* resolve infinite loading in permissions dialog and add tests ([e40d8f3](https://github.com/eburairu/baby/commit/e40d8f3a45787611c6e913bf2dd25b5cd42983d2))
* useAuth.tsのUser型の二重定義によるビルドエラーを解消 ([0246376](https://github.com/eburairu/baby/commit/024637677f4f1c26f3517bc0b2ba28fc8fa74ffb))
* フロントエンドの登録フォームをバックエンドスキーマに合わせて修正 ([0933b80](https://github.com/eburairu/baby/commit/0933b807bd5d35a533d96fdd56b5d59950caf3c7))
* フロントエンドの登録フォームをバックエンドスキーマに合わせて修正 ([6986f47](https://github.com/eburairu/baby/commit/6986f47cce2121a0d09578f7fc030fc14a6bf9a9))
* 育児日誌の生成文字数を300〜400字から100〜200字に変更 ([444d444](https://github.com/eburairu/baby/commit/444d4440de82aa1f4af68a74c0da8053e5af6693))
* 育児日誌編集ダイアログにAI生成文を初期表示する ([2d80dbd](https://github.com/eburairu/baby/commit/2d80dbd7354517c3c6f87c1ed2857acf0c2b5dd7))


### Features

* 🎨 Enhance button accessibility and feedback ([bcedbd6](https://github.com/eburairu/baby/commit/bcedbd6d9a4fe235c581a38c875b0db22fd4b435))
* 🎨 Palette: Add sidebar navigation and improve back button logic ([6abe2a9](https://github.com/eburairu/baby/commit/6abe2a9673b7184e31aa5cbfb9237a947a5675fd))
* add baby gender, WHO growth standards support, and PWA enhancements ([36c3125](https://github.com/eburairu/baby/commit/36c3125e47753f1550db51d1d04bf56918594b7f))
* add back to dashboard button to common layout ([6ef7339](https://github.com/eburairu/baby/commit/6ef73395a576af62527e7fcc60d90ddd6ee46d24))
* **ai-summary:** implement long-term characteristics for daily summary ([4721ec0](https://github.com/eburairu/baby/commit/4721ec0fae6edf81fdecd3370377690aff45b7d5))
* AI育児日誌生成機能を実装 ([7d46a4c](https://github.com/eburairu/baby/commit/7d46a4c6dc2f9e90b533a998923f676b2cb81abe))
* **auth:** ユーザー認証とセッション管理の仕様を追加 ([caed40d](https://github.com/eburairu/baby/commit/caed40de4b707e1f6231cd0e2eff02a7fd10042d))
* **baby:** 赤ちゃんの特徴・傾向フィールドを追加 ([bb6a6c0](https://github.com/eburairu/baby/commit/bb6a6c0e7487f8cee71970848115fe562e830c57))
* configure login auto-fill and add verification script ([34d5ab5](https://github.com/eburairu/baby/commit/34d5ab5fa0a75a02e18b22e26de70dacd4e18208))
* **contraction:** 陣痛の間隔を計算する機能を追加 ([d6e5833](https://github.com/eburairu/baby/commit/d6e583310d5fb82ee3a24b21386faa11d0bdff3a))
* **diaper:** おむつの更新機能を追加 ([7ca698c](https://github.com/eburairu/baby/commit/7ca698c40a3a4b38206f1b10bdc6ef2970241731))
* **diaper:** おむつ記録機能を追加 ([645be74](https://github.com/eburairu/baby/commit/645be74e364c36d8c4094f64bbe9e9dd6864b72d))
* **docker:** Dockerfileと.dockerignoreを追加しビルド最適化を実施 ([0e1d6e3](https://github.com/eburairu/baby/commit/0e1d6e3e2524efe709152fb5c54f9336e203817d))
* **feeding:** 授乳記録機能を追加 ([15ffef4](https://github.com/eburairu/baby/commit/15ffef4616f1677313ac6ef7d6d10793fd36feb1))
* **frontend:** implement PWA support based on specification ([dc7bc02](https://github.com/eburairu/baby/commit/dc7bc0282d157b37f90e37555a46056fda6aeece))
* implement baby access permission settings ([375839d](https://github.com/eburairu/baby/commit/375839d0c612bad3bf629b2d734bc77a01117679))
* Implement contraction timer feature including a dedicated page, Zustand store, components for timer, history, and statistics. ([7a709a2](https://github.com/eburairu/baby/commit/7a709a25f97e67e22e3d40225673ae18e6cac41a))
* implement growth tracker with charts and history ([ca598e1](https://github.com/eburairu/baby/commit/ca598e183cf42f18c6862e39fd874016577d9721))
* **profile:** プロフィール編集機能を追加 ([2702f35](https://github.com/eburairu/baby/commit/2702f3500681e5b16231af1d6649a402ad9c7271))
* remove redundant local back buttons from subpages ([8586005](https://github.com/eburairu/baby/commit/85860051a0d202760854ede61378484630be43c0))
* setup semantic-release ([15b8783](https://github.com/eburairu/baby/commit/15b8783643d9d74e1963bcfcfcd5fb29b80b9395))
* **sleep:** 睡眠記録機能を追加 ([eb34d52](https://github.com/eburairu/baby/commit/eb34d52d1578417f65f63f92a1e0f87474ba58ce))
* Standardize Button Loading State ([b2cacec](https://github.com/eburairu/baby/commit/b2cacec0e048d50b69ae4852e93dfc5aa7fe9670))
* unify dashboard widget navigation with SleepWidget style ([39ab4f7](https://github.com/eburairu/baby/commit/39ab4f7704051201dbb6055fe1fa11a309c2beeb))
* unify UI/UX design across all detail pages according to specs ([6b71b91](https://github.com/eburairu/baby/commit/6b71b919021d83490282f11d297819d23eff03bd))
* おむつ交換記録機能の仕様書を追加 ([95044d3](https://github.com/eburairu/baby/commit/95044d35d7f34280ab8bedef461b3c2e64ee1175))
* ダッシュボード機能の仕様書を追加 ([ec69bc2](https://github.com/eburairu/baby/commit/ec69bc2cb1be15251d597c9d3ceb366122088a4b))
* ベビーアプリの機能を強化し、ユーザー認証とデータ管理を改善 ([a1063d2](https://github.com/eburairu/baby/commit/a1063d22914f44159cc597df1f8de6bdb7319b95))
* ベビー追跡アプリケーションの初期実装を追加 ([13c6657](https://github.com/eburairu/baby/commit/13c6657d59d3f5923d9350c9780a6b915a09264e))
* 成長記録機能の仕様書を追加 ([9875125](https://github.com/eburairu/baby/commit/98751259afa7cb70057c2dd676fe45310d43f6ad))
* 授乳記録機能の仕様書を追加 ([472b498](https://github.com/eburairu/baby/commit/472b498374e1ef0fd32abeb0a45912ef4085d325))
* 環境設定ファイルとドキュメントを更新 ([dcb0480](https://github.com/eburairu/baby/commit/dcb0480be24df3f94a17058bb13b4692a793f986))
* 睡眠記録機能の仕様書を追加 ([ac87125](https://github.com/eburairu/baby/commit/ac8712584589dc549cf52d2b4c0ba31d5a93fed0))
* 睡眠記録機能の更新と新しいウィジェットを追加 ([e8514d9](https://github.com/eburairu/baby/commit/e8514d9974c9c276d95234361558a2c18a8a1ec2))
* 統計計算機能を追加し、コンポーネントで使用するように変更 ([2994476](https://github.com/eburairu/baby/commit/2994476150ba30d5185fec442486eca4f1d84772))
* 赤ちゃんと家族の設定機能を追加 ([6a16008](https://github.com/eburairu/baby/commit/6a1600894e7f251a295d8e8be0527b099d328582))
* 赤ちゃん情報更新と削除機能の実装を完了 ([d0eba00](https://github.com/eburairu/baby/commit/d0eba00f4233617da77bbe53bebf51307a8093e9))
* 赤ちゃん選択の状態管理をストアに移行 ([36aef43](https://github.com/eburairu/baby/commit/36aef4367a1f1ed11d0bc72982ab733157edf649))
* 陣痛タイマー機能の改善と新規グラフコンポーネントの追加 ([ec604ba](https://github.com/eburairu/baby/commit/ec604ba99458ad9ac327a5ca0ccd9b628f773d90))


### Performance Improvements

* add index to contraction baby_id for better query performance ([3e6b572](https://github.com/eburairu/baby/commit/3e6b572da5a163edb0e70e9f565feca6cd69cb03))
* change async dependency with blocking DB I/O to sync ([ff609f9](https://github.com/eburairu/baby/commit/ff609f94986fbc1abd7b6449fd898b6455cc6ef5))
* **frontend:** memoize sleep history sort to prevent re-renders ([57b15ef](https://github.com/eburairu/baby/commit/57b15efcdc69e97f8a81620f270de2f3da009891))
* optimize N+1 query in get_baby_permissions ([1126712](https://github.com/eburairu/baby/commit/1126712af099def96165200d0bf5661d26b06d0b))
