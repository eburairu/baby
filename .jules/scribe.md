## 2026-03-05 - [未実装機能（AI Chatbot）の仕様書記載による混乱防止]

**学び:**

- `ai_chatbot.md` において、`app/models/chatbot.py` や `app/routers/chatbot.py` などの具体的なファイル名やAPIエンドポイントが詳細に設計・記載されているにもかかわらず、実際のコードベースには一切実装が存在しない状態でした。
- 実装を伴わない設計ドラフトがそのまま仕様書ディレクトリに置かれていると、開発者が「すでに実装されている」と誤認してコードを探す手間が発生し、混乱を招く原因となります。

**アクション:**

- `ai_chatbot.md` の冒頭に「Status: Pending / Not Implemented」という目立つ警告ブロックを追記し、この機能が現在未実装であり将来に向けたドラフトであることを明記しました。
- 今後、仕様書をレビューする際は、詳細なエンドポイントやコンポーネントの記述がある場合、それが実際にコード上に存在するかどうかを確認し、存在しない場合は「未実装（Draft/Pending）」であることを明記するルールを徹底します。

## 2026-03-05 - [汎用メモ機能における仕様と実装の乖離の発見]

**学び:**

- 汎用メモ機能（`app/routers/note.py`）において、APIレスポンススキーマ（`NoteResponse`）は定義されていたものの、リクエストスキーマ（`NoteCreate`, `NoteUpdate`）が仕様書（`general_memo.md`）に記載されていなかった。
- さらに、メモ作成時（`POST /api/babies/{baby_id}/notes`）の副作用として「家族全員への通知（`notify_family_members`）」が実装されているが、API仕様のドキュメントに記載が漏れていた。これは他の記録機能（Diaper, Sleep等）でも過去に発生していたパターンと同様である。

**アクション:**

- `general_memo.md` を更新し、`NoteCreate`と`NoteUpdate`のスキーマを追加、`NoteResponse`を継承（`extends`）するようにリファクタリングし、副作用である通知機能の仕様をAPIエンドポイントセクションに明記した。
- 今後は、新しいエンドポイントや機能の仕様を確認する際、Pydanticモデル全体（Create, Update, Response）の継承関係と、ルーターに実装されている副作用（特に通知機能）が仕様書に正しく反映されているかを必須チェック項目とする。

## 2026-03-05 - [予防接種API仕様と実装の乖離の発見]

**学び:**

- 予防接種機能（`app/routers/vaccinations.py`）において、仕様書（`vaccination_tracker.md`）では `POST /api/vaccinations/` に「一括生成」が含まれると記載されていましたが、実際のコードでは `POST /api/vaccinations/generate` という専用の生成エンドポイントに分離されていました。
- 編集時のHTTPメソッドが `PUT` と表記されていたり（実装は `PATCH`）、保存成功時の家族への通知機能が仕様書には記載されているもののバックエンドに未実装（副作用処理の抜け漏れ）であったりなど、初期設計から実装に移る過程で生じた細かな乖離が残存していました。
- また、これまでの学び（他ドメイン）と同様に、リクエスト・レスポンスのスキーマ（`VaccinationCreate`, `VaccinationUpdate`, `VaccinationResponse`）が仕様書から完全に欠落していました。

**アクション:**

- `vaccination_tracker.md` を更新し、HTTPメソッドの修正（PATCH）、通知機能の未実装の明記、一括生成エンドポイント（/generate）の分離、および TypeScript インターフェース形式でのスキーマ定義（継承 `extends` を活用）を追記しました。
- 今後もAPI仕様を確認する際は、特に「初期設計で想定された便利機能（一括生成など）」が別エンドポイントとして実装されていないか、そして通知などの副作用処理が実際にコードに存在するかを重点的に照合します。

## 2026-03-05 - 追加機能の仕様書への反映漏れ（burpedフィールド）

**学び:**

- 授乳記録における「ゲップの有無」(`burped`)のように、後から追加された（Phase 3等で）機能のフィールドが、バックエンド (`FeedingCreate`, `FeedingUpdate`, `FeedingResponse`) およびフロントエンドに実装されて稼働しているにもかかわらず、仕様書 (`breastfeeding_tracker.md`) 上のデータモデルやAPIスキーマに記載が欠落しているパターンが見られた。
- 機能追加の段階的なリリースにおいて、最後にドキュメントの更新が漏れやすい。

**アクション:**

- 特定のドメインにおけるデータモデルの変更（マイグレーション）やスキーマ拡張を行う際は、実装が完了した段階で必ず対応する仕様書（`.specify/specs/` 以下）のスキーマ定義部分もセットで更新する。

## 2026-02-18 - 仕様書のメンテナンス

**学び:**

- 絶対パス（`file:///Users/...`）が仕様書内に混入しているケースを発見。これは開発者のローカル環境で作成されたドキュメントがそのままコミットされた可能性が高い。
- 「未実装」リストが実際のコードの実装状況と同期しておらず、古い情報（既に実装済みの機能）が未実装として残っているケースが多い。

**アクション:**

- 仕様書のリンクは必ず相対パスを使用するようにチェックする。
- 定期的に「未実装」リストを見直し、コードの実装状況と照らし合わせて更新する。

## 2026-02-18 - 通知機能の仕様化漏れ

**学び:**

