from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from .base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 handles up to 45 chars
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship("User", backref="audit_logs")

    def __repr__(self):
        return f"<AuditLog(action='{self.action}', user_id={self.user_id})>"
