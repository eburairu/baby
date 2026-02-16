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