- 家族への通知機能（Webプッシュ/アプリ内）がバックエンドのルーターレベル（`POST` リクエスト処理後）で実装されているが、仕様書に記載されていないケースが複数見つかった（Diaper, Sleep）。
- 通知機能は「副作用」として実装されることが多く、機能要件として明示されにくい傾向がある。

**アクション:**

- `POST` / `PUT` などの更新系APIの実装を確認する際は、`notify_family_members` などの通知送信ロジックが含まれていないか注意深くチェックし、仕様書に反映させる。

## 2026-02-23 - UIコンポーネントのプロパティ仕様化漏れ

**学び:**

- `WidgetQuickButton` の `hideContentOnLoading` のように、UX改善（レイアウトシフト防止）のために後から追加されたプロパティが、仕様書（デザインシステム）に反映されていないケースがある。
- デザインシステム仕様書は初期作成後は更新されにくく、コンポーネントの進化に取り残されやすい。

**アクション:**

- UIコンポーネントのコード修正や機能追加を行う際は、必ず対応する仕様書（`ui_design_system.md` 等）の該当セクションも同時に更新する習慣をつける。

## 2026-02-24 - デザインシステム仕様の乖離パターン

**学び:**

- `WidgetQuickButton` のように、コンポーネントの内部実装が大きく変更（例: `HexagonButton` の導入）された際、デザインシステム仕様書 (`ui_design_system.md`) の更新が漏れやすい。
- 特に、レイアウトシフト防止などのUX改善策が、当初のプロパティ設計 (`hideContentOnLoading`) から実装方針 (`HexagonButton` の固定サイズ) へ変更された場合、古い仕様がそのまま残り続ける傾向がある。

**アクション:**

- UIコンポーネントの仕様を確認する際は、必ず `frontend/components/` 以下の実際のコード (`.tsx`) を参照し、Propsの定義やデフォルト値を照合する。

## 2026-02-27 - 将来拡張機能の実装済み乖離

**学び:**

- 「将来的な拡張」や「初期リリースでは必須としない」と記述された機能（例：成長曲線のWHO基準線表示）が、実際には既に実装されているケースがある。開発が進むにつれ、仕様書の更新が追いついていない典型例。
- バリデーションルールが、仕様書では厳格（数値範囲指定など）に書かれているが、実装では柔軟（文字列受け入れなど）になっている場合がある。これは仕様書が「理想」を語り、実装が「現実」を優先した結果生じる乖離。

**アクション:**

- 「将来」「拡張」「必須としない」などのキーワードで仕様書を検索し、それらの機能が実装されていないかコードを確認する。
- バリデーションロジック（Zod schemaなど）は、仕様書の記述を鵜呑みにせず、必ず実際のコードを確認して同期させる。

## 2026-02-28 - ランディングページ(LP)におけるマーケティング変更の仕様化漏れ

**学び:**

- キャッチコピーの変更やコンバージョン率(CVR)向上のためのUX改善（社会的証明の追加、CTAの文言変更、マイクロコピーの追加など）は、コード上では頻繁にA/Bテストや改善が行われるが、仕様書（`landing_page.md`等）には反映されにくいパターンがある。
- エンジニアが主導する機能要件の変更に比べ、マーケティング・デザイン視点の変更はドキュメントの更新フローから漏れやすい。

**アクション:**

- LPや認証画面など、ユーザーの感情やコンバージョンに直結する画面の仕様を確認する際は、`.jules/magnet.md` などのマーケティング・UXの運用記録と実際のコード（コンポーネントツリーやテキスト情報）を照合し、仕様書を最新の「勝者」パターンの状態に同期させる。

## 2026-02-28 - Pydanticモデルの継承と仕様書での表現の乖離

**学び:**

- バックエンドのPydanticモデル（例: `SleepResponse(SleepCreate)`）で継承を利用して重複フィールドを省略しているにもかかわらず、仕様書ではすべてのプロパティを再定義しているケース（`interface SleepResponse { ... }`）が見られる。
- 他の仕様書（例: `DiaperResponse extends DiaperCreate`）では継承が正しく表現されており、仕様書間でフォーマットの不整合が生じている。

**アクション:**

- APIレスポンススキーマの仕様書を更新・確認する際は、対応するPythonファイル（`app/schemas/*.py`）のクラス定義を確認し、継承関係（`extends`）を利用して冗長な記述を減らし、他の仕様書と表現を統一する。

## 2026-03-05 - PydanticモデルとTypeScript仕様書の同期漏れ（Create/Updateスキーマ）

**学び:**

- バックエンドのPydanticモデルでリクエスト用のスキーマ（`GrowthCreate`, `GrowthUpdate`など）が定義されているにもかかわらず、仕様書（`growth_tracker.md`）ではレスポンススキーマ（`GrowthResponse`）のみが記載され、リクエストスキーマが完全に欠落しているケースを発見した。
- また、レスポンススキーマがリクエストスキーマを継承（`extends`）する構造になっているバックエンドの実装に対して、仕様書では全プロパティを再定義しており、冗長かつ同期漏れの原因となっていた。
- 以前の学び（2026-02-28）で指摘されていた継承フォーマットの不整合が、他ドメインの仕様書にも潜在的に残存していることが確認された。

**アクション:**

- API仕様をドキュメント化する際は、必ずレスポンスだけでなく、POST/PUT/PATCH用のリクエストスキーマも漏れなく記載する。
- 既存の仕様書をレビューする際は、`Response`スキーマだけでなく、`Create`および`Update`スキーマが定義されているか、またそれらが正しく継承関係（`extends`）を用いて記述されているかを重点的に確認する。

