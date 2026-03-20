from sqlalchemy.orm import Session
from app.models.user import User, UserSession
import logging

logger = logging.getLogger(__name__)

def soft_delete_user(db: Session, user: User):
    """
    ユーザーを論理削除し、アクティブなセッションをすべて無効化（物理削除）する。
    """
    # ユーザーを論理削除
    user.is_deleted = True
    
    # ユーザーに紐づくすべてのセッションを削除
    deleted_sessions_count = db.query(UserSession).filter(UserSession.user_id == user.id).delete()
    
    logger.info("User soft-deleted: user_id=%s, deleted_sessions=%s", user.id, deleted_sessions_count)
    
    # NOTE: commit は呼び出し元（ルーター等）で行うことを想定
