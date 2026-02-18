# 汎用メモ機能 仕様書 (General Memo Specification)

## 概要

授乳、睡眠、おむつといった特定のカテゴリーに分類されない、日々の気づき、赤ちゃんの様子、親の感情などを自由に記録できる汎用的なメモ機能。
記録されたメモはAI育児日誌（Daily Summary）の生成ソースとして活用され、赤ちゃんの中長期的な「特徴（characteristics）」の更新にも寄与する。

---

## 背景・設計方針

- **特定の記録に縛られない自由な記述**: 「今日はじめて笑った」「なんだか機嫌が悪い」といった、既存の記録項目（授乳、おむつ等）のメモ欄には書きにくい内容を保存する場所を提供する。
- **感情の記録**: 親の感情（嬉しかったこと、大変だったこと）を残すことで、後で振り返った際に当時の状況をより鮮明に思い出せるようにする。
- **AIとの連携強化**: 定量的なデータ（回数や量）だけでなく、定性的なデータ（様子や感情）をAIに与えることで、より温かみがあり正確な日誌生成と特徴把握を実現する。

---

## ユーザーストーリー

- **日々の小さな成長を逃したくない**
    - ユーザーは、おむつ替えや授乳のタイミングとは関係なく、ふとした瞬間の成長（例：おもちゃを握った）を記録したい。
    - **Acceptance Criteria**: ダッシュボードや記録一覧から、いつでも自由にメモを投稿できること。

- **AIに今の状況を正確に把握してほしい**
    - ユーザーは、「最近夜泣きが続いていて辛い」といった感情や状況をメモすることで、AI日誌にその労いを反映してほしい。
    - **Acceptance Criteria**: メモの内容がAI日誌生成時のプロンプトに含まれ、文章に反映されること。

- **赤ちゃんの特徴を自動で更新してほしい**
    - ユーザーは、「最近よく右側を向く」といったメモから、AIが「右を向く癖がある」という特徴を抽出してほしい。
    - **Acceptance Criteria**: メモの内容が `update_baby_characteristics` の解析対象に含まれること。

---

## 権限制御

汎用メモは `baby_permissions.md` で定義される権限制御システムに統合される。

- **`record_type`**: `"note"` として新しく定義する。
- **閲覧制限**: admin 以外のユーザーに対して、赤ちゃん単位または `"note"` タイプ単位で閲覧を制限することが可能。
- **アクセス検証**: すべてのエンドポイントで `verify_baby_access(db, baby_id, current_user.id, record_type="note")` を使用して検証を行う。

---

## データベース設計

### 新規テーブル: `notes`

既存の `Feeding`, `Sleep`, `Diaper` 等の `notes` カラムとは別に、独立した記録として管理する。

```python
# app/models/note.py

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from .base import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    baby_id = Column(Integer, ForeignKey("babies.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)          # メモ内容（最大2000文字）
    note_time = Column(DateTime, nullable=False, server_default=func.now(), index=True) # 記録日時
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
```

---

## バックエンド設計

### API エンドポイント

既存の記録（Feeding, Diaper等）と同様の構造を採用する。

| メソッド | パス | 概要 |
|---------|-----|------|
| `GET` | `/api/babies/{baby_id}/notes` | メモ一覧取得（履歴） |
| `POST` | `/api/babies/{baby_id}/notes` | メモの新規登録 |
| `PATCH` | `/api/notes/{note_id}` | メモの編集 |
| `DELETE` | `/api/notes/{note_id}` | メモの削除 |

### バリデーション

- **`content`**: 1文字以上 2000文字以内。
- **`note_time`**: 未来の日時は原則として許可しない。ただし、クライアントとサーバーの時刻同期のズレを考慮し、5分以内の未来日時は許容する。

---

## AI 連携設計

### 1. 日誌生成プロンプトへの統合

`app/services/ai_summary.py` の `build_daily_prompt` を修正し、対象日の `Note` を取得してプロンプトに含める。

**プロンプト構成例**:

```text
【その他の様子・メモ】
  10:30 今日ははじめて自分の足を見つけて不思議そうにしていた。
  18:00 夕方から少し機嫌が悪く、抱っこでないと泣き止まなかった。
```

### 2. 赤ちゃんの特徴（Characteristics）更新への統合

`update_baby_characteristics` 呼び出し時に、その日の `Note` の内容も解析対象の `daily_record_text` に含めることで、新しい特徴の抽出や既存特徴の更新精度を高める。

---

## フロントエンド設計

### UI 構成

- **メモ一覧ページ (`/note`)**:
    - **アクセス**: ダッシュボードの「メモ」ウィジェット、またはサイドメニューから遷移。
    - **機能**:
        - **新規作成**: ページ上部にメモ投稿フォームを配置。
        - **履歴一覧**: 全てのメモを時系列降順で表示。
        - **編集・削除**: 各メモのカード内にある編集ボタン・削除ボタンから操作。
- **ダッシュボード**:
    - **メモウィジェット**: 最新のメモ内容を表示し、クリックすると一覧ページへ遷移する。
    - **最近の記録 (RecentActivityFeed)**: メモも他の記録と同様に表示。長文は2行まで表示し、タップで詳細ダイアログを表示して全文確認・編集が可能。

### インタラクション

- **入力フォーム**:
    - リアルタイムバリデーション（必須、最大2000文字）。
    - 送信中はボタンを無効化し、多重送信を防止。
- **編集**:
    - ダイアログ内で内容と日時を修正可能。
- **削除**:
    - 誤操作防止のため、確認ダイアログを表示してから実行。
    - 削除処理中は確認ダイアログの「削除」「キャンセル」ボタンを無効化し、二重送信を防ぐ。

---

## 実装上の注意点

- **検索性**: メモ単体でのキーワード検索などは将来的な拡張として考慮し、まずは時系列での表示を優先する。
- **重複記録**: 同一時間に複数のメモを許容する（既存の育児記録と同様）。

---

## 参照先ドキュメント

- `.specify/specs/ai/ai_daily_summary.md` — AI日誌生成の詳細仕様
- `.specify/specs/infrastructure/system_design.md` — 全体アーキテクチャ
- `.specify/specs/settings/baby_permissions.md` — 権限制御