## 2026-02-18 - [おむつAPIと仕様書の乖離解消]

**学び:** `get_diapers` エンドポイントがページネーション対応 (`skip`, `limit` パラメータの追加) や部分更新のスキーマ (`DiaperUpdate`) をサポートしていたにも関わらず、`diaper_tracker.md` などの仕様書が古いままでした。APIエンドポイントの引数やPydanticスキーマが追加された場合、それを参照する仕様書側へも迅速に反映させる必要があります。
**アクション:** API側のモデル (`app/schemas/diaper.py` 等) やルーター (`app/routers/diaper.py` 等) に変更が入った際には、対応する `.specify/specs/` 下の仕様書 (今回であれば `diaper_tracker.md`) も同期して更新・確認するプロセスを徹底します。

## 2024-05-18 - [マイルストーン記録API仕様と実装の乖離の発見]

**学び:** マイルストーン機能（`app/routers/milestones.py`）において、仕様書（`milestone_tracker.md`）では更新メソッドが `PUT` と記載され、さらに `timeline` のグループ化取得エンドポイントや、具体的なリクエスト・レスポンスのスキーマ定義が完全に欠落していました。特に `POST` 時に `baby_id` をリクエストボディではなくクエリパラメータから受け取る実装（スキーマ定義では `baby_id` が存在しない）は特有の挙動であり、これが仕様書に記載されていないとフロントエンドの実装や将来の拡張で混乱を招く原因となります。
**アクション:** `milestone_tracker.md` を更新し、`PUT` を `PATCH` に修正するとともに、不足していた `GET /api/milestones/timeline` エンドポイント、および `MilestoneCreate`, `MilestoneUpdate`, `MilestoneResponse`, `MilestoneTimelineGroup` のスキーマ定義を追記しました。今後、他のトラッカー仕様書も同様に、特有のパラメータ渡し方（クエリ vs ボディ）や便利機能としてのグループ化APIが漏れていないか定期的に照合・補完するようにします。

## 2026-03-05 - [リクエストスキーマ（Update用）の仕様化漏れとヘッダーの不一致]

**学び:**

- 仕様書において、見出しには `SleepCreate / SleepUpdate` や `FeedingCreate, FeedingUpdate` のように `Update` スキーマの存在が明示されているにもかかわらず、実際のコードブロック内には `Create` のスキーマのみが記載され、`Update` スキーマが完全に欠落しているパターンが見つかった。
- これにより、フロントエンドエンジニアが部分更新（PATCH/PUT）を実装する際に、どのフィールドが省略可能かをバックエンドの実装から直接読み解く必要が生じていた。

**アクション:**

- 見出し（Header）と内容（Body）の整合性を確認する。見出しで複数のスキーマを列挙している場合は、必ずそれぞれに対応する定義がコードブロック内に存在することを確認・補完する。
- API仕様の更新時は、作成（Create）と更新（Update）のスキーマをセットで明記する。

## 2026-03-05 - [AI関連仕様書におけるスキーマ定義の欠落]
**学び:** AIが生成する日誌（daily_diary.md）など、バックエンドのみで処理されるロジックに重点を置いた仕様書では、フロントエンドとのインターフェースとなるRequest/Responseスキーマの定義（DailySummaryCreate/Edit/Response等）が仕様書から欠落しやすいパターンがあることが判明した。
**アクション:** 新しい機能、特にAIを活用した機能の仕様書をレビューする際は、バックエンドのロジックだけでなく、フロントエンドとやり取りするための完全なTypeScript/Pydanticスキーマ定義が含まれているかを必ず確認し、必要に応じて追記する。

## 2026-03-02 - [スキーマ変更時の設定画面仕様書への反映漏れ]
**学び:** バックエンドのPydanticモデル（例: `BabyUpdate`）やDBモデルに新しいフィールド（通知の閾値 `feeding_threshold_minutes`, `diaper_threshold_minutes` など）が追加された際、APIのドキュメント（スキーマ定義）だけでなく、それを管理する「設定画面の仕様書」（例: `baby_settings.md` のフォーム項目やzodスキーマ）への反映が漏れやすい。特に設定画面は多くのプロパティを扱うため、1つのフィールドの追加が見落とされがちである。
**アクション:** DBモデルやAPIスキーマに新しいプロパティを追加した際は、それがユーザーによって編集可能な場合、必ず対応する設定画面（Settings）の仕様書もセットで更新し、UI（フォームフィールドやバリデーション）との整合性を保つようにする。

## 2023-10-27 - [TypeScriptインターフェースとPydanticモデルの継承構造の同期]
**学び:** マイルストーン記録機能の仕様書において、TypeScriptのインターフェースがバックエンドのPydanticモデルの継承構造（`Base` クラスの利用など）を正しく反映していないことによる定義の冗長化や不一致が発生しやすい。例えば、`image_urls` がPythonコードでは `[]` がデフォルトでありながら、仕様書では `?` (Optional) として記載されていたり、`Create` や `Response` が個別にフィールドを再定義していたりする。
**アクション:** 今後の仕様書の更新時には、単にエンドポイントとスキーマ名を記載するだけでなく、バックエンドのPydanticの継承構造（例：`MilestoneBase` -> `MilestoneCreate` 等）を正確にTypeScriptのインターフェース設計（`interface MilestoneBase`, `extends MilestoneBase`）に反映させることで、冗長なフィールド定義を防ぎ、実装との一貫性を維持する。

