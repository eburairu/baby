# 育児日誌（AIまとめ）機能 仕様書 (Daily Diary Specification)

## 概要

日々の育児記録（授乳、睡眠、おむつ、メモ等）をAIが解析し、1日ごとの「まとめ」として生成・表示する機能。
生成した日誌はユーザーが手動編集でき、任意の日付の日誌を一覧・閲覧・削除できる。
忙しい親が後で振り返りやすく、また家族間での状況共有をスムーズにすることを目的とする。

---

## 背景・設計方針

- **振り返りの自動化**: 個別の細かい記録を繋ぎ合わせ、その日の流れや特徴（例：「今日は午前中によく寝た」「午後は機嫌が良かった」）を文章化する。
- **編集の柔軟性**: AIが生成した内容をユーザーが手動で修正・追記できるようにする。
- **視認性の向上**: ダッシュボードから最新の日誌に素早くアクセスできるようにし、他の記録と同様の「一目でわかる」UIを提供する。
- **AI 連携**: 生成ロジックやプロンプトの詳細は `.specify/specs/ai/ai_daily_summary.md` を参照。

---

## ユーザーストーリー

- **今日の流れを家族に共有したい**
    - ユーザーは、仕事中のパートナーに「今日の赤ちゃんがどんな様子だったか」を短い文章で伝えたい。
    - **Acceptance Criteria**: 記録に基づいた日誌がワンタップで生成され、共有できること。

- **過去の記録を楽しく振り返りたい**
    - ユーザーは、数ヶ月後に「この時期はどんな感じだったかな」とカレンダー感覚で振り返りたい。
    - **Acceptance Criteria**: 日付ごとにまとめられた日誌一覧（`/diary`）が閲覧できること。

- **手動で日記を残したい・修正したい**
    - ユーザーは、AIが生成した文章に自分の感想を加えたり、AIが生成していない日でも自分で日記を書きたい。
    - **Acceptance Criteria**: 生成済みの日誌を編集でき、編集済みフラグ（`is_edited`）が管理されること。

---

## 用語定義

| 用語 | 定義 |
|------|------|
| `generated_content` | AI が生成した日誌テキスト（不変） |
| `edited_content` | ユーザーが手動編集したテキスト（nullable） |
| `display_content` | 表示用テキスト。`edited_content ?? generated_content` |
| `is_edited` | `edited_content` が存在する場合 `true` |
| `summary_date` | 日誌の対象日（`YYYY-MM-DD`、タイムゾーンは JST） |

---

## データベース設計

### テーブル: `daily_summaries`

```python
# app/models/ai_summary.py

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    summary_date = Column(Date, nullable=False)
    generated_content = Column(Text, nullable=False)
    edited_content = Column(Text, nullable=True)
    is_edited = Column(Boolean, nullable=False, default=False)
    model_name = Column(String, nullable=True)          # 生成に使用したモデル名
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("baby_id", "summary_date", name="uix_daily_summary_baby_date"),
        Index("idx_daily_summary_baby_date", "baby_id", "summary_date"),
    )
```

---

## バックエンド設計

### API エンドポイント

| メソッド | パス | 概要 |
|---------|-----|------|
| `POST` | `/api/babies/{baby_id}/daily-summary` | 日誌の AI 生成（詳細は `ai_daily_summary.md`） |
| `GET` | `/api/babies/{baby_id}/daily-summary` | 日誌一覧取得 |
| `GET` | `/api/babies/{baby_id}/daily-summary/{date}` | 指定日の日誌取得 |
| `PATCH` | `/api/babies/{baby_id}/daily-summary/{date}` | 日誌の手動編集 |
| `DELETE` | `/api/babies/{baby_id}/daily-summary/{date}` | 日誌の削除 |

---

## フロントエンド設計

### 1. ダッシュボードウィジェット (`DiaryWidget`)
- 最新（今日または直近）の日誌の内容を一部表示。
- アクション: 全文表示（ダイアログまたはページ遷移）。

### 2. 日誌一覧ページ (`/diary`)
- カレンダーまたはリスト形式で過去の日誌を表示。
- 未来の日付は選択不可。
- 「日誌を生成」ボタンにより AI 生成プロセスを開始。

### 3. 編集ダイアログ (`DiaryEditDialog`)
- テキストエリアによる編集。空欄保存で AI 生成内容にリセット。

---

## 権限制御

- `verify_baby_access(db, baby_id, current_user.id)` を使用。
- 閲覧制限設定（Admin/Member）に従う。

---

## 参照先ドキュメント

- `.specify/specs/ai/ai_daily_summary.md` — AI 生成ロジック・プロンプト・特徴更新
- `.specify/specs/social/diary_image_upload.md` — 日誌への画像添付機能
- `.specify/specs/tracking/general_memo.md` — ソースとなるメモの仕様
