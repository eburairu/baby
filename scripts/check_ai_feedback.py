#!/usr/bin/env python
"""
AI フィードバック手動検証スクリプト

実際の AI API（Gemini 等）を叩いて generate_record_feedback の動作を確認する。
pytestには含まれない。任意のタイミングで手動実行する。

使い方:
    python scripts/check_ai_feedback.py [record_type]

    record_type: feeding (デフォルト) / diaper / note
"""
import os
import sys
from datetime import datetime, timedelta, timezone

# プロジェクトルートを sys.path に追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# DATABASE_URL を設定（インメモリ SQLite 使用）
os.environ.setdefault("DATABASE_URL", "sqlite://")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401（全モデル登録）
from app.models.base import Base
from app.models.family import Family, FamilyUser
from app.models.user import User
from app.models.baby import Baby
from app.models.feeding import Feeding
from app.models.diaper import Diaper
from app.models.note import Note
from app.services.ai_feedback import generate_record_feedback


def create_db():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    return Session()


def setup_test_data(db, record_type: str):
    JST = timezone(timedelta(hours=9))
    now = datetime.now(JST)

    family = Family(name="手動検証ファミリー", invite_code="MANUAL-CHECK")
    db.add(family)
    db.commit()
    db.refresh(family)

    user = User(username="manual_check_user", hashed_password="fake_password")
    db.add(user)
    db.commit()
    db.refresh(user)

    db.add(FamilyUser(family_id=family.id, user_id=user.id, role="ADMIN"))

    baby = Baby(
        family_id=family.id,
        name="検証ベビー",
        gender="GIRL",
        birthday=(now - timedelta(days=30)).date(),
    )
    db.add(baby)
    db.commit()
    db.refresh(baby)

    record_id = None

    if record_type == "feeding":
        # 直近24時間に複数の授乳記録を作成してコンテキストを充実させる
        for hours_ago in [6, 4, 2, 0]:
            f = Feeding(
                baby_id=baby.id,
                user_id=user.id,
                feeding_time=now - timedelta(hours=hours_ago),
                feeding_type="BOTTLE",
                amount_ml=100,
                notes="テスト用授乳" if hours_ago == 0 else None,
            )
            db.add(f)
        db.commit()
        # 最新レコードのIDを取得
        latest = db.query(Feeding).filter_by(baby_id=baby.id).order_by(Feeding.id.desc()).first()
        record_id = latest.id

    elif record_type == "diaper":
        for hours_ago in [4, 2, 0]:
            d = Diaper(
                baby_id=baby.id,
                user_id=user.id,
                change_time=now - timedelta(hours=hours_ago),
                diaper_type="WET",
            )
            db.add(d)
        db.commit()
        latest = db.query(Diaper).filter_by(baby_id=baby.id).order_by(Diaper.id.desc()).first()
        record_id = latest.id

    elif record_type == "note":
        n = Note(
            baby_id=baby.id,
            user_id=user.id,
            note_time=now,
            content="元気よく遊んでいます。授乳も順調です。",
        )
        db.add(n)
        db.commit()
        record_id = n.id

    else:
        print(f"❌ 未対応の record_type: {record_type}")
        sys.exit(1)

    return baby, record_id


def main():
    record_type = sys.argv[1] if len(sys.argv) > 1 else "feeding"
    print(f"=== AI フィードバック手動検証 (record_type={record_type}) ===\n")

    db = create_db()

    print("テストデータ作成中...")
    baby, record_id = setup_test_data(db, record_type)
    print(f"  baby_id={baby.id}, record_id={record_id}\n")

    print("AI API を呼び出し中...")
    try:
        feedback, has_concern, model = generate_record_feedback(
            db, baby.id, baby.name, record_type, record_id
        )
    except Exception as e:
        print(f"❌ エラー: {e}")
        sys.exit(1)

    print(f"\n--- 結果 ---")
    print(f"Model     : {model}")
    print(f"has_concern: {has_concern}")
    print(f"Feedback  : {feedback}")

    # 簡易バリデーション
    errors = []
    if not isinstance(feedback, str) or len(feedback) < 5:
        errors.append("feedback が短すぎます")
    if "{" in feedback or "}" in feedback:
        errors.append("feedback に JSON の制御文字が含まれています")
    if not isinstance(has_concern, bool):
        errors.append("has_concern が bool ではありません")
    if not model:
        errors.append("model 名が空です")

    if errors:
        print("\n❌ 検証失敗:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\n✅ 検証OK")


if __name__ == "__main__":
    main()