## 2026-03-05 - [スケジュールAPIにおける更新機能（PATCH/PUT）とUpdateスキーマの欠如の発見]

**学び:**

- スケジュール機能（`app/routers/schedule.py`）において、バックエンド実装を確認したところ、スケジュールの更新機能（`PATCH` または `PUT` エンドポイント）および更新用のPydanticスキーマ（`ScheduleUpdate`）が存在しないことが判明した。
- 仕様書（`schedule_tracker.md`）は現在バックエンドに実装されている `ScheduleCreate` と `ScheduleResponse` のみ正しくマッピングされていたが、機能要件として通常期待される「編集機能」が欠落しているという、実装レベルの不足がそのまま仕様書に反映されていた状態であった。

**アクション:**

- `schedule_tracker.md` を更新し、`title`（最大100文字）や `description`（最大2000文字）などの正確なバリデーションルールを追記した。
- また、APIセクションに「現在、スケジュールを更新するためのPATCH/PUTエンドポイントおよび `ScheduleUpdate` スキーマはバックエンドに未実装である」旨の警告（注意書き）を明記し、将来的に編集機能を追加する際の混乱を防ぐようにした。
- 今後仕様書を確認する際は、Create・Deleteだけでなく、対象リソースのUpdate機能が実装されているか（存在しない場合は意図的なものか、単なる実装漏れか）を確認し、未実装であればその旨をドキュメントに明記する。

## 2026-03-05 - [スケジュールAPI仕様と実装の乖離の発見]

**学び:**

- スケジュール機能（`app/routers/schedule.py`）において、バックエンドではリクエスト・レスポンス用のPydanticモデル（`ScheduleCreate`, `ScheduleResponse`）が定義され使用されているにもかかわらず、仕様書（`schedule_tracker.md`）には「リクエスト/レスポンススキーマ」のセクション自体が存在せず、TypeScriptのインターフェース定義が完全に欠落していました。
- 他のトラッカー（Growth, Milestone, Vaccinationなど）で見られた「スキーマ定義の欠落」というパターンが、スケジュール機能の仕様書にも同様に残存していることが確認されました。

**アクション:**

- `schedule_tracker.md` を更新し、「リクエスト/レスポンススキーマ」セクションを新設。`ScheduleCreate` と `ScheduleResponse` のTypeScriptインターフェースを、既存のPydanticモデルに合わせて正確に定義しました（`extends` を使用した継承パターンの適用を含む）。
- 今後の仕様書のレビューや新規作成においては、エンドポイントのパスやメソッドだけでなく、対応する完全なデータモデル（Request/Response Schema）が記述されているかを徹底して確認します。

## 2026-03-05 - [授乳記録API仕様のレスポンスモデルとバックエンド実装の継承構造の同期]

**学び:**

- 授乳記録（`app/routers/feeding.py`）において、バックエンドのPydanticモデル（`app/schemas/feeding.py`）ではレスポンススキーマ（`FeedingResponse`）がリクエストスキーマ（`FeedingCreate`）を継承（`class FeedingResponse(FeedingCreate):`）して重複フィールドを省略しているにもかかわらず、仕様書（`.specify/specs/tracking/breastfeeding_tracker.md`）ではすべてのプロパティが再定義されており、冗長になっていた。
- これは他ドメイン（Growth, Milestone, Scheduleなど）でも頻出している、仕様書のTypeScriptインターフェースと実装モデルの継承構造の乖離パターンである。

**アクション:**

- `breastfeeding_tracker.md` の `FeedingResponse` インターフェースを更新し、バックエンドの実装に合わせて `extends FeedingCreate` を使用して冗長なフィールドを削除し、一貫性を持たせた。
- 今後仕様書をレビューする際は、レスポンススキーマがリクエストスキーマを継承している場合、TypeScriptインターフェース側でも適切に `extends` を用いて冗長な記述を避けることを徹底する。

## 2026-03-05 - [赤ちゃん権限設定仕様書におけるスキーマ定義の欠落]

**学び:**
- 家族設定や赤ちゃん設定（Settings）の仕様書において、APIエンドポイントのパスやアクセス制御の記述はあるものの、リクエスト/レスポンススキーマ（TypeScriptインターフェース）の定義が完全に欠落しているパターンが見つかりました（例：`baby_permissions.md` における `BabyPermissionsResponse`, `BabyPermissionUpdate` など）。
- トラッカー機能（Growth, Milestone等）だけでなく、設定画面ドメインでも同様の乖離（スキーマ定義の漏れ）が発生しやすいことが判明しました。

**アクション:**
- 今後はトラッカー機能に限らず、Settings関連の仕様書（`baby_permissions.md`, `family_settings.md` など）をレビュー・更新する際にも、APIエンドポイントに対応する完全なデータモデル（Request/Response Schema）が TypeScript インターフェース形式で記述されているかを徹底して確認・補完します。

## 2026-03-06 - [赤ちゃん管理設定API仕様のTypeScriptスキーマ欠如の発見]

**学び:**
- 設定画面に関する仕様書（`baby_settings.md`）では、バックエンドのモデル（`BabyUpdate`など）を直接Pythonコードで示す記述のみがあり、フロントエンド向けに設計された共通の `BabyBase`, `BabyCreate`, `BabyUpdate`, `BabyResponse` の完全なTypeScriptインターフェース定義が欠如していた。
- 他の設定関連ドキュメント（`baby_permissions.md` など）でも見られた傾向だが、トラッカー（記録系機能）に比べて、設定画面に関する仕様書はスキーマ定義が省略される、またはバックエンドのモデル定義のみで済まされる傾向が強い。

