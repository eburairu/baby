"""アプリ内通知センターの通知生成サービス"""
from sqlalchemy.orm import Session
from app.models.notification import AppNotification
from app.models.family import FamilyUser


def _create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    body: str | None = None,
    url: str | None = None,
) -> None:
    notification = AppNotification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        url=url,
    )
    db.add(notification)


def notify_family_record(
    db: Session,
    actor_user_id: int,
    family_id: int,
    title: str,
    body: str | None = None,
    url: str | None = None,
) -> None:
    """記録追加時に、同ファミリーの記録者以外の全メンバーへ通知を生成する"""
    members = db.query(FamilyUser).filter(
        FamilyUser.family_id == family_id,
        FamilyUser.user_id != actor_user_id,
    ).all()

    for member in members:
        _create_notification(
            db=db,
            user_id=member.user_id,
            type="family_record",
            title=title,
            body=body,
            url=url,
        )


def notify_comment(
    db: Session,
    actor_user_id: int,
    record_owner_user_id: int,
    title: str,
    body: str | None = None,
    url: str | None = None,
) -> None:
    """コメント追加時に記録オーナーへ通知を生成する（自己コメントは除外）"""
    if actor_user_id == record_owner_user_id:
        return

    _create_notification(
        db=db,
        user_id=record_owner_user_id,
        type="comment",
        title=title,
        body=body,
        url=url,
    )


def notify_daily_summary(
    db: Session,
    family_id: int,
    title: str,
    body: str | None = None,
    url: str | None = None,
) -> None:
    """デイリーサマリー生成時に同ファミリーの全メンバーへ通知を生成する"""
    members = db.query(FamilyUser).filter(
        FamilyUser.family_id == family_id,
    ).all()

    for member in members:
        _create_notification(
            db=db,
            user_id=member.user_id,
            type="daily_summary",
            title=title,
            body=body,
            url=url,
        )