**アクション:**
- 設定仕様書や新規機能ドキュメントにおいて、バックエンドのPythonモデルだけでなく、対応する完全なデータモデル（Request/Response Schema）がフロントエンド側からどう扱われるかを示すTypeScriptインターフェースとして `extends` などを用いて正しく記述されているかを必ず確認・補完する。

## 2024-05-19 - 予防接種機能などの新しい記録タイプの権限設定漏れ
**学び:** 新しい記録タイプ（例：`vaccination`）をシステムに追加し、API側で `verify_baby_access(..., record_type="vaccination")` と呼び出す実装がされても、`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `.specify/specs/settings/baby_permissions.md` の仕様に追記することが漏れやすい。これにより、フロントエンドや権限設定画面から新しい記録タイプの可視性を制御できなくなるバグが発生しうる。
**アクション:** 新規の記録・トラッカー機能を追加する際は、必ず権限設定（`VALID_RECORD_TYPES` と `baby_permissions.md`）にもその新しい `record_type` を追加するよう、仕様書レビューやプルリクエストのチェックリストに含める。

## 2026-03-07 - [Settings UI/Tracker] ValidRecordType の仕様ドリフト
**学び:** 新規のレコードタイプ（例: `note`, `vaccination`など）が追加され、バックエンドのルーターロジック(`app/routers/baby_permissions.py`)に権限対象として組み込まれた際、`.specify/specs/settings/baby_permissions.md` などのフロントエンド向けTypeScriptインターフェース定義(`ValidRecordType`等)から漏れやすい。
**アクション:** 権限・設定機能の仕様書を更新する際は、必ずバックエンドルーター内の有効なリスト（例: `valid_types`）と突合し、型定義を同期させる。

## 2026-03-08 - [新しい記録タイプの権限管理リストからの漏れ]
**学び:** `note` や `vaccination` のような新しい記録タイプが追加された際、仕様書（`baby_permissions.md`）には追加されていても、バックエンド側の `VALID_RECORD_TYPES` やルーター内の `valid_types`, `record_types` などの直接的な文字列リストに追加し忘れる実装漏れが発生しやすい。
**アクション:** 新しい記録タイプを追加する際は、権限モデルやルーターの実装（`baby_permission.py`, `baby_permissions.py`）内のハードコードされたリストにも追加されているか必ず確認・同期する。

## 2026-03-08 - baby_permissions.md の ValidRecordType 更新
**学び:** 新しい記録タイプ（今回は vaccination, note）が追加された場合、対応するスキーマ（`VALID_RECORD_TYPES`）やルーターでリストが更新されても、関連する仕様書（`baby_permissions.md` など）の型定義やサンプルJSONへの追記が漏れやすい。
**アクション:** 新たな機能や列挙型（定数）を追加・更新した際には、`.specify/specs/` 配下の関連ドキュメントの型定義やJSONレスポンス例の記載が追随しているか、必ず確認するようにする。

## 2024-03-05 - 家族メンバー設定スキーマのPydantic V2/拡張対応漏れ
**学び:** `app/schemas/family.py` で `FamilyMemberResponse` に `display_name` が追加され、Pydantic V2 に合わせて `model_config = ConfigDict(from_attributes=True)` へ移行されたにもかかわらず、対応する `.specify/specs/settings/family_settings.md` の仕様書が V1 構文および古いフィールド構成のままになっていた。モデル拡張やPydanticメジャーアップデート時は、仕様書側も同様にアップデートする必要がある。
**アクション:** 今後の仕様書更新では、各ドメインの `Response` モデルにフィールドが追加されていないか、Pydantic v2 の `model_config` 表記に移行されていないかを優先的に確認する。

## 2026-03-08 - [Pydantic v2形式(ConfigDict)への仕様書の追随漏れ]
**学び:** `app/schemas/` 以下の多くのモデルが Pydantic v2 の `model_config = ConfigDict(from_attributes=True)` 構文に移行されているが、仕様書（`profile_settings.md` や `record_comments.md`）では依然として v1 時代の `class Config:\n    from_attributes = True` が残存している。ライブラリのメジャーバージョンアップに伴う記法変更は、ドキュメントに一括で反映されずドリフトしやすい。
**アクション:** 今後の仕様書の更新やレビューでは、モデルのフィールド追加や削除だけでなく、ライブラリの構文（Pydantic v2 `ConfigDict` 等）が最新のバックエンド実装と一致しているかを定期的に確認し、古くなっている場合は同期を行う。

## 2026-03-08 - [新しい記録タイプ 'milestone' のアクセス権限設定・仕様書への追加漏れ]
**学び:** マイルストーン機能（`app/routers/milestones.py`）などの新しい記録タイプを追加し、API側で `verify_baby_access(..., record_type="milestone")` を呼び出す実装がされても、権限管理のリスト（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `app/routers/baby_permissions.py` 内のバリデーションリスト、フロントエンドの `ALL_RECORD_TYPES`）および仕様書 `.specify/specs/settings/baby_permissions.md` に追記することが漏れやすい。
**アクション:** 新しい機能・記録タイプを追加した際は、API実装だけでなく、権限管理APIのバリデーションや設定画面の表示ロジック、および対応する仕様書（UIモデルやTypeScriptインターフェース）すべてにその `record_type` が追加されているかを検証する。
## 2024-05-19 - [Pydantic V2構文への移行]
**学び:** バックエンドのPydanticモデルがV2構文（`model_config = ConfigDict(...)`）にアップデートされても、Markdown仕様書（`.specify/specs/`）内のコードブロックが古いV1構文（`class Config:`）のまま放置されやすい。
**アクション:** 仕様書内のPythonコードブロックにV1構文が残っていないか定期的にgrepして確認し、実装と同期させる。
## 2024-03-09 - [新しい記録タイプ 'temperature' のアクセス権限設定・仕様書への追加漏れ]
**学び:** 体温記録機能（`app/routers/temperatures.py`）が追加され、API側で `verify_baby_access(..., record_type="temperature")` を呼び出す実装がされているにもかかわらず、権限管理のリスト（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `app/routers/baby_permissions.py` 内のバリデーションリスト、フロントエンドの `ALL_RECORD_TYPES`）および仕様書 `.specify/specs/settings/baby_permissions.md` への追記が漏れていました。
**アクション:** 新しい機能・記録タイプを追加した際は、API実装だけでなく、権限管理APIのバリデーションや設定画面の表示ロジック、および対応する仕様書（UIモデルやTypeScriptインターフェース）すべてにその `record_type` が追加されているかを検証します。
## 2024-03-09 - UnifiedRecordスキーマのPydantic V2対応漏れ
**学び:** バックエンドのPydanticモデルがV2構文 (`model_config = ConfigDict(...)`) に更新されているにもかかわらず、`.specify/specs/` 内のマークダウンスキーマ定義が古いV1構文または設定自体が抜け落ちたまま放置される仕様ドリフトのパターンがある。
**アクション:** 今後データモデルの仕様書を更新する際は、対応するバックエンド側の `model_config` 定義も合わせて確認・同期する。

## 2026-03-09 - [新しい記録タイプ 'temperature' のアクセス権限設定・仕様書の先行記載の修正]
**学び:** 体温記録機能（`app/routers/temperatures.py`）が追加された際、仕様書 `.specify/specs/settings/baby_permissions.md` には `record_type` として `"temperature"` が記載されたが、実際の権限管理の実装（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `app/routers/baby_permissions.py` 内のバリデーションリスト、フロントエンドの `ALL_RECORD_TYPES`）には反映されておらず、仕様書が実装を先行する「嘘の仕様書」状態になっていた。
**アクション:** `baby_permissions.md` から未実装の `"temperature"` を削除し、現在の実装コードと100%一致させた。今後仕様書を更新する際は、対応するバックエンド側のロジックやリストに実際に追加されているかを必ず確認・同期する。

## 2026-03-10 - [ページネーション制限値（limit）の実装との乖離の発見]
**学び:** 新しいトラッカー（例：体温記録）を追加した際、バックエンドの実装は `app/core/constants.py` の `DEFAULT_PAGINATION_LIMIT = 20` と `MAX_PAGINATION_LIMIT = 100` を参照してバリデーションを行っているにもかかわらず、仕様書側（`temperature_tracker.md`）では単一のエンドポイントに対して `limit=100` といった任意のデフォルト値が誤って記載されるケースがあることが判明した。
**アクション:** ページネーションを伴うAPIの仕様書を更新・レビューする際は、仕様書内にハードコードされた任意の `limit` パラメータが、プロジェクト全体で定義・強制されている定数（`constants.py` の `DEFAULT_PAGINATION_LIMIT` や `MAX_PAGINATION_LIMIT`）と完全に一致しているかを必ず確認し、ズレがないように同期する。
## 2026-03-10 - [新しい記録タイプ 'temperature' の通知センター仕様への追加漏れ]
**学び:** 体温記録機能（`app/routers/temperatures.py`）が追加され、API側で `notify_family_members_bg` などを利用して記録時に通知を送信する実装がされているにもかかわらず、通知仕様を取りまとめている `.specify/specs/ui/notification_center.md` の各リスト（通知の種類、トリガー、URLパターン等）への追記が漏れやすい。
**アクション:** 新規の記録・トラッカー機能を追加する際は、APIや権限管理だけでなく、通知センターの仕様書（通知トリガーの対応表や遷移先URL設計など）にも新しい `record_type` が追加されているかを検証し、同期する。

## 2026-03-10 - [新しい通知タイプ 'achievement' の通知センター仕様への追加漏れ]
**学び:** 実績機能（Achievement）の追加に伴い、`app/utils/notifications.py` で `notify_achievements_bg` 関数が実装され、`category="achievement"` として通知が送信される機能が追加されたが、通知センターの仕様書 `.specify/specs/ui/notification_center.md` 内の複数のリスト（通知の種類、通知設定との連動、トリガー、APIレスポンス型、URL設計）への追記が完全に漏れていた。
**アクション:** 新しい通知カテゴリ（type）をシステムに追加する際は、通知送信のユーティリティ関数（`app/utils/notifications.py`）だけでなく、仕様書（`.specify/specs/ui/notification_center.md`）内の複数のテーブル（種類、設定連動、DBコメント、API型、トリガー、URL設計）を網羅的に検索し、同期漏れがないように徹底する。
## 2026-03-10 - [体温記録仕様書のページネーションデフォルト値と実装の同期]
**学び:** 体温記録エンドポイント（`app/routers/temperatures.py`）の実装では、デフォルトの `limit` パラメータが `MAX_PAGINATION_LIMIT`（100）に設定されているにもかかわらず、仕様書（`temperature_tracker.md`）には誤って `limit=20` と記載されていました。
**アクション:** 仕様書内のハードコードされた `limit` パラメータのデフォルト値を、バックエンドの実装に合わせ `100` へ修正しました。今後は API ルーターの `Query(...)` のデフォルト値と仕様書の記載が一致しているかを常に確認します。

## 2026-03-11 - [統合タイムラインAPIのPOSTエンドポイントの仕様書欠落]
**学び:**
- 統合タイムライン（`app/routers/baby.py`）において、一覧取得エンドポイント（`GET /api/babies/{id}/records`）とレスポンススキーマ（`UnifiedRecord`）は仕様書（`.specify/specs/ui/dashboard.md`）に記載されていたが、同ファイル内で定義されているクイック記録作成用のエンドポイント（`POST /api/babies/{id}/records`）およびリクエストスキーマ（`RecordCreate`）が完全に欠落していた。
- トラッカーのメインエンドポイントとは別に、ダッシュボード等で横断的に利用される統合APIの場合、取得（GET）は記載されても更新・作成（POST/PATCH）の仕様が漏れるパターンがある。
**アクション:**
- `dashboard.md` のAPI仕様セクションに、`POST /api/babies/{id}/records` と `RecordCreate` スキーマのTypeScriptインターフェースを追記した。横断APIや統合APIの仕様書を確認する際は、必ずCRUD全体（特にPOST/PUT）が実装に沿って網羅されているかを確認する。

## 2026-03-11 - [統合タイムラインAPIレスポンススキーマの仕様と実装の乖離の発見]
**学び:**
- 統合タイムライン（`app/routers/baby.py`）で返される `UnifiedRecord` モデルに `updated_at` フィールドが追加されているにもかかわらず、仕様書（`dashboard.md`, `system_design.md`, `record_comments.md`）のインターフェースやクラス定義に追記することが漏れていました。
- 既存のモデルに対して、作成日時や更新日時などの共通フィールドを追加した場合、そのモデルが複数の仕様書で参照されていると、修正漏れが発生しやすいパターンがあります。
**アクション:**
- 該当する3つの仕様書の `UnifiedRecord` の定義に `updated_at` を追加し、バックエンドの実装と同期させました。今後は共通のレスポンスモデルにフィールドを追加した際は、それが参照されている全てのドキュメント（UI、システム設計、各機能仕様）で定義が更新されているかを必ず確認するようにします。
## 2024-03-12 - [BabyPermissions Spec Drift]
**学び:** 新しい記録タイプ（今回は体温）が追加された際に、BabyPermissionsの仕様書（.specify/specs/settings/baby_permissions.md）内の ValidRecordType や有効値一覧表への追加が漏れやすいパターンの発見。
**アクション:** 仕様書側のテーブル定義や型定義にも新しい記録タイプを追加し、バックエンドのバリデーション定義との同期を保つ。

## 2025-02-14 - 未実装の仕様（Ghost Features）の削除
**学び:** 新規の機能（今回であれば temperature レコード）が、フロントエンドやバックエンドに実装される前に仕様書（baby_permissions.md 等）に「ahead-of-time」で記載されてしまう仕様の乖離パターンがある。実装側（VALID_RECORD_TYPES 等）に存在しない機能は、仕様の真実性を保つために削除すべきである。
**アクション:** 権限や定数リストの仕様を更新する際は、必ずバックエンドの Pydantic Schema およびフロントエンドの tracking list（ALL_RECORD_TYPES など）の実装状況を確認し、乖離を防ぐ。
## 2026-03-13 - [新しい記録タイプ 'temperature' のアクセス権限設定・仕様書への追加漏れ再発]
**学び:** 過去にも同様の指摘（2024-03-09, 2026-03-09等）があったが、体温記録機能（`temperature`）の追加に際して、仕様書（`baby_permissions.md`）には追記されていたものの、実際に権限を管理・検証するバックエンドコード（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` および `app/routers/baby_permissions.py` の `valid_types`）や、フロントエンドでの設定画面の表示を制御するコード（`frontend/hooks/usePermissionsPage.ts` の `ALL_RECORD_TYPES`）への追加が依然として漏れていた。仕様書だけが更新され、実装が伴っていない「嘘の仕様書」状態となっていた。
**アクション:** `VALID_RECORD_TYPES`, `valid_types`, および `ALL_RECORD_TYPES` に `"temperature"` を追加し、仕様書と実装を同期させた。今後は、仕様書に新しい `record_type` が追加されているのを見つけた場合、それが実際にコード上で権限管理の対象としてリストに追加されているかを必ず確認する。

## 2026-03-13 - [新しい記録タイプ 'temperature' のアクセス権限設定・仕様書の先行記載の修正]
**学び:** 体温記録機能（`temperature`）に関連して、仕様書 `.specify/specs/settings/baby_permissions.md` には `record_type` として `"temperature"` が先行して追加記載されていましたが、実際の権限管理の実装コード（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `app/routers/baby_permissions.py` の `valid_types` リスト、フロントエンドの `ALL_RECORD_TYPES` など）には反映されておらず、仕様書が実装を先行する「嘘の仕様書」状態になっていました。
**アクション:** `baby_permissions.md` から未実装の `"temperature"` を削除し、現在の実装コードと100%一致させました。今後仕様書を更新する際は、対応するバックエンド側のロジックやリストに実際に追加されているかを必ず確認・同期します。

## 2026-03-13 - [新しい記録タイプ 'temperature' のアクセス権限設定・仕様書の先行記載の修正]
**学び:** 体温記録機能（`temperature`）に関連して、仕様書 `.specify/specs/settings/baby_permissions.md` には `record_type` として `"temperature"` が先行して追加記載されていましたが、実際の権限管理の実装コード（`app/schemas/baby_permission.py` の `VALID_RECORD_TYPES` や `app/routers/baby_permissions.py` の `valid_types` リスト、フロントエンドの `ALL_RECORD_TYPES` など）には反映されておらず、仕様書が実装を先行する「嘘の仕様書」状態になっていました。
**アクション:** `baby_permissions.md` から未実装の `"temperature"` を削除し、現在の実装コードと100%一致させました。今後仕様書を更新する際は、対応するバックエンド側のロジックやリストに実際に追加されているかを必ず確認・同期します。

## 2026-03-14 - [Profile Settings Spec Drift - UserResponse missing fields]
**学び:** `app/schemas/user.py` の `UserResponse` モデルに `role` や `is_superadmin` フィールドが追加されているにもかかわらず、`.specify/specs/settings/profile_settings.md` に記載されている `UserResponse` 定義にはこれらのフィールドが欠落していた。共通レスポンスモデルの機能拡張時（管理者ロールの導入等）、対応する各仕様書への追記が漏れやすい。
**アクション:** 今後、共通のレスポンスモデル（特に `UserResponse` や `FamilyMemberResponse` など）に変更があった場合は、それが参照されている全てのマークダウン仕様書（設定系ドキュメント等）を検索し、漏れなく更新・同期するようにする。

## 2026-03-14 - [PWAプッシュ通知仕様書における新機能の追記漏れ]
**学び:** 体温記録や実績解除機能が追加された際、アプリ内通知仕様書（`notification_center.md`）が更新されていても、PWA向けのプッシュ通知仕様書（`pwa_notifications.md`）の「通知項目一覧」には追記が漏れやすい。特に記録タイプが「family_record」カテゴリに属する場合、独立した行としての追加が見落とされがちである。
**アクション:** 通知機能に関連する新しい記録タイプやカテゴリを追加する際は、`notification_center.md` だけでなく `pwa_notifications.md` などのインフラ・PWA関連の仕様書にも通知項目が網羅されているかを必ず確認・同期する。

## 2024-03-16 - [設定] baby_permissions.md と実装の乖離修正
**学び:** 新しい記録タイプ（例: `temperature`）が追加された場合、各機能（この場合は `app/routers/temperatures.py` や `app/models/temperature.py`）は実装されるが、`baby_permissions.md` のような権限管理の仕様書への追記が漏れやすい。特に `record_type` の有効値一覧は、APIの連携にも関わるため、実装が先行しドキュメントと不整合が起きる。ただし、仕様書への追記は実装と対応させる必要があり、コード自体の更新（`app/schemas/baby_permission.py` など）は Scribe の責務外である。
**アクション:** 仕様書 `.specify/specs/settings/baby_permissions.md` の `record_type` 一覧に `temperature` を追記し、コード（`app/routers/temperatures.py` 内の `record_type="temperature"` の使用）と整合させた。今後も新しい記録タイプが実装された際には、`baby_permissions.md` にも対応する値が含まれているか確認する。

## 2024-03-16 - [プロフィール設定仕様書の仕様乖離 - FamilyMemberResponseのUserRole反映漏れ]
**学び:** `app/schemas/family.py` の `FamilyMemberResponse` モデルで `role` フィールドの型が `str` から `UserRole` Enumにアップデートされているにもかかわらず、対応する仕様書 `.specify/specs/settings/profile_settings.md` では古い型 `str` が残っていた。`family_settings.md` は更新されていたため、モデルが複数の仕様書に記載されていると片方の更新が漏れやすい。
**アクション:** 今後、共通のレスポンスモデルのフィールド型（特にEnumへの移行など）に変更があった場合は、それが参照されている全てのマークダウン仕様書を検索し、漏れなく更新・同期するようにする。

## 2024-05-18 - [AI設定のAPIスキーマ定義追加]
**学び:** `ai_settings.md` に、バックエンドのPydanticスキーマ（`AISettingResponse`, `AISettingsPatch`, `AIModel`, `AISettingsSummary`）に対応するTypeScriptのインターフェース定義（`AISettings`, `AIModel`, `AISettingsSummary`, `AISettingsPatch`）が欠落している仕様乖離パターン（Specification Drift）を発見しました。
**アクション:** 次回以降、新しい設定ページや機能が追加される際に、APIのエンドポイント定義だけでなく、リクエストとレスポンスの型定義（TypeScript interface）が仕様書に記載されているか確認します。

## 2024-05-19 - AI設定仕様書の権限モデルのズレ (SuperAdmin)
**学び:** `admin` ロールから `SuperAdmin` (is_superadmin) への権限モデルの移行や、それに伴うルーティングの変更 (`/settings/ai` -> `/admin/ai`) が行われた場合、仕様書が古いまま取り残される「Specification Drift」が発生しやすい。
**アクション:** 新しい機能が `SuperAdmin` 向けに追加されたり、既存機能が `SuperAdmin` に移行したりした場合は、関連する仕様書の権限記述とフロントエンドのルート設計を必ず見直す。
